import express from "express";
import {
  generateInvoiceFromOrderController,
  createInvoiceController,
  getAllInvoicesController,
  getInvoiceByIdController,
  getInvoiceByNumberController,
  updateInvoiceController,
  updateInvoiceStatusController,
  recordPaymentController,
  getInvoiceStatsController,
  deleteInvoiceController,
  markInvoiceAsSentController,
  markInvoiceAsPaidController,
  cancelInvoiceController,
  getOverdueInvoicesController,
  getUserInvoicesController
} from "../controllers/InvoiceController.js";
import { protect, restrictTo } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Customer routes (authenticated users)
router.get("/my-invoices", protect, getUserInvoicesController);
router.get("/number/:invoiceNumber", protect, getInvoiceByNumberController);
router.get("/:id", protect, getInvoiceByIdController);

// Protected routes (authentication required)
// Admin/Manager/Seller routes - Read access
router.get("/", protect, restrictTo("admin", "manager", "seller"), getAllInvoicesController);
router.get("/stats/overview", protect, restrictTo("admin", "manager"), getInvoiceStatsController);
router.get("/filter/overdue", protect, restrictTo("admin", "manager", "seller"), getOverdueInvoicesController);

// Admin/Manager routes - Write access
router.post("/create", protect, restrictTo("admin", "manager"), createInvoiceController);
router.post("/generate-from-order/:orderId", protect, restrictTo("admin", "manager", "seller"), generateInvoiceFromOrderController);

// Invoice management
router.patch("/:id/update", protect, restrictTo("admin", "manager"), updateInvoiceController);
router.patch("/:id/status", protect, restrictTo("admin", "manager"), updateInvoiceStatusController);
router.patch("/:id/payment", protect, restrictTo("admin", "manager"), recordPaymentController);

// Specific status updates
router.patch("/:id/mark-sent", protect, restrictTo("admin", "manager", "seller"), markInvoiceAsSentController);
router.patch("/:id/mark-paid", protect, restrictTo("admin", "manager"), markInvoiceAsPaidController);
router.patch("/:id/cancel", protect, restrictTo("admin", "manager"), cancelInvoiceController);

// Admin only routes
router.delete("/:id", protect, restrictTo("admin"), deleteInvoiceController);

export default router;
