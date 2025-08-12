import express from "express";
import {
  createProductController,
  getAllProductsController,
  getAllProductsForPublicController,
  getProductByIdController,
  getProductByIdAdminController,
  getProductBySlugController,
  updateProductController,
  deleteProductController,
  toggleProductPublishController,
  updateProductStockController,
  searchProductsController,
  getProductsByCategoryController,
  getFeaturedProductsController,
  getRelatedProductsController,
  getProductStatsController,
  bulkUpdateProductsController,
  bulkDeleteProductsController,
  duplicateProductController,
  // Inventory & Stock Control
  addVariantController,
  getLowStockController,
  restockProductController,
  // Pricing & Discount Management
  applyDiscountController,
  removeDiscountController,
  scheduleDiscountController,
  getProductsOnSaleController,
  // Category & Tagging System
  assignCategoryController,
  addTagsController,
  // Product Status / Visibility
  featureProductController,
  // Product Analytics & Reports
  getTopSellingProductsController,
  getSlowMovingProductsController,
  getStockValuationController,
  getProductViewsController,
  incrementProductViewController,
  // Promotional & SEO Tools
  updateSlugController,
  promoteProductOnBannerController
} from "../controllers/ProductController.js";
import { protect, restrictTo } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/get-all", getAllProductsForPublicController);
router.get("/public/search", searchProductsController);
router.get("/public/featured", getFeaturedProductsController);
router.get("/public/on-sale", getProductsOnSaleController);
router.get("/public/category/:categoryId", getProductsByCategoryController);
router.get("/public/slug/:slug", getProductBySlugController);
router.get("/get/:id", getProductByIdController);
router.get("/public/:id/related", getRelatedProductsController);
router.patch("/public/:id/view", incrementProductViewController); // Track product views

// Protected routes (authentication required)
// Admin/Manager/Seller routes - Read access
router.get("/all-for-manage", protect, restrictTo("admin", "manager", "seller"), getAllProductsController);
router.get("/admin/get/:id", protect, restrictTo("admin", "manager"), getProductByIdAdminController);
router.get("/stats", protect, restrictTo("admin", "manager"), getProductStatsController);
router.get("/analytics/top-selling", protect, restrictTo("admin", "manager"), getTopSellingProductsController);
router.get("/analytics/slow-moving", protect, restrictTo("admin", "manager"), getSlowMovingProductsController);
router.get("/analytics/stock-valuation", protect, restrictTo("admin", "manager"), getStockValuationController);
router.get("/inventory/low-stock", protect, restrictTo("admin", "manager", "seller"), getLowStockController);
router.get("/:id", protect, restrictTo("admin", "manager", "seller"), getProductByIdController);
router.get("/:id/views", protect, restrictTo("admin", "manager"), getProductViewsController);
router.get("/slug/:slug", protect, restrictTo("admin", "manager", "seller"), getProductBySlugController);
router.get("/:id/related", protect, restrictTo("admin", "manager", "seller"), getRelatedProductsController);

// Admin/Manager routes - Write access
router.post("/create", protect, restrictTo("admin", "manager"), createProductController);
router.post("/:id/duplicate", protect, restrictTo("admin", "manager"), duplicateProductController);

// Inventory & Stock Control
router.post("/:id/variants", protect, restrictTo("admin", "manager"), addVariantController);
router.patch("/:id/stock", protect, restrictTo("admin", "manager"), updateProductStockController);
router.patch("/:id/restock", protect, restrictTo("admin", "manager"), restockProductController);

// Pricing & Discount Management
router.patch("/:id/discount/apply", protect, restrictTo("admin", "manager"), applyDiscountController);
router.patch("/:id/discount/remove", protect, restrictTo("admin", "manager"), removeDiscountController);
router.patch("/:id/discount/schedule", protect, restrictTo("admin", "manager"), scheduleDiscountController);

// Category & Tagging System
router.patch("/:id/category", protect, restrictTo("admin", "manager"), assignCategoryController);
router.patch("/:id/tags", protect, restrictTo("admin", "manager"), addTagsController);

// Product Status / Visibility
router.patch("/toggle/:id", protect, restrictTo("admin", "manager"), toggleProductPublishController);
router.patch("/:id/feature", protect, restrictTo("admin", "manager"), featureProductController);
router.patch("/:id/promote-banner", protect, restrictTo("admin", "manager"), promoteProductOnBannerController);

// SEO Tools
router.patch("/:id/slug", protect, restrictTo("admin", "manager"), updateSlugController);

// Bulk operations
router.put("/bulk", protect, restrictTo("admin", "manager"), bulkUpdateProductsController);
router.delete("/bulk", protect, restrictTo("admin", "manager"), bulkDeleteProductsController);

// Individual operations
router.put("/update/:id", protect, restrictTo("admin", "manager"), updateProductController);
router.delete("/:id", protect, restrictTo("admin", "manager"), deleteProductController);

export default router;
