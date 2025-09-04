import express from "express";
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  getOrderByOrderNumberController,
  getUserOrdersController,
  getMyOrdersController,
  updateOrderController,
  updateOrderStatusController,
  updatePaymentStatusController,
  deleteOrderController,
  getOrderStatsController,
  getRecentOrdersController,
  searchOrdersController,
  bulkUpdateOrdersController,
  getOrdersByDateRangeController,
  cancelOrderController,
  markOrderAsDeliveredController,
  markOrderAsShippedController,
  markOrderAsProcessingController,
  getProductPerformanceController,
  getInventoryAlertsController,
} from "../controllers/OrderController.js";
import { protect, restrictTo } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes (user authentication required)
router.post("/create", protect, createOrderController);
router.get("/my-orders", protect, getMyOrdersController);
router.get("/order-number/:orderNumber", protect, getOrderByOrderNumberController);
router.get("/get-by-id/:id", protect, getOrderByIdController);

// Customer routes - limited access to own orders
router.patch("/:id/cancel", protect, cancelOrderController); // Users can cancel their own orders

// Protected routes (authentication required)
// Admin/Manager routes - Read access
router.get("/all", protect, restrictTo("admin", "manager", "seller"), getAllOrdersController);
router.get("/stats/overview", protect, restrictTo("admin", "manager"), getOrderStatsController);
router.get("/stats/recent", protect, restrictTo("admin", "manager", "seller"), getRecentOrdersController);
router.get("/search/query", protect, restrictTo("admin", "manager", "seller"), searchOrdersController);
router.get("/date-range/filter", protect, restrictTo("admin", "manager"), getOrdersByDateRangeController);
router.get("/user/:userId", protect, restrictTo("admin", "manager"), getUserOrdersController);

// Admin/Manager routes - Write access
router.patch("/update/:id", protect, restrictTo("admin", "manager"), updateOrderController);
router.patch("/status/:id", protect, restrictTo("admin", "manager", "seller"), updateOrderStatusController);
router.patch("/payment-status/:id", protect, restrictTo("admin", "manager"), updatePaymentStatusController);

// Specific status updates
router.patch("/mark-processing/:id", protect, restrictTo("admin", "manager", "seller"), markOrderAsProcessingController);
router.patch("/mark-shipped/:id", protect, restrictTo("admin", "manager", "seller"), markOrderAsShippedController);
router.patch("/mark-delivered/:id", protect, restrictTo("admin", "manager", "seller"), markOrderAsDeliveredController);

// Bulk operations - Admin only
router.patch("/bulk/update", protect, restrictTo("admin", "manager"), bulkUpdateOrdersController);

// Analytics and Reports - Admin/Manager routes
router.get("/analytics/product-performance", protect, restrictTo("admin", "manager"), getProductPerformanceController);
router.get("/analytics/inventory-alerts", protect, restrictTo("admin", "manager"), getInventoryAlertsController);

// Admin only routes
router.delete("/:id", protect, restrictTo("admin"), deleteOrderController);

export default router;
