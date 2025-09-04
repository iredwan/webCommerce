import OrderModel from "../model/OrderModel.js";
import ProductModel from "../model/ProductModel.js";
import UserModel from "../model/UserModel.js";
import InvoiceModel from "../model/InvoiceModel.js";
import { 
  validateOrderCreation,
  validateOrderUpdate,
  validateStatusChange,
  validatePaymentStatus
} from "../utility/orderValidation.js"
import { 
  logOrderCreation,
  logOrderUpdate,
  logOrderDeletion,
  logOrderStatusChange,
  extractUserInfo,
  createOrderAuditLog
} from "../utility/auditLogger.js";
import mongoose from "mongoose";
import AuditLog from "../model/AuditLog.js";
const ObjectId = mongoose.Types.ObjectId; 

export const createOrderService = async (req) => {
  try {
    const userId = req.user.id
    const {items, shipping, payment = {}, note } = req.body;
    
    // Step 1: Validate user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return {
        status: false,
        message: "User not found"
      };
    }

    // Step 2: Process each product item and calculate discounts
    const processedItems = [];
    let totalItemsPrice = 0;

    for (const item of items) {
      const { productId, quantity = 1, variantSku = null } = item;
      
      // Fetch product
      const product = await ProductModel.findById(productId);
      if (!product) {
        return {
          status: false,
          message: `Product with ID ${productId} not found`
        };
      }

      if (!product.isPublished || product.isDeleted) {
        return {
          status: false,
          message: `Product "${product.name}" is not available`
        };
      }

      let finalPrice = product.basePrice;
      let appliedDiscount = 0;
      let stockToCheck = product.totalStock;
      let variantDetails = null;

      // Check if variant is specified
      if (variantSku) {
        const variant = product.variants.find(v => v.sku === variantSku);
        if (!variant) {
          return {
            status: false,
            message: `Variant with SKU ${variantSku} not found for product "${product.name}"`
          };
        }
        
        finalPrice = variant.price;
        stockToCheck = variant.stock;
        variantDetails = {
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          unit: variant.unit
        };

        // Check variant discount schedule
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        
        if (variant.discount && variant.discountSchedule?.isActive) {
          const { startDate, endDate, startTime, endTime } = variant.discountSchedule;
          const isWithinDateRange = (!startDate || now >= new Date(startDate)) && 
                                   (!endDate || now <= new Date(endDate));
          const isWithinTimeRange = currentTime >= startTime && currentTime <= endTime;
          
          if (isWithinDateRange && isWithinTimeRange) {
            if (variant.discountType === 'flat') {
              appliedDiscount = variant.discount;
              finalPrice = Math.max(0, finalPrice - appliedDiscount);
            } else if (variant.discountType === 'percent') {
              appliedDiscount = (finalPrice * variant.discount) / 100;
              finalPrice = Math.max(0, finalPrice - appliedDiscount);
            }
          }
        }
      } else {
        // Check product-level discount schedule
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        
        if (product.discount && product.discountSchedule?.isActive) {
          const { startDate, endDate, startTime, endTime } = product.discountSchedule;
          const isWithinDateRange = (!startDate || now >= new Date(startDate)) && 
                                   (!endDate || now <= new Date(endDate));
          const isWithinTimeRange = currentTime >= startTime && currentTime <= endTime;
          
          if (isWithinDateRange && isWithinTimeRange) {
            if (product.discountType === 'flat') {
              appliedDiscount = product.discount;
              finalPrice = Math.max(0, finalPrice - appliedDiscount);
            } else if (product.discountType === 'percent') {
              appliedDiscount = (finalPrice * product.discount) / 100;
              finalPrice = Math.max(0, finalPrice - appliedDiscount);
            }
          }
        }
      }

      // Check stock availability
      if (stockToCheck < quantity) {
        return {
          status: false,
          message: `Insufficient stock for product "${product.name}". Available: ${stockToCheck}, Requested: ${quantity}`
        };
      }

      // Add processed item
      const processedItem = {
        product: productId,
        quantity: quantity,
        name: product.name,
        price: finalPrice,
        originalPrice: variantSku ? 
          product.variants.find(v => v.sku === variantSku)?.price || product.basePrice : 
          product.basePrice,
        appliedDiscount: appliedDiscount,
        variantSku: variantSku,
        variantDetails: variantDetails,
        image: product.images?.[0]?.image || '',
        totalAmount: finalPrice * quantity
      };

      processedItems.push(processedItem);
      totalItemsPrice += processedItem.totalAmount;

      // Update stock
      if (variantSku) {
        const variantIndex = product.variants.findIndex(v => v.sku === variantSku);
        product.variants[variantIndex].stock -= quantity;
      }
      product.totalStock -= quantity;
      product.salesCount += quantity;
      await product.save();
    }

    // Step 3: Prepare shipping data (use user data as fallback)
    const shippingData = {
      fullName: shipping?.fullName || `${user.cus_firstName} ${user.cus_lastName || ''}`.trim(),
      phone: shipping?.phone || user.cus_phone,
      email: shipping?.email || user.cus_email,
      country: shipping?.country || user.ship_country || user.cus_country,
      division: shipping?.division || user.ship_division || user.cus_division,
      district: shipping?.district || user.ship_district || user.cus_district,
      police_station: shipping?.police_station || user.ship_police_station || user.cus_police_station,
      union_ward: shipping?.union_ward || user.ship_union_ward || user.cus_union_ward,
      village: shipping?.village || user.ship_village || user.cus_village
    };

    // Step 4: Calculate totals
    const shippingPrice = shipping?.shippingPrice || 0;
    const taxPrice = 0; // Can be calculated based on your tax rules
    const totalPrice = totalItemsPrice + shippingPrice + taxPrice;

    // Step 5: Create order data
    const orderData = {
      user: userId,
      items: processedItems,
      shipping: shippingData,
      payment: {
        method: payment.method || 'COD',
        status: payment.status || 'pending',
        transactionId: payment.transactionId || null,
        updateTime: payment.updateTime || new Date().toISOString()
      },
      itemsPrice: totalItemsPrice,
      shippingPrice: shippingPrice,
      taxPrice: taxPrice,
      totalPrice: totalPrice,
      note: note || ''
    };

    // Step 6: Create the order
    const order = await OrderModel.create(orderData);

    // Step 7: Log order creation
    await AuditLog.create({
      action: 'CREATE',
      model: 'Order',
      modelId: order._id,
      userId: userId,
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get ? req.get('User-Agent') : 'unknown'
    });

    return {
      status: true,
      data: order,
      message: "Order created successfully"
    };

  } catch (error) {
    console.error("Create order service error:", error);
    return {
      status: false,
      error: error.message || error.toString(),
      message: "Failed to create order"
    };
  }
};

