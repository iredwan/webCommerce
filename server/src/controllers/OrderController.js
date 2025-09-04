import {
  createOrderService,
  getAllOrdersService,
  getOrderByIdService,
  getOrderByOrderNumberService,
  getUserOrdersService,
  updateOrderService,
  updateOrderStatusService,
  updatePaymentStatusService,
  deleteOrderService,
  getOrderStatsService,
  getRecentOrdersService,
  searchOrdersService,
  bulkUpdateOrdersService,
  getOrdersByDateRangeService,
  getProductPerformanceService,
  getInventoryAlertsService,
} from "../services/OrderServices.js";

export const createOrderController = async (req, res) => {
  try {
    const response = await createOrderService(req);
    return res.status(response.status ? 201 : 400).json(response);
  } catch (error) {
    console.error("Create order controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const response = await getAllOrdersService(req.query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get all orders controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getOrderByIdService(id);
    return res.status(response.status ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get order by ID controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getOrderByOrderNumberController = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const response = await getOrderByOrderNumberService(orderNumber);
    return res.status(response.status ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get order by order number controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getUserOrdersController = async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await getUserOrdersService(userId, req.query);
    return res.status(response.status ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get user orders controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getMyOrdersController = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const response = await getUserOrdersService(userId, req.query);
    return res.status(response.status ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get my orders controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const updateOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateOrderService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update order controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const response = await updateOrderStatusService(id, status, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update order status controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const updatePaymentStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;
    const response = await updatePaymentStatusService(id, paymentStatus, transactionId, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update payment status controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const deleteOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteOrderService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Delete order controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getOrderStatsController = async (req, res) => {
  try {
    const response = await getOrderStatsService();
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get order stats controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getRecentOrdersController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const response = await getRecentOrdersService(limit);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get recent orders controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const searchOrdersController = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Search query is required."
      });
    }
    
    const options = {
      page: req.query.page,
      limit: req.query.limit
    };
    
    const response = await searchOrdersService(q, options);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Search orders controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const bulkUpdateOrdersController = async (req, res) => {
  try {
    const { orderIds, updateData } = req.body;
    
    if (!orderIds || !updateData) {
      return res.status(400).json({
        status: false,
        message: "Order IDs and update data are required."
      });
    }
    
    const response = await bulkUpdateOrdersService(orderIds, updateData);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Bulk update orders controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getOrdersByDateRangeController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: false,
        message: "Start date and end date are required."
      });
    }
    
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status
    };
    
    const response = await getOrdersByDateRangeService(startDate, endDate, options);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get orders by date range controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const cancelOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateOrderStatusService(id, "cancelled", req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Cancel order controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const markOrderAsDeliveredController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateOrderStatusService(id, "delivered", req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Mark order as delivered controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const markOrderAsShippedController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateOrderStatusService(id, "shipped", req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Mark order as shipped controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const markOrderAsProcessingController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateOrderStatusService(id, "processing", req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Mark order as processing controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getProductPerformanceController = async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const response = await getProductPerformanceService(options);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get product performance controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getInventoryAlertsController = async (req, res) => {
  try {
    const response = await getInventoryAlertsService();
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get inventory alerts controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

