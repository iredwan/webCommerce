import AuditLog from "../model/AuditLog.js";
import { extractUserInfo } from "./auditLogger.js";

/**
 * Create an audit log entry for category operations
 * @param {Object} logData - Audit log data
 * @returns {Promise} - Audit log entry
 */
export const createCategoryAuditLog = async (logData) => {
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
      model: 'Category',
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
    console.error('Failed to create category audit log:', error);
    return null;
  }
};

/**
 * Create audit log for category creation
 */
export const logCategoryCreation = async (req, category) => {
  const userInfo = extractUserInfo(req);
  
  return await createCategoryAuditLog({
    action: 'CREATE',
    modelId: category._id,
    ...userInfo,
    newValues: {
      categoryName: category.categoryName,
      slug: category.slug,
      parentCategory: category.parentCategory,
      imagesCount: category.categoryImg?.length || 0
    },
    description: `Created category: ${category.categoryName}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for category update
 */
export const logCategoryUpdate = async (req, categoryId, oldValues, newValues) => {
  const userInfo = extractUserInfo(req);
  
  return await createCategoryAuditLog({
    action: 'UPDATE',
    modelId: categoryId,
    ...userInfo,
    oldValues,
    newValues,
    changes: Object.keys(newValues).join(', '),
    description: `Updated category: ${newValues.categoryName || oldValues.categoryName}'s properties ${newValues}`,
    severity: 'LOW'
  });
};

/**
 * Create audit log for category deletion
 */
export const logCategoryDeletion = async (req, category) => {
  const userInfo = extractUserInfo(req);
  
  return await createCategoryAuditLog({
    action: 'DELETE',
    modelId: category._id,
    ...userInfo,
    oldValues: {
      categoryName: category.categoryName,
      slug: category.slug,
      parentCategory: category.parentCategory
    },
    description: `Deleted category: ${category.categoryName}`,
    severity: 'MEDIUM'
  });
};
