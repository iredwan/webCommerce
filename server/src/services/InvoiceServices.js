import InvoiceModel from "../model/InvoiceModel.js";
import OrderModel from "../model/OrderModel.js";
import UserModel from "../model/UserModel.js";
import ProductModel from "../model/ProductModel.js";
import {
  validateInvoiceCreation,
  validateInvoiceUpdate
} from "../utility/invoiceValidation.js";
import {
  logInvoiceCreation,
  logInvoiceUpdate,
  logInvoiceDeletion,
  logInvoiceStatusChange,
  extractUserInfo
} from "../utility/auditLogger.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
const ObjectId = mongoose.Types.ObjectId;

export const generateInvoiceFromOrderService = async (orderId, req) => {
  try {
    if (!ObjectId.isValid(orderId)) {
      return {
        status: false,
        message: "Invalid order ID format."
      };
    }

    // Check if invoice already exists for this order
    const existingInvoice = await InvoiceModel.findOne({ order: orderId });
    if (existingInvoice) {
      return {
        status: false,
        message: "Invoice already exists for this order.",
        data: existingInvoice
      };
    }

    // Get order with populated data
    const order = await OrderModel.findById(orderId)
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone cus_country cus_division cus_district cus_village ship_country ship_division ship_district ship_village ship_phone')
      .populate('items.product', 'name slug category images');

    if (!order) {
      return {
        status: false,
        message: "Order not found."
      };
    }

    // Prepare invoice items from order items
    const invoiceItems = order.items.map(item => ({
      product: item.product._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      variantSku: item.variantSku || null,
      variantDetails: item.variantDetails || null,
      image: item.image,
      totalAmount: item.price * item.quantity
    }));

    // Prepare billing address from user and shipping info
    const billingAddress = {
      fullName: order.shipping?.fullName || `${order.user.cus_firstName} ${order.user.cus_lastName}`.trim(),
      phone: order.shipping?.phone || order.user.cus_phone,
      email: order.user.cus_email,
      address: order.shipping?.address || order.user.cus_village,
      city: order.shipping?.city || order.user.cus_district,
      postalCode: order.shipping?.postalCode || "",
      country: order.shipping?.country || order.user.cus_country,
      division: order.user.cus_division,
      district: order.user.cus_district
    };

    // Calculate taxes (you can customize this based on your tax rules)
    const taxRate = 0; // Set your tax rate here (e.g., 15 for 15%)
    const subtotal = order.itemsPrice;
    const totalTax = (subtotal * taxRate) / 100;

    // Calculate discount
    const discountAmount = subtotal + order.shippingPrice + totalTax - order.totalPrice;

    // Prepare invoice data
    const invoiceData = {
      order: orderId,
      user: order.user._id,
      items: invoiceItems,
      billingAddress,
      subtotal,
      taxes: taxRate > 0 ? [{
        name: "VAT",
        rate: taxRate,
        amount: totalTax
      }] : [],
      totalTax,
      shippingCost: order.shippingPrice,
      discount: {
        type: "flat",
        value: discountAmount,
        amount: discountAmount
      },
      totalAmount: order.totalPrice,
      paymentMethod: order.payment?.method || "COD",
      paymentStatus: order.payment?.status === "paid" ? "paid" : "pending",
      paidAmount: order.payment?.status === "paid" ? order.totalPrice : 0,
      generatedBy: req.user?._id || null,
      notes: order.note || "",
      companyInfo: {
        name: process.env.COMPANY_NAME || "Your Company Name",
        address: process.env.COMPANY_ADDRESS || "",
        phone: process.env.COMPANY_PHONE || "",
        email: process.env.COMPANY_EMAIL || "",
        website: process.env.COMPANY_WEBSITE || "",
        taxId: process.env.COMPANY_TAX_ID || ""
      }
    };

    // Create invoice
    const invoice = await InvoiceModel.create(invoiceData);

    // Populate the created invoice
    const populatedInvoice = await InvoiceModel.findById(invoice._id)
      .populate('order', 'orderNumber deliveryStatus')
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
      .populate('items.product', 'name slug');

    // Log the creation
    await logInvoiceCreation(req, populatedInvoice);

    return {
      status: true,
      data: populatedInvoice,
      message: "Invoice generated successfully."
    };
  } catch (e) {
    console.error("Generate invoice from order error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to generate invoice."
    };
  }
};

