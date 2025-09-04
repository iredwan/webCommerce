import {
  generateInvoiceFromOrderService,
  createInvoiceService,
  getAllInvoicesService,
  getInvoiceByIdService,
  getInvoiceByNumberService,
  updateInvoiceService,
  updateInvoiceStatusService,
  recordPaymentService,
  getInvoiceStatsService,
  deleteInvoiceService
} from "../services/InvoiceServices.js";

export const generateInvoiceFromOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const response = await generateInvoiceFromOrderService(orderId, req);
    return res.status(response.status ? 201 : 400).json(response);
  } catch (error) {
    console.error("Generate invoice from order controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const createInvoiceController = async (req, res) => {
  try {
    const response = await createInvoiceService(req);
    return res.status(response.status ? 201 : 400).json(response);
  } catch (error) {
    console.error("Create invoice controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getAllInvoicesController = async (req, res) => {
  try {
    const response = await getAllInvoicesService(req.query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get all invoices controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getInvoiceByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getInvoiceByIdService(id);
    return res.status(response.status ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get invoice by ID controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getInvoiceByNumberController = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const response = await getInvoiceByNumberService(invoiceNumber);
    return res.status(response.status ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get invoice by number controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const updateInvoiceController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateInvoiceService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update invoice controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const updateInvoiceStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const response = await updateInvoiceStatusService(id, status, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update invoice status controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const recordPaymentController = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const response = await recordPaymentService(id, paymentData, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Record payment controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getInvoiceStatsController = async (req, res) => {
  try {
    const response = await getInvoiceStatsService();
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get invoice stats controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const deleteInvoiceController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteInvoiceService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Delete invoice controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const markInvoiceAsSentController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateInvoiceStatusService(id, "sent", req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Mark invoice as sent controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const markInvoiceAsPaidController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateInvoiceStatusService(id, "paid", req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Mark invoice as paid controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const cancelInvoiceController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateInvoiceStatusService(id, "cancelled", req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Cancel invoice controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getOverdueInvoicesController = async (req, res) => {
  try {
    const query = { ...req.query, overdue: 'true' };
    const response = await getAllInvoicesService(query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get overdue invoices controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getUserInvoicesController = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const query = { ...req.query, user: userId };
    const response = await getAllInvoicesService(query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get user invoices controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};
