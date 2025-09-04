/**
 * Audit logging utility for tracking product operations
 */

import AuditLog from "../model/AuditLog.js";
import mongoose from "mongoose";

/**
 * Create an audit log entry for product operations
 * @param {Object} logData - Audit log data
 * @returns {Promise} - Audit log entry
 */
export const createProductAuditLog = async (logData) => {
  try {
    const {
      action,
      modelId,
      userId,
      userEmail,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      severity = 'LOW'
    } = logData;

    return await AuditLog.createLog({
      action,
      model: 'Product',
      modelId,
      userId,
      userEmail,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      severity
    });
  } catch (error) {
    console.error('Failed to create product audit log:', error);
    // Don't throw error as audit logging should not break main functionality
    return null;
  }
};

/**
 * Extract user information from request
 * @param {Object} req - Express request object
 * @returns {Object} - User information
 */
export const extractUserInfo = (req) => {
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                    req.connection?.remoteAddress ||
                    req.ip ||
                    null;

  return {
    userId: req.user?.id || null,
    userEmail: req.user?.cus_email || null,
    ipAddress,
    userAgent: req.get('User-Agent') || null
  };
};


/**
 * Create audit log for product creation
 */
export const logProductCreation = async (req, product) => {
  const userInfo = extractUserInfo(req);
  
  return await createProductAuditLog({
    action: 'CREATE',
    modelId: product._id,
    ...userInfo,
    newValues: {
      name: product.name,
      category: product.category,
      basePrice: product.basePrice,
      variants: product.variants?.length || 0
    },
    description: `Created product: ${product.name}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for product update
 */
export const logProductUpdate = async (req, productId, oldValues, newValues) => {
  const userInfo = extractUserInfo(req);
  
  return await createProductAuditLog({
    action: 'UPDATE',
    modelId: productId,
    ...userInfo,
    oldValues,
    newValues,
    changes: Object.keys(newValues),
    description: `Updated product fields: ${Object.keys(newValues).join(', ')}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for product deletion
 */
export const logProductDeletion = async (req, product) => {
  const userInfo = extractUserInfo(req);
  
  return await createProductAuditLog({
    action: 'DELETE',
    modelId: product._id,
    ...userInfo,
    oldValues: {
      name: product.name,
      isDeleted: false
    },
    newValues: {
      isDeleted: true
    },
    description: `Soft deleted product: ${product.name}`,
    severity: 'MEDIUM'
  });
};

/**
 * Create audit log for stock update
 */
export const logStockUpdate = async (req, productId, variantSku, oldStock, newStock, stockChange) => {
  const userInfo = extractUserInfo(req);
  
  return await createProductAuditLog({
    action: 'UPDATE',
    modelId: productId,
    ...userInfo,
    oldValues: { [`${variantSku}_stock`]: oldStock },
    newValues: { [`${variantSku}_stock`]: newStock },
    changes: [`${variantSku}_stock`],
    description: `Stock ${stockChange > 0 ? 'increased' : 'decreased'} for SKU ${variantSku}: ${oldStock} → ${newStock}`,
    severity: newStock <= 10 ? 'HIGH' : 'LOW'
  });
};

/**
 * Create audit log for discount operations
 */
export const logDiscountOperation = async (req, productId, action, discountData) => {
  const userInfo = extractUserInfo(req);
  
  return await createProductAuditLog({
    action: 'UPDATE',
    modelId: productId,
    ...userInfo,
    newValues: discountData,
    description: `${action} discount on product`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for publish status change
 */
export const logPublishStatusChange = async (req, product, newStatus) => {
  const userInfo = extractUserInfo(req);
  
  return await createProductAuditLog({
    action: 'UPDATE',
    modelId: product._id,
    ...userInfo,
    oldValues: { isPublished: product.isPublished },
    newValues: { isPublished: newStatus },
    changes: ['isPublished'],
    description: `Product ${newStatus ? 'published' : 'unpublished'}: ${product.name}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for image deletion operations
 */
export const logImageDeletion = async (req, imageName, productId = null) => {
  const userInfo = extractUserInfo(req);
  
  return await createProductAuditLog({
    action: 'UPDATE', // Using UPDATE as image operations are considered updates
    modelId: productId || new mongoose.Types.ObjectId(), // Use provided productId or generate generic one
    ...userInfo,
    oldValues: { imageName },
    newValues: { deletedImage: imageName },
    changes: ['image_deletion'],
    description: `Deleted product image: ${imageName}`,
    severity: 'LOW'
  });
};

/**
 * Create an audit log entry for order operations
 * @param {Object} logData - Audit log data
 * @returns {Promise} - Audit log entry
 */
export const createOrderAuditLog = async (logData) => {
  try {
    const {
      action,
      modelId,
      userId,
      userEmail,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      severity = 'LOW'
    } = logData;

    return await AuditLog.createLog({
      action,
      model: 'Order',
      modelId,
      userId,
      userEmail,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      severity
    });
  } catch (error) {
    console.error('Failed to create order audit log:', error);
    // Don't throw error as audit logging should not break main functionality
    return null;
  }
};

/**
 * Create audit log for order creation
 */
export const logOrderCreation = async (req, order) => {
  const userInfo = extractUserInfo(req);
  
  return await createOrderAuditLog({
    action: 'CREATE',
    modelId: order._id,
    ...userInfo,
    newValues: {
      orderNumber: order.orderNumber,
      user: order.user,
      totalPrice: order.totalPrice,
      deliveryStatus: order.deliveryStatus,
      paymentStatus: order.payment?.status,
      itemsCount: order.items?.length || 0
    },
    description: `Created order: ${order.orderNumber} for amount ${order.totalPrice}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for order update
 */
export const logOrderUpdate = async (req, oldOrder, newOrder) => {
  const userInfo = extractUserInfo(req);
  
  // Identify changed fields
  const changes = [];
  const oldValues = {};
  const newValues = {};
  
  // Compare key fields
  const fieldsToCheck = ['deliveryStatus', 'totalPrice', 'note', 'shipping', 'payment'];
  
  fieldsToCheck.forEach(field => {
    if (field === 'payment' && oldOrder.payment?.status !== newOrder.payment?.status) {
      changes.push('payment.status');
      oldValues['payment.status'] = oldOrder.payment?.status;
      newValues['payment.status'] = newOrder.payment?.status;
    } else if (field === 'shipping') {
      // Check shipping fields
      if (JSON.stringify(oldOrder.shipping) !== JSON.stringify(newOrder.shipping)) {
        changes.push('shipping');
        oldValues.shipping = oldOrder.shipping;
        newValues.shipping = newOrder.shipping;
      }
    } else if (oldOrder[field] !== newOrder[field]) {
      changes.push(field);
      oldValues[field] = oldOrder[field];
      newValues[field] = newOrder[field];
    }
  });
  
  return await createOrderAuditLog({
    action: 'UPDATE',
    modelId: newOrder._id,
    ...userInfo,
    oldValues,
    newValues,
    changes,
    description: `Updated order ${newOrder.orderNumber}: ${changes.join(', ')}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for order deletion
 */
export const logOrderDeletion = async (req, order) => {
  const userInfo = extractUserInfo(req);
  
  return await createOrderAuditLog({
    action: 'DELETE',
    modelId: order._id,
    ...userInfo,
    oldValues: {
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      deliveryStatus: order.deliveryStatus
    },
    description: `Deleted order: ${order.orderNumber}`,
    severity: 'MEDIUM'
  });
};

/**
 * Create audit log for order status change
 */
export const logOrderStatusChange = async (req, order, oldStatus, newStatus) => {
  const userInfo = extractUserInfo(req);
  
  return await createOrderAuditLog({
    action: 'UPDATE',
    modelId: order._id,
    ...userInfo,
    oldValues: { deliveryStatus: oldStatus },
    newValues: { deliveryStatus: newStatus },
    changes: ['deliveryStatus'],
    description: `Order ${order.orderNumber} status changed: ${oldStatus} → ${newStatus}`,
    severity: newStatus === 'cancelled' ? 'MEDIUM' : 'LOW'
  });
};

/**
 * Create an audit log entry for invoice operations
 * @param {Object} logData - Audit log data
 * @returns {Promise} - Audit log entry
 */
export const createInvoiceAuditLog = async (logData) => {
  try {
    const {
      action,
      modelId,
      userId,
      userEmail,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      severity = 'LOW'
    } = logData;

    return await AuditLog.createLog({
      action,
      model: 'Invoice',
      modelId,
      userId,
      userEmail,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      severity
    });
  } catch (error) {
    console.error('Failed to create invoice audit log:', error);
    // Don't throw error as audit logging should not break main functionality
    return null;
  }
};

/**
 * Create audit log for invoice creation
 */
export const logInvoiceCreation = async (req, invoice) => {
  const userInfo = extractUserInfo(req);
  
  return await createInvoiceAuditLog({
    action: 'CREATE',
    modelId: invoice._id,
    ...userInfo,
    newValues: {
      invoiceNumber: invoice.invoiceNumber,
      user: invoice.user,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      paymentStatus: invoice.paymentStatus,
      itemsCount: invoice.items?.length || 0
    },
    description: `Created invoice: ${invoice.invoiceNumber} for amount ${invoice.totalAmount}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for invoice update
 */
export const logInvoiceUpdate = async (req, oldInvoice, newInvoice) => {
  const userInfo = extractUserInfo(req);
  
  // Identify changed fields
  const changes = [];
  const oldValues = {};
  const newValues = {};
  
  // Compare key fields
  const fieldsToCheck = ['status', 'paymentStatus', 'totalAmount', 'paidAmount', 'notes', 'terms'];
  
  fieldsToCheck.forEach(field => {
    if (oldInvoice[field] !== newInvoice[field]) {
      changes.push(field);
      oldValues[field] = oldInvoice[field];
      newValues[field] = newInvoice[field];
    }
  });
  
  return await createInvoiceAuditLog({
    action: 'UPDATE',
    modelId: newInvoice._id,
    ...userInfo,
    oldValues,
    newValues,
    changes,
    description: `Updated invoice ${newInvoice.invoiceNumber}: ${changes.join(', ')}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for invoice deletion
 */
export const logInvoiceDeletion = async (req, invoice) => {
  const userInfo = extractUserInfo(req);
  
  return await createInvoiceAuditLog({
    action: 'DELETE',
    modelId: invoice._id,
    ...userInfo,
    oldValues: {
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      status: invoice.status
    },
    description: `Deleted invoice: ${invoice.invoiceNumber}`,
    severity: 'MEDIUM'
  });
};

/**
 * Create audit log for invoice status change
 */
export const logInvoiceStatusChange = async (req, invoice, oldStatus, newStatus) => {
  const userInfo = extractUserInfo(req);
  
  return await createInvoiceAuditLog({
    action: 'UPDATE',
    modelId: invoice._id,
    ...userInfo,
    oldValues: { status: oldStatus },
    newValues: { status: newStatus },
    changes: ['status'],
    description: `Invoice ${invoice.invoiceNumber} status changed: ${oldStatus} → ${newStatus}`,
    severity: newStatus === 'cancelled' ? 'MEDIUM' : 'LOW'
  });
};