export const getAllOrdersService = async (query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.user) {
      filter.user = query.user;
    }
    if (query.deliveryStatus) {
      filter.deliveryStatus = query.deliveryStatus;
    }
    if (query.paymentStatus) {
      filter['payment.status'] = query.paymentStatus;
    }
    if (query.paymentMethod) {
      filter['payment.method'] = query.paymentMethod;
    }
    if (query.search) {
      filter.orderNumber = { $regex: query.search, $options: "i" };
    }
    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {};
      if (query.dateFrom) {
        filter.createdAt.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.createdAt.$lte = new Date(query.dateTo);
      }
    }

    const orders = await OrderModel.find(filter)
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
      .populate('items.product', 'name slug category images basePrice')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await OrderModel.countDocuments(filter);

    return {
      status: true,
      data: orders,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "Orders retrieved successfully."
    };
  } catch (e) {
    console.error("Get all orders error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve orders."
    };
  }
};

export const getOrderByIdService = async (orderId) => {
  try {
    if (!ObjectId.isValid(orderId)) {
      return { 
        status: false, 
        message: "Invalid order ID format." 
      };
    }

    const order = await OrderModel.findById(orderId)
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone cus_country cus_division cus_district ship_country ship_division ship_district')
      .populate('items.product', 'name slug category images basePrice variants');

    if (!order) {
      return { 
        status: false, 
        message: "Order not found." 
      };
    }

    return {
      status: true,
      data: order,
      message: "Order retrieved successfully."
    };
  } catch (e) {
    console.error("Get order by ID error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve order."
    };
  }
};

