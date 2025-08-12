/**
 * Product validation utilities
 * Provides validation functions for product-related operations
 */

import mongoose from "mongoose";

/**
 * Validate product creation data
 * @param {Object} productData - Product data to validate
 * @returns {Object} - Validation result
 */
export const validateProductCreation = (productData) => {
  const errors = [];

  // Required fields validation
  if (!productData.name || typeof productData.name !== 'string' || productData.name.trim().length === 0) {
    errors.push("Product name is required and must be a non-empty string.");
  }

  if (productData.name && productData.name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters long.");
  }

  if (productData.name && productData.name.trim().length > 200) {
    errors.push("Product name must not exceed 200 characters.");
  }

  if (!productData.category || !mongoose.Types.ObjectId.isValid(productData.category)) {
    errors.push("Valid category ID is required.");
  }

  if (!productData.basePrice || isNaN(productData.basePrice) || productData.basePrice <= 0) {
    errors.push("Valid base price is required and must be greater than 0.");
  }

  // Variants validation
  if (!productData.variants || !Array.isArray(productData.variants) || productData.variants.length === 0) {
    errors.push("At least one product variant is required.");
  } else {
    productData.variants.forEach((variant, index) => {
      if (!variant.sku || typeof variant.sku !== 'string' || variant.sku.trim().length === 0) {
        errors.push(`Variant ${index + 1}: SKU is required.`);
      }

      if (!variant.price || isNaN(variant.price) || variant.price <= 0) {
        errors.push(`Variant ${index + 1}: Valid price is required and must be greater than 0.`);
      }

      if (variant.stock === undefined || isNaN(variant.stock) || variant.stock < 0) {
        errors.push(`Variant ${index + 1}: Valid stock is required and must be 0 or greater.`);
      }
    });

    // Check for duplicate SKUs
    const skus = productData.variants.map(v => v.sku);
    const duplicateSKUs = skus.filter((sku, index) => skus.indexOf(sku) !== index);
    if (duplicateSKUs.length > 0) {
      errors.push(`Duplicate SKUs found: ${duplicateSKUs.join(', ')}`);
    }
  }

  // Optional fields validation
  if (productData.description && productData.description.length > 5000) {
    errors.push("Description must not exceed 5000 characters.");
  }

  if (productData.discount !== undefined) {
    if (isNaN(productData.discount) || productData.discount < 0 || productData.discount > 100) {
      errors.push("Discount must be a number between 0 and 100.");
    }
  }

  if (productData.images && !Array.isArray(productData.images)) {
    errors.push("Images must be an array.");
  }

  if (productData.tags && !Array.isArray(productData.tags)) {
    errors.push("Tags must be an array.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate product update data
 * @param {Object} updateData - Product update data to validate
 * @returns {Object} - Validation result
 */
export const validateProductUpdate = (updateData) => {
  const errors = [];

  // Optional field validations (only validate if provided)
  if (updateData.name !== undefined) {
    if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
      errors.push("Product name must be a non-empty string.");
    } else if (updateData.name.trim().length < 2) {
      errors.push("Product name must be at least 2 characters long.");
    } else if (updateData.name.trim().length > 200) {
      errors.push("Product name must not exceed 200 characters.");
    }
  }

  if (updateData.category !== undefined && !mongoose.Types.ObjectId.isValid(updateData.category)) {
    errors.push("Category must be a valid ObjectId.");
  }

  if (updateData.basePrice !== undefined) {
    if (isNaN(updateData.basePrice) || updateData.basePrice <= 0) {
      errors.push("Base price must be a number greater than 0.");
    }
  }

  if (updateData.variants !== undefined) {
    if (!Array.isArray(updateData.variants)) {
      errors.push("Variants must be an array.");
    } else {
      updateData.variants.forEach((variant, index) => {
        if (!variant.sku || typeof variant.sku !== 'string' || variant.sku.trim().length === 0) {
          errors.push(`Variant ${index + 1}: SKU is required.`);
        }

        if (!variant.price || isNaN(variant.price) || variant.price <= 0) {
          errors.push(`Variant ${index + 1}: Valid price is required and must be greater than 0.`);
        }

        if (variant.stock === undefined || isNaN(variant.stock) || variant.stock < 0) {
          errors.push(`Variant ${index + 1}: Valid stock is required and must be 0 or greater.`);
        }
      });

      // Check for duplicate SKUs
      const skus = updateData.variants.map(v => v.sku);
      const duplicateSKUs = skus.filter((sku, index) => skus.indexOf(sku) !== index);
      if (duplicateSKUs.length > 0) {
        errors.push(`Duplicate SKUs found: ${duplicateSKUs.join(', ')}`);
      }
    }
  }

  if (updateData.description !== undefined && updateData.description.length > 5000) {
    errors.push("Description must not exceed 5000 characters.");
  }

  if (updateData.discount !== undefined) {
    if (isNaN(updateData.discount) || updateData.discount < 0 || updateData.discount > 100) {
      errors.push("Discount must be a number between 0 and 100.");
    }
  }

  if (updateData.images !== undefined && !Array.isArray(updateData.images)) {
    errors.push("Images must be an array.");
  }

  if (updateData.tags !== undefined && !Array.isArray(updateData.tags)) {
    errors.push("Tags must be an array.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate query parameters for product listing
 * @param {Object} query - Query parameters
 * @returns {Object} - Validation result
 */
export const validateProductQuery = (query) => {
  const errors = [];
  const cleanQuery = {};

  // Page validation
  if (query.page !== undefined) {
    const page = parseInt(query.page);
    if (isNaN(page) || page < 1) {
      errors.push("Page must be a positive integer.");
    } else {
      cleanQuery.page = page;
    }
  }

  // Limit validation
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push("Limit must be between 1 and 100.");
    } else {
      cleanQuery.limit = limit;
    }
  }

  // Category validation
  if (query.category !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(query.category)) {
      errors.push("Category must be a valid ObjectId.");
    } else {
      cleanQuery.category = query.category;
    }
  }

  // Price range validation
  if (query.minPrice !== undefined) {
    const minPrice = parseFloat(query.minPrice);
    if (isNaN(minPrice) || minPrice < 0) {
      errors.push("Minimum price must be a non-negative number.");
    } else {
      cleanQuery.minPrice = minPrice;
    }
  }

  if (query.maxPrice !== undefined) {
    const maxPrice = parseFloat(query.maxPrice);
    if (isNaN(maxPrice) || maxPrice < 0) {
      errors.push("Maximum price must be a non-negative number.");
    } else {
      cleanQuery.maxPrice = maxPrice;
    }
  }

  if (cleanQuery.minPrice !== undefined && cleanQuery.maxPrice !== undefined) {
    if (cleanQuery.minPrice > cleanQuery.maxPrice) {
      errors.push("Minimum price cannot be greater than maximum price.");
    }
  }

  // Sort validation
  if (query.sortBy !== undefined) {
    const validSortOptions = ['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest', 'oldest'];
    if (!validSortOptions.includes(query.sortBy)) {
      errors.push(`Sort option must be one of: ${validSortOptions.join(', ')}`);
    } else {
      cleanQuery.sortBy = query.sortBy;
    }
  }

  // Search validation
  if (query.search !== undefined) {
    if (typeof query.search !== 'string' || query.search.trim().length === 0) {
      errors.push("Search term must be a non-empty string.");
    } else if (query.search.trim().length > 100) {
      errors.push("Search term must not exceed 100 characters.");
    } else {
      cleanQuery.search = query.search.trim();
    }
  }

  // Brand validation
  if (query.brand !== undefined) {
    if (typeof query.brand !== 'string' || query.brand.trim().length === 0) {
      errors.push("Brand must be a non-empty string.");
    } else {
      cleanQuery.brand = query.brand.trim();
    }
  }

  // Published status validation
  if (query.isPublished !== undefined) {
    if (query.isPublished !== 'true' && query.isPublished !== 'false') {
      errors.push("isPublished must be 'true' or 'false'.");
    } else {
      cleanQuery.isPublished = query.isPublished;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanQuery
  };
};

/**
 * Validate stock update data
 * @param {Object} stockData - Stock update data
 * @returns {Object} - Validation result
 */
export const validateStockUpdate = (stockData) => {
  const errors = [];

  if (!stockData.variantSku || typeof stockData.variantSku !== 'string' || stockData.variantSku.trim().length === 0) {
    errors.push("Variant SKU is required.");
  }

  if (stockData.stockChange === undefined || isNaN(stockData.stockChange)) {
    errors.push("Stock change must be a number.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
