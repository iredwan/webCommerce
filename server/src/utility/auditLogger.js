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