export const getOrderByOrderNumberService = async (orderNumber) => {
  try {
    const order = await OrderModel.findOne({ orderNumber })
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
      .populate('items.product', 'name slug category images basePrice variants');

    if (!order) {
      return { 
        status: false, 
        message: "Order not found." 
      };
    }

    return {
      status: true,
      data: order,
      message: "Order retrieved successfully."
    };
  } catch (e) {
    console.error("Get order by order number error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve order."
    };
  }
};

export const getUserOrdersService = async (userId, query) => {
  try {
    if (!ObjectId.isValid(userId)) {
      return { 
        status: false, 
        message: "Invalid user ID format." 
      };
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: userId };

    if (query.deliveryStatus) {
      filter.deliveryStatus = query.deliveryStatus;
    }
    if (query.paymentStatus) {
      filter['payment.status'] = query.paymentStatus;
    }

    const orders = await OrderModel.find(filter)
      .populate('items.product', 'name slug images basePrice variants')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await OrderModel.countDocuments(filter);

    return {
      status: true,
      data: orders,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "User orders retrieved successfully."
    };
  } catch (e) {
    console.error("Get user orders error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve user orders."
    };
  }
};


export const updateOrderService = async (orderId, req) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return { 
        status: false, 
        message: "Invalid order ID format." 
      };
    }

    const bodyData = { ...req.body };

    // Remove sensitive fields
    const restrictedFields = ['_id', 'user', 'orderNumber', 'createdAt', 'updatedAt'];
    restrictedFields.forEach(field => delete bodyData[field]);

    // Flatten nested object/array into dot-notation
    const flattenToDotNotation = (obj, parentKey = '', res = {}) => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              flattenToDotNotation(item, `${newKey}.${index}`, res);
            } else {
              res[`${newKey}.${index}`] = item;
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          flattenToDotNotation(value, newKey, res);
        } else {
          res[newKey] = value;
        }
      });
      return res;
    };

    const updateData = flattenToDotNotation(bodyData);

    // Determine if array/nested update exists
    const isArrayUpdate = Object.keys(updateData).some(key => key.match(/\.\d+\./));

    const oldOrder = await OrderModel.findById(orderId);
    if (!oldOrder) {
      return { 
        status: false, 
        message: "Order not found." 
      };
    }

    let updatedOrder;

    if (isArrayUpdate) {
      // Cast product fields to ObjectId
      Object.keys(updateData).forEach(key => {
        if (key.endsWith(".product") && typeof updateData[key] === "string") {
          updateData[key] = new mongoose.Types.ObjectId(updateData[key]);
        }
      });

      // Use updateOne for array partial update
      await OrderModel.updateOne(
        { _id: orderId },
        { $set: updateData }
      );

      updatedOrder = await OrderModel.findById(orderId)
        .populate("user", "name email phone")
        .populate("items.product", "name slug category");

    } else {
      // Normal update with validation
      updatedOrder = await OrderModel.findByIdAndUpdate(
        orderId,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("user", "name email phone")
        .populate("items.product", "name slug category");
    }

    // Audit log
    await AuditLog.create({
      action: 'UPDATE',
      model: 'Order',
      modelId: orderId,
      userId: req.user?.id || req.user?._id,
      oldValues: Object.keys(updateData).reduce((acc, key) => {
        acc[key] = oldOrder.get(key);
        return acc;
      }, {}),
      newValues: updateData,
      changes: {
        orderNumber: updatedOrder.orderNumber,
        fieldsChanged: Object.keys(updateData)
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get ? req.get('User-Agent') : 'unknown'
    });

    return {
      status: true,
      data: updatedOrder,
      message: "Order updated successfully."
    };

  } catch (e) {
    console.error("Update order error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to update order."
    };
  }
};

