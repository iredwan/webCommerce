import express from 'express';
import {
    createCategory,
    getCategory,
    getCategoryByIdForAdmin,
    getAllCategories,
    updateCategory,
    deleteCategoryImage,
    deleteCategory
} from '../controllers/CategoryController.js';
import { protect, restrictTo } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes
router.get('/get-all', getAllCategories);
router.get('/get/:id', getCategory);

// Protected routes
router.get('/admin/get/:id', protect, restrictTo("admin", "manager"), getCategoryByIdForAdmin);
router.post('/create', protect, restrictTo("admin", "manager"), createCategory);
router.put('/update/:id', protect, restrictTo("admin", "manager"), updateCategory);
router.patch('/delete-image/:id', protect, restrictTo("admin", "manager"), deleteCategoryImage);
router.delete('/delete/:id', protect, restrictTo("admin", "manager"), deleteCategory);

export default router;
