import CategoryModel from "../model/CategoryModel.js";

// Create a new category
export const createCategoryService = async (req) => {
    try {
        
        let reqBody = req.body;
        let existingCategoryName = await CategoryModel.find({ categoryName: reqBody.categoryName });
        if (existingCategoryName.length > 0) {
            return { status: false, message: "Category name already exists, Try another one name" };
        }
        let data = await CategoryModel.create(reqBody);
        return { status: true, message: "Category created successfully", data: data };
    } catch (error) {
        return { status: false, message: "Failed to create category", error: error.message };
    }
};

// Get a single category by ID
export const getCategoryService = async (req) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return { status: false, message: "Category not found" };
        }
        return { status: true, data: category };
    } catch (error) {
        return { status: false, message: "Failed to fetch category", error: error.message };
    }
};

// Get all categories
export const getAllCategoriesService = async () => {
    try {
        const categories = await CategoryModel.find();
        return { status: true, data: categories };
    } catch (error) {
        return { status: false, message: "Failed to fetch categories", error: error.message };
    }
};

// Update category by ID
export const updateCategoryService = async (req) => {
    try {
        const category = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            return { status: false, message: "Category not found" };
        }
        return { status: true, message: "Category updated successfully", data: category };
    } catch (error) {
        return { status: false, message: "Failed to update category", error: error.message };
    }
};

// Delete category by ID
export const deleteCategoryService = async (req) => {
    try {
        const category = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!category) {
            return { status: false, message: "Category not found" };
        }
        return { status: true, message: "Category deleted successfully" };
    } catch (error) {
        return { status: false, message: "Failed to delete category", error: error.message };
    }
};
