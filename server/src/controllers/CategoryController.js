import { createCategoryService, getCategoryService, getAllCategoriesService, updateCategoryService, deleteCategoryService } from "../services/CategoryServices.js";

// Create a new category
export const createCategory = async (req, res) => {
    const result = await createCategoryService(req);
    return res.json(result);
};

// Get a single category by ID
export const getCategory = async (req, res) => {
    const result = await getCategoryService(req);
    return res.status(result.status ? 200 : 404).json(result);
};

// Get all categories
export const getAllCategories = async (req, res) => {
    const result = await getAllCategoriesService(req);
    return res.status(result.status ? 200 : 404).json(result);
};

// Update category by ID
export const updateCategory = async (req, res) => {
    const result = await updateCategoryService(req);
    return res.status(result.status ? 200 : 400).json(result);
};

// Delete category by ID
export const deleteCategory = async (req, res) => {
    const result = await deleteCategoryService(req);
    return res.status(result.status ? 200 : 404).json(result);
};
