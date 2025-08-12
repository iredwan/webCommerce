import CategoryModel from "../model/CategoryModel.js";
import { logCategoryCreation, logCategoryUpdate, logCategoryDeletion } from "../utility/categoryAuditLogger.js";
import { generateUniqueSlug } from "../utility/slugify.js";
import { deleteFile } from "../utility/fileUtils.js";
import mongoose from "mongoose";
import AuditLog from "../model/AuditLog.js";

/**
 * Create a new category
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Result object with status and data
 */
export const createCategoryService = async (req) => {
    try {
        let reqBody = req.body;
        
        // Generate slug from category name
        reqBody.slug = await generateUniqueSlug(reqBody.categoryName, CategoryModel);
        
        // Check for existing category with same name or slug
        let existingCategory = await CategoryModel.findOne({ 
            $or: [
                { categoryName: reqBody.categoryName },
                { slug: reqBody.slug }
            ]
        });
        
        if (existingCategory) {
            return { 
                status: false, 
                message: "Category name already exists. Please try another name." 
            };
        }

        // Create new category
        let category = await CategoryModel.create(reqBody);
        
        // Log the creation
        await logCategoryCreation(req, category);

        return { 
            status: true, 
            message: "Category created successfully", 
            data: category 
        };
    } catch (error) {
        console.error("Create category error:", error);
        return { 
            status: false, 
            message: "Failed to create category", 
            error: error.message 
        };
    }
};

/**
 * Get a single category by ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Result object with status and data
 */
export const getCategoryService = async (req) => {
    try {
        const category = await CategoryModel.findById(req.params.id)
            
        if (!category) {
            return { 
                status: false, 
                message: "Category not found" 
            };
        }
        
        return { 
            status: true, 
            data: category 
        };
    } catch (error) {
        console.error("Get category error:", error);
        return { 
            status: false, 
            message: "Failed to fetch category", 
            error: error.message 
        };
    }
};

// Get Category by ID for admin with audit log
/** * Get a single category by ID for admin
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Result object with status and data
 * */
export const getCategoryByIdForAdminService = async (req) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return {
                status: false,
                message: "Category not found"
            };
        }

        // Get audit logs for this category using the static method
        const auditLog = await AuditLog.getLogsByModel('Category', category._id);

        return {
            status: true,
            data: category,
            auditLog: auditLog
        };
    } catch (error) {
        console.error("Get category error:", error);
        return {
            status: false,
            message: "Failed to fetch category",
            error: error.message
        };
    }
};

/**
 * Get all categories with optional filters
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Result object with status and data
 */
export const getAllCategoriesService = async (req) => {
    try {
        const query = {};
        const { parentCategory } = req.query;

        if (parentCategory) {
            query.parentCategory = parentCategory === 'null' ? null : parentCategory;
        }

        const categories = await CategoryModel.find(query)
            .populate('parentCategory', 'categoryName slug')
            .sort({ createdAt: -1 });

        return { 
            status: true, 
            data: categories 
        };
    } catch (error) {
        console.error("Get all categories error:", error);
        return { 
            status: false, 
            message: "Failed to fetch categories", 
            error: error.message 
        };
    }
};

/**
 * Update category by ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Result object with status and data
 */
export const updateCategoryService = async (req) => {
    try {
        const categoryId = req.params.id;
        // Get existing category for audit log
        const existingCategory = await CategoryModel.findById(categoryId);
        if (!existingCategory) {
            return { 
                status: false, 
                message: "Category not found" 
            };
        }

        let updateData = { ...req.body };
        
        // Update slug if category name is changed
        if (updateData.categoryName) {
            updateData.slug = await generateUniqueSlug(updateData.categoryName, CategoryModel);
            
            // Check if new slug already exists for other category
            const existingSlug = await CategoryModel.findOne({
                _id: { $ne: categoryId },
                slug: updateData.slug
            });
            
            if (existingSlug) {
                return { 
                    status: false, 
                    message: "Category name would create a duplicate slug. Please choose a different name." 
                };
            }
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true }
        ).populate('parentCategory', 'categoryName slug');

        // Log the update
        await logCategoryUpdate(req, categoryId, existingCategory.toObject(), updateData);

        return { 
            status: true, 
            message: "Category updated successfully", 
            data: updatedCategory 
        };
    } catch (error) {
        console.error("Update category error:", error);
        return { 
            status: false, 
            message: "Failed to update category", 
            error: error.message 
        };
    }
};

// Delete category images
/**
 * Delete category by ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Result object with status and message
 */
export const deleteCategoryImageService = async (req) => {
  try {
    const { id: categoryId } = req.params;
    const { categoryImg } = req.body;

    if (!categoryImg) {
      return { status: false, message: "Image ID is required" };
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return { status: false, message: "Invalid category ID" };
    }

    if (!mongoose.Types.ObjectId.isValid(categoryImg)) {
      return { status: false, message: "Invalid image ID" };
    }

    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return { status: false, message: "Category not found" };
    }

    const imgIndex = category.categoryImg.findIndex(img => img._id.toString() === categoryImg);
    if (imgIndex === -1) {
      return { status: false, message: "Image not found in category" };
    }

    const imgToDelete = category.categoryImg[imgIndex];

    try {
      await deleteFile(imgToDelete.image);
    } catch (fileError) {
      console.warn("File deletion failed:", fileError.message);
      // optionally return here if file deletion is mandatory
    }

    // Remove image from array
    category.categoryImg.splice(imgIndex, 1);
    await category.save();

    return {
      status: true,
      message: "Category image deleted successfully",
    };

  } catch (error) {
    console.error("Delete category image error:", error);
    return {
      status: false,
      message: "Failed to delete category image",
      error: error.message,
    };
  }
};

/**
 * Delete category by ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Result object with status and message
 */
export const deleteCategoryService = async (req) => {
    try {
        // Check if category exists and has no child categories
        const categoryId = req.params.id;
        const category = await CategoryModel.findById(categoryId);
        
        if (!category) {
            return { 
                status: false, 
                message: "Category not found" 
            };
        }

        // Check for child categories
        const childCategories = await CategoryModel.findOne({ parentCategory: categoryId });
        if (childCategories) {
            return { 
                status: false, 
                message: "Cannot delete category with subcategories. Please delete or reassign subcategories first." 
            };
        }

        // Delete category images from uploads folder
        if (category.categoryImg && category.categoryImg.length > 0) {
            const deletePromises = category.categoryImg.map(img => {
                if (img.image) {
                    // Extract filename from path if needed
                    const filename = img.image.split('/').pop();
                    return deleteFile(filename);
                }
                return Promise.resolve();
            });

            // Wait for all image deletions to complete
            await Promise.all(deletePromises);
        }

        // Delete the category from database
        await CategoryModel.findByIdAndDelete(categoryId);
        
        // Log the deletion
        await logCategoryDeletion(req, category);

        return { 
            status: true, 
            message: "Category and associated images deleted successfully" 
        };
    } catch (error) {
        console.error("Delete category error:", error);
        return { 
            status: false, 
            message: "Failed to delete category", 
            error: error.message 
        };
    }
};