export const createInvoiceService = async (req) => {
  try {
    const reqBody = req.body;

    // Validate input data
    const validation = validateInvoiceCreation(reqBody);
    if (!validation.isValid) {
      return {
        status: false,
        message: "Validation failed.",
        errors: validation.errors
      };
    }

    // Verify user exists
    const user = await UserModel.findById(reqBody.user);
    if (!user) {
      return {
        status: false,
        message: "User not found."
      };
    }

    // Calculate totals
    let subtotal = 0;
    if (reqBody.items && reqBody.items.length > 0) {
      subtotal = reqBody.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    }

    reqBody.subtotal = reqBody.subtotal || subtotal;
    reqBody.totalAmount = reqBody.subtotal + (reqBody.shippingCost || 0) + (reqBody.totalTax || 0) - (reqBody.discount?.amount || 0);

    const invoice = await InvoiceModel.create(reqBody);

    // Log the creation
    await logInvoiceCreation(req, invoice);

    return {
      status: true,
      data: invoice,
      message: "Invoice created successfully."
    };
  } catch (e) {
    console.error("Create invoice error:", e);

    if (e.code === 11000) {
      const field = Object.keys(e.keyPattern)[0];
      return {
        status: false,
        message: `Invoice with this ${field} already exists.`,
        error: e.message
      };
    }

    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to create invoice."
    };
  }
};

export const getAllInvoicesService = async (query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.user) {
      filter.user = query.user;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }
    if (query.search) {
      filter.invoiceNumber = { $regex: query.search, $options: "i" };
    }
    if (query.dateFrom || query.dateTo) {
      filter.issueDate = {};
      if (query.dateFrom) {
        filter.issueDate.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.issueDate.$lte = new Date(query.dateTo);
      }
    }
    if (query.overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.paymentStatus = { $ne: 'paid' };
    }

    const invoices = await InvoiceModel.find(filter)
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
      .populate('order', 'orderNumber deliveryStatus')
      .populate('items.product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InvoiceModel.countDocuments(filter);

    return {
      status: true,
      data: invoices,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "Invoices retrieved successfully."
    };
  } catch (e) {
    console.error("Get all invoices error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve invoices."
    };
  }
};

export const getInvoiceByIdService = async (invoiceId) => {
  try {
    if (!ObjectId.isValid(invoiceId)) {
      return {
        status: false,
        message: "Invalid invoice ID format."
      };
    }

    const invoice = await InvoiceModel.findById(invoiceId)
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone cus_country cus_division cus_district')
      .populate('order', 'orderNumber deliveryStatus payment')
      .populate('items.product', 'name slug category images');

    if (!invoice) {
      return {
        status: false,
        message: "Invoice not found."
      };
    }

    return {
      status: true,
      data: invoice,
      message: "Invoice retrieved successfully."
    };
  } catch (e) {
    console.error("Get invoice by ID error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve invoice."
    };
  }
};

export const getInvoiceByNumberService = async (invoiceNumber) => {
  try {
    const invoice = await InvoiceModel.findOne({ invoiceNumber })
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
      .populate('order', 'orderNumber deliveryStatus')
      .populate('items.product', 'name slug category images');

    if (!invoice) {
      return {
        status: false,
        message: "Invoice not found."
      };
    }

    return {
      status: true,
      data: invoice,
      message: "Invoice retrieved successfully."
    };
  } catch (e) {
    console.error("Get invoice by number error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve invoice."
    };
  }
};

export const updateInvoiceService = async (invoiceId, req) => {
  try {
    if (!ObjectId.isValid(invoiceId)) {
      return {
        status: false,
        message: "Invalid invoice ID format."
      };
    }

    const updateData = req.body;

    // Validate update data
    const validation = validateInvoiceUpdate(updateData);
    if (!validation.isValid) {
      return {
        status: false,
        message: "Validation failed.",
        errors: validation.errors
      };
    }

    // Remove sensitive fields
    delete updateData._id;
    delete updateData.invoiceNumber;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const oldInvoice = await InvoiceModel.findById(invoiceId);
    if (!oldInvoice) {
      return {
        status: false,
        message: "Invoice not found."
      };
    }

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
     .populate('order', 'orderNumber')
     .populate('items.product', 'name slug');

    // Log the update
    await logInvoiceUpdate(req, oldInvoice, updatedInvoice);

    return {
      status: true,
      data: updatedInvoice,
      message: "Invoice updated successfully."
    };
  } catch (e) {
    console.error("Update invoice error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to update invoice."
    };
  }
};