export const updateOrderStatusService = async (orderId, status, req) => {
  try {
    if (!ObjectId.isValid(orderId)) {
      return { 
        status: false, 
        message: "Invalid order ID format." 
      };
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return { 
        status: false, 
        message: "Order not found." 
      };
    }

    // Validate status change
    const statusValidation = validateStatusChange(order.deliveryStatus, status);
    if (!statusValidation.isValid) {
      return { 
        status: false, 
        message: "Invalid status change.",
        errors: statusValidation.errors 
      };
    }

    const oldStatus = order.deliveryStatus;
    const updateData = { deliveryStatus: status };

    // Set delivered date if status is delivered
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    // Handle stock restoration for cancelled orders
    if (status === "cancelled" && oldStatus !== "cancelled") {
      // Restore stock for cancelled orders
      for (let item of order.items) {
        const product = await ProductModel.findById(item.product);
        if (product) {
          if (item.variantSku) {
            // Restore variant stock
            const variantIndex = product.variants.findIndex(v => v.sku === item.variantSku);
            if (variantIndex !== -1) {
              product.variants[variantIndex].stock += item.quantity;
            }
          }
          
          // Restore total stock
          product.totalStock += item.quantity;
          
          // Decrease sales count
          product.salesCount = Math.max(0, product.salesCount - item.quantity);
          
          await product.save();
        }
      }
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    ).populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
     .populate('items.product', 'name slug category');

    // Create audit log
    await logOrderStatusChange(req, order, oldStatus, status);

    // Additional audit log for status change
    await AuditLog.create({
      action: 'UPDATE',
      model: 'Order',
      modelId: orderId,
      userId: req.user?.id || req.user?._id,
      oldValues: { deliveryStatus: oldStatus },
      newValues: { deliveryStatus: status },
      changes: {
        orderNumber: order.orderNumber,
        statusChange: `${oldStatus} → ${status}`,
        stockRestored: status === "cancelled" && oldStatus !== "cancelled",
        deliveredAt: status === "delivered" ? new Date() : null
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get ? req.get('User-Agent') : 'unknown'
    });

    return {
      status: true,
      data: updatedOrder,
      message: `Order status updated to ${status} successfully.`
    };
  } catch (e) {
    console.error("Update order status error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to update order status."
    };
  }
};

export const updatePaymentStatusService = async (orderId, paymentStatus, transactionId, req) => {
  try {
    if (!ObjectId.isValid(orderId)) {
      return { 
        status: false, 
        message: "Invalid order ID format." 
      };
    }

    // Validate payment status
    const paymentValidation = validatePaymentStatus(paymentStatus);
    if (!paymentValidation.isValid) {
      return { 
        status: false, 
        message: "Invalid payment status.",
        errors: paymentValidation.errors 
      };
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return { 
        status: false, 
        message: "Order not found." 
      };
    }

    const updateData = { 
      'payment.status': paymentStatus,
      'payment.updateTime': new Date().toISOString()
    };

    if (transactionId) {
      updateData['payment.transactionId'] = transactionId;
    }

    // Set paid date if payment is successful
    if (paymentStatus === "paid") {
      updateData.paidAt = new Date();
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email phone')
     .populate('items.product', 'name slug category');

    // Log payment status update
    await AuditLog.create({
      action: 'UPDATE',
      model: 'Order',
      modelId: orderId,
      userId: req.user?.id || req.user?._id,
      oldValues: { paymentStatus: order.payment.status },
      newValues: { paymentStatus: paymentStatus },
      changes: {
        orderNumber: order.orderNumber,
        paymentChange: `${order.payment.status} → ${paymentStatus}`,
        transactionId: transactionId,
        paidAt: paymentStatus === "paid" ? new Date() : null
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get ? req.get('User-Agent') : 'unknown'
    });

    return {
      status: true,
      data: updatedOrder,
      message: `Payment status updated to ${paymentStatus} successfully.`
    };
  } catch (e) {
    console.error("Update payment status error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to update payment status."
    };
  }
};

export const deleteOrderService = async (orderId, req) => {
  try {
    if (!ObjectId.isValid(orderId)) {
      return { 
        status: false, 
        message: "Invalid order ID format." 
      };
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return { 
        status: false, 
        message: "Order not found." 
      };
    }

    // Only allow deletion of pending or cancelled orders
    if (!["pending", "cancelled"].includes(order.deliveryStatus)) {
      return { 
        status: false, 
        message: "Only pending or cancelled orders can be deleted." 
      };
    }

    await OrderModel.findByIdAndDelete(orderId);

    // Create audit log
    await logOrderDeletion(req, order);

    // Additional audit log for order deletion
    await AuditLog.create({
      action: 'DELETE',
      model: 'Order',
      modelId: orderId,
      userId: req.user?.id || req.user?._id,
      oldValues: {
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        deliveryStatus: order.deliveryStatus,
        paymentStatus: order.payment?.status
      },
      changes: {
        orderNumber: order.orderNumber,
        itemsCount: order.items.length,
        reason: 'Manual deletion'
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get ? req.get('User-Agent') : 'unknown'
    });

    return {
      status: true,
      message: "Order deleted successfully."
    };
  } catch (e) {
    console.error("Delete order error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to delete order."
    };
  }
};

export const getOrderStatsService = async () => {
  try {
    const totalOrders = await OrderModel.countDocuments();
    const pendingOrders = await OrderModel.countDocuments({ deliveryStatus: "pending" });
    const processingOrders = await OrderModel.countDocuments({ deliveryStatus: "processing" });
    const shippedOrders = await OrderModel.countDocuments({ deliveryStatus: "shipped" });
    const deliveredOrders = await OrderModel.countDocuments({ deliveryStatus: "delivered" });
    const cancelledOrders = await OrderModel.countDocuments({ deliveryStatus: "cancelled" });

    const paidOrders = await OrderModel.countDocuments({ "payment.status": "paid" });
    const pendingPayments = await OrderModel.countDocuments({ "payment.status": "pending" });

    // Revenue calculations
    const totalRevenue = await OrderModel.aggregate([
      { $match: { "payment.status": "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    const monthlyRevenue = await OrderModel.aggregate([
      { 
        $match: { 
          "payment.status": "paid",
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    return {
      status: true,
      data: {
        totalOrders,
        ordersByStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        paymentStats: {
          paid: paidOrders,
          pending: pendingPayments
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          monthly: monthlyRevenue[0]?.total || 0
        }
      },
      message: "Order statistics retrieved successfully."
    };
  } catch (e) {
    console.error("Get order stats error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve order statistics."
    };
  }
};

export const getRecentOrdersService = async (limit = 10) => {
  try {
    const orders = await OrderModel.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderNumber user totalPrice deliveryStatus payment.status createdAt');

    return {
      status: true,
      data: orders,
      message: "Recent orders retrieved successfully."
    };
  } catch (e) {
    console.error("Get recent orders error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve recent orders."
    };
  }
};

export const searchOrdersService = async (searchQuery, options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(searchQuery, 'i');
    
    const filter = {
      $or: [
        { orderNumber: searchRegex },
        { 'shipping.fullName': searchRegex },
        { 'shipping.phone': searchRegex },
        { 'shipping.email': searchRegex }
      ]
    };

    const orders = await OrderModel.find(filter)
      .populate('user', 'cus_firstName cus_lastName cus_email cus_phone')
      .populate('items.product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await OrderModel.countDocuments(filter);

    return {
      status: true,
      data: orders,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "Order search completed successfully."
    };
  } catch (e) {
    console.error("Search orders error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to search orders."
    };
  }
};

export const bulkUpdateOrdersService = async (orderIds, updateData) => {
  try {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return { 
        status: false, 
        message: "Order IDs array is required." 
      };
    }

    // Validate all order IDs
    const invalidIds = orderIds.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return { 
        status: false, 
        message: `Invalid order IDs: ${invalidIds.join(', ')}` 
      };
    }

    // Remove sensitive fields
    delete updateData._id;
    delete updateData.user;
    delete updateData.orderNumber;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const result = await OrderModel.updateMany(
      { _id: { $in: orderIds } },
      { $set: updateData }
    );

    return {
      status: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} orders updated successfully.`
    };
  } catch (e) {
    console.error("Bulk update orders error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to update orders."
    };
  }
};

export const getOrdersByDateRangeService = async (startDate, endDate, options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (options.status) {
      filter.deliveryStatus = options.status;
    }

    const orders = await OrderModel.find(filter)
      .populate('user', 'cus_firstName cus_lastName cus_email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await OrderModel.countDocuments(filter);
    
    // Calculate total revenue for the date range
    const revenueData = await OrderModel.aggregate([
      { 
        $match: {
          ...filter,
          "payment.status": "paid"
        }
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        } 
      }
    ]);

    return {
      status: true,
      data: orders,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalPaidOrders: revenueData[0]?.totalOrders || 0
      },
      message: "Orders retrieved successfully."
    };
  } catch (e) {
    console.error("Get orders by date range error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve orders."
    };
  }
};

// New service: Get product performance based on orders
export const getProductPerformanceService = async (options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const dateFilter = {};
    if (options.startDate) {
      dateFilter.createdAt = { $gte: new Date(options.startDate) };
    }
    if (options.endDate) {
      dateFilter.createdAt = { 
        ...dateFilter.createdAt, 
        $lte: new Date(options.endDate) 
      };
    }

    const pipeline = [
      { $match: { deliveryStatus: { $ne: "cancelled" }, ...dateFilter } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          productId: "$_id",
          productName: "$productDetails.name",
          productSlug: "$productDetails.slug",
          currentStock: "$productDetails.totalStock",
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1,
          avgOrderValue: 1
        }
      }
    ];

    const performance = await OrderModel.aggregate(pipeline);

    return {
      status: true,
      data: performance,
      message: "Product performance retrieved successfully."
    };
  } catch (e) {
    console.error("Get product performance error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve product performance."
    };
  }
};

// New service: Get inventory alerts based on order patterns
export const getInventoryAlertsService = async () => {
  try {
    // Get products with low stock
    const lowStockProducts = await ProductModel.find({
      totalStock: { $lt: 10 },
      isPublished: true,
      isDeleted: false
    }).select('name slug totalStock salesCount');

    // Get recently popular products (high order volume in last 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);

    const popularProducts = await OrderModel.aggregate([
      { 
        $match: { 
          createdAt: { $gte: recentDate },
          deliveryStatus: { $ne: "cancelled" }
        } 
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          recentSales: { $sum: "$items.quantity" }
        }
      },
      { $sort: { recentSales: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.totalStock": { $lt: 20 }
        }
      },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          slug: "$product.slug",
          currentStock: "$product.totalStock",
          recentSales: 1,
          stockCoverage: {
            $cond: {
              if: { $eq: ["$recentSales", 0] },
              then: 999,
              else: { $divide: ["$product.totalStock", "$recentSales"] }
            }
          }
        }
      },
      { $sort: { stockCoverage: 1 } }
    ]);

    return {
      status: true,
      data: {
        lowStockProducts,
        popularProductsLowStock: popularProducts,
        alerts: {
          totalLowStock: lowStockProducts.length,
          criticalProducts: popularProducts.filter(p => p.stockCoverage < 1).length
        }
      },
      message: "Inventory alerts retrieved successfully."
    };
  } catch (e) {
    console.error("Get inventory alerts error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve inventory alerts."
    };
  }
};
