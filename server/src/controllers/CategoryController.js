import { 
    createCategoryService, 
    getCategoryService, 
    getCategoryByIdForAdminService,
    getAllCategoriesService, 
    getCategoryByNameService,
    updateCategoryService,
    deleteCategoryImageService,
    deleteCategoryService 
} from "../services/CategoryServices.js";

/**
 * Create a new category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createCategory = async (req, res) => {
    try {
        const result = await createCategoryService(req);
        return res.status(result.status ? 201 : 400).json(result);
    } catch (error) {
        console.error("Create category controller error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error while creating category"
        });
    }
};

// Get category by ID for admin
/**
 * Get a single category by ID for admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCategoryByIdForAdmin = async (req, res) => {
    try {
        const result = await getCategoryByIdForAdminService(req);
        return res.status(result.status ? 200 : 404).json(result);
    } catch (error) {
        console.error("Get category by ID for admin controller error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error while fetching category"
        });
    }
};

/**
 * Get a single category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCategory = async (req, res) => {
    try {
        const result = await getCategoryService(req);
        return res.status(result.status ? 200 : 404).json(result);
    } catch (error) {
        console.error("Get category controller error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error while fetching category"
        });
    }
};



/**
 * Get all categories with optional filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllCategories = async (req, res) => {
    try {
        const result = await getAllCategoriesService(req);
        return res.status(result.status ? 200 : 404).json(result);
    } catch (error) {
        console.error("Get all categories controller error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error while fetching categories"
        });
    }
};

// get category by categoryName
export const getCategoryByName = async (req, res) => {
    try {
        const result = await getCategoryByNameService(req);
        return res.status(result.status ? 200 : 404).json(result);
    } catch (error) {
        console.error("Get category by name controller error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error while fetching category"
        });
    }
};

/**
 * Update category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateCategory = async (req, res) => {
    try {
        const result = await updateCategoryService(req);
        return res.status(result.status ? 200 : result.message.includes("not found") ? 404 : 400).json(result);
    } catch (error) {
        console.error("Update category controller error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error while updating category"
        });
    }
};

// Delete category image
/**
 * Delete category image by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteCategoryImage = async (req, res) => {
    try {
        const result = await deleteCategoryImageService(req);
        return res.status(result.status ? 200 : 404).json(result);
    } catch (error) {
        console.error("Delete category image controller error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error while deleting category image"
        });
    }
};

/**
 * Delete category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteCategory = async (req, res) => {
    try {
        const result = await deleteCategoryService(req);
        return res.status(result.status ? 200 : result.message.includes("not found") ? 404 : 400).json(result);
    } catch (error) {
        console.error("Delete category controller error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error while deleting category"
        });
    }
};