export const updateInvoiceStatusService = async (invoiceId, status, req) => {
  try {
    if (!ObjectId.isValid(invoiceId)) {
      return {
        status: false,
        message: "Invalid invoice ID format."
      };
    }

    const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"];
    if (!validStatuses.includes(status)) {
      return {
        status: false,
        message: "Invalid invoice status."
      };
    }

    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      return {
        status: false,
        message: "Invoice not found."
      };
    }

    const oldStatus = invoice.status;
    const updateData = { status };

    // Handle specific status changes
    if (status === "sent" && !invoice.sentAt) {
      updateData.sentAt = new Date();
    }

    if (status === "paid") {
      updateData.paymentStatus = "paid";
      updateData.paidDate = new Date();
      updateData.paidAmount = invoice.totalAmount;
      updateData.remainingAmount = 0;
    }

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      { $set: updateData },
      { new: true }
    ).populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
     .populate('order', 'orderNumber');

    // Log the status change
    await logInvoiceStatusChange(req, invoice, oldStatus, status);

    return {
      status: true,
      data: updatedInvoice,
      message: `Invoice status updated to ${status} successfully.`
    };
  } catch (e) {
    console.error("Update invoice status error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to update invoice status."
    };
  }
};

export const recordPaymentService = async (invoiceId, paymentData, req) => {
  try {
    if (!ObjectId.isValid(invoiceId)) {
      return {
        status: false,
        message: "Invalid invoice ID format."
      };
    }

    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      return {
        status: false,
        message: "Invoice not found."
      };
    }

    const { amount, method, transactionId, notes } = paymentData;

    if (!amount || amount <= 0) {
      return {
        status: false,
        message: "Payment amount must be greater than 0."
      };
    }

    const newPaidAmount = invoice.paidAmount + amount;
    if (newPaidAmount > invoice.totalAmount) {
      return {
        status: false,
        message: "Payment amount exceeds invoice total."
      };
    }

    const updateData = {
      paidAmount: newPaidAmount,
      remainingAmount: invoice.totalAmount - newPaidAmount,
      paymentMethod: method || invoice.paymentMethod
    };

    // Update payment status based on paid amount
    if (newPaidAmount >= invoice.totalAmount) {
      updateData.paymentStatus = "paid";
      updateData.status = "paid";
      updateData.paidDate = new Date();
    } else if (newPaidAmount > 0) {
      updateData.paymentStatus = "partial";
    }

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      { $set: updateData },
      { new: true }
    ).populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
     .populate('order', 'orderNumber');

    return {
      status: true,
      data: updatedInvoice,
      message: "Payment recorded successfully."
    };
  } catch (e) {
    console.error("Record payment error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to record payment."
    };
  }
};

export const getInvoiceStatsService = async () => {
  try {
    const totalInvoices = await InvoiceModel.countDocuments();
    const draftInvoices = await InvoiceModel.countDocuments({ status: "draft" });
    const sentInvoices = await InvoiceModel.countDocuments({ status: "sent" });
    const paidInvoices = await InvoiceModel.countDocuments({ status: "paid" });
    const overdueInvoices = await InvoiceModel.countDocuments({
      dueDate: { $lt: new Date() },
      paymentStatus: { $ne: "paid" }
    });

    // Revenue calculations
    const totalRevenue = await InvoiceModel.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const pendingRevenue = await InvoiceModel.aggregate([
      { $match: { paymentStatus: { $in: ["pending", "partial"] } } },
      { $group: { _id: null, total: { $sum: "$remainingAmount" } } }
    ]);

    return {
      status: true,
      data: {
        totalInvoices,
        invoicesByStatus: {
          draft: draftInvoices,
          sent: sentInvoices,
          paid: paidInvoices,
          overdue: overdueInvoices
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          pending: pendingRevenue[0]?.total || 0
        }
      },
      message: "Invoice statistics retrieved successfully."
    };
  } catch (e) {
    console.error("Get invoice stats error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve invoice statistics."
    };
  }
};

export const deleteInvoiceService = async (invoiceId, req) => {
  try {
    if (!ObjectId.isValid(invoiceId)) {
      return {
        status: false,
        message: "Invalid invoice ID format."
      };
    }

    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      return {
        status: false,
        message: "Invoice not found."
      };
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== "draft") {
      return {
        status: false,
        message: "Only draft invoices can be deleted."
      };
    }

    await InvoiceModel.findByIdAndDelete(invoiceId);

    // Delete associated PDF file if exists
    if (invoice.pdfPath && fs.existsSync(invoice.pdfPath)) {
      fs.unlinkSync(invoice.pdfPath);
    }

    // Log the deletion
    await logInvoiceDeletion(req, invoice);

    return {
      status: true,
      message: "Invoice deleted successfully."
    };
  } catch (e) {
    console.error("Delete invoice error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to delete invoice."
    };
  }
};
