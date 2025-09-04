/**
 * Order validation utilities
 * Provides validation functions for order-related operations
 */

import mongoose from "mongoose";

/**
 * Validate order creation data
 * @param {Object} orderData - Order data to validate
 * @returns {Object} - Validation result
 */
export const validateOrderCreation = (orderData) => {
  const errors = [];

  // Required fields validation
  if (!orderData.user || !mongoose.Types.ObjectId.isValid(orderData.user)) {
    errors.push("Valid user ID is required.");
  }

  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push("Order items are required and must be a non-empty array.");
  }

  // Validate each order item
  if (orderData.items && Array.isArray(orderData.items)) {
    orderData.items.forEach((item, index) => {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        errors.push(`Item ${index + 1}: Valid product ID is required.`);
      }

      if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
        errors.push(`Item ${index + 1}: Product name is required.`);
      }

      if (!item.price || isNaN(item.price) || item.price <= 0) {
        errors.push(`Item ${index + 1}: Valid price is required and must be greater than 0.`);
      }

      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Valid quantity is required and must be greater than 0.`);
      }

      // Validate variant SKU if provided
      if (item.variantSku && (typeof item.variantSku !== 'string' || item.variantSku.trim().length === 0)) {
        errors.push(`Item ${index + 1}: Variant SKU must be a non-empty string if provided.`);
      }
    });
  }

  // Validate shipping information
  if (!orderData.shipping) {
    errors.push("Shipping information is required.");
  } else {
    const shipping = orderData.shipping;
    
    if (!shipping.fullName || typeof shipping.fullName !== 'string' || shipping.fullName.trim().length === 0) {
      errors.push("Shipping: Full name is required.");
    }

    if (!shipping.phone || typeof shipping.phone !== 'string' || shipping.phone.trim().length === 0) {
      errors.push("Shipping: Phone number is required.");
    }

    if (!shipping.address || typeof shipping.address !== 'string' || shipping.address.trim().length === 0) {
      errors.push("Shipping: Address is required.");
    }

    if (!shipping.city || typeof shipping.city !== 'string' || shipping.city.trim().length === 0) {
      errors.push("Shipping: City is required.");
    }

    if (!shipping.country || typeof shipping.country !== 'string' || shipping.country.trim().length === 0) {
      errors.push("Shipping: Country is required.");
    }
  }

  // Validate payment information if provided
  if (orderData.payment) {
    const payment = orderData.payment;
    const validPaymentMethods = ["COD", "Bkash", "Nagad", "Card", "Paypal"];
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (payment.method && !validPaymentMethods.includes(payment.method)) {
      errors.push(`Payment method must be one of: ${validPaymentMethods.join(', ')}`);
    }

    if (payment.status && !validPaymentStatuses.includes(payment.status)) {
      errors.push(`Payment status must be one of: ${validPaymentStatuses.join(', ')}`);
    }
  }

  // Validate pricing fields if provided
  if (orderData.itemsPrice !== undefined && (isNaN(orderData.itemsPrice) || orderData.itemsPrice < 0)) {
    errors.push("Items price must be a valid number and cannot be negative.");
  }

  if (orderData.shippingPrice !== undefined && (isNaN(orderData.shippingPrice) || orderData.shippingPrice < 0)) {
    errors.push("Shipping price must be a valid number and cannot be negative.");
  }

  if (orderData.taxPrice !== undefined && (isNaN(orderData.taxPrice) || orderData.taxPrice < 0)) {
    errors.push("Tax price must be a valid number and cannot be negative.");
  }

  if (orderData.totalPrice !== undefined && (isNaN(orderData.totalPrice) || orderData.totalPrice <= 0)) {
    errors.push("Total price must be a valid number and greater than 0.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate order update data
 * @param {Object} updateData - Order update data to validate
 * @returns {Object} - Validation result
 */
export const validateOrderUpdate = (updateData) => {
  const errors = [];

  // Validate delivery status if provided
  if (updateData.deliveryStatus) {
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(updateData.deliveryStatus)) {
      errors.push(`Delivery status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Validate payment information if provided
  if (updateData.payment) {
    const payment = updateData.payment;
    const validPaymentMethods = ["COD", "Bkash", "Nagad", "Card", "Paypal"];
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (payment.method && !validPaymentMethods.includes(payment.method)) {
      errors.push(`Payment method must be one of: ${validPaymentMethods.join(', ')}`);
    }

    if (payment.status && !validPaymentStatuses.includes(payment.status)) {
      errors.push(`Payment status must be one of: ${validPaymentStatuses.join(', ')}`);
    }
  }

  // Validate shipping information if provided
  if (updateData.shipping) {
    const shipping = updateData.shipping;
    
    if (shipping.fullName !== undefined && (typeof shipping.fullName !== 'string' || shipping.fullName.trim().length === 0)) {
      errors.push("Shipping: Full name must be a non-empty string.");
    }

    if (shipping.phone !== undefined && (typeof shipping.phone !== 'string' || shipping.phone.trim().length === 0)) {
      errors.push("Shipping: Phone number must be a non-empty string.");
    }

    if (shipping.address !== undefined && (typeof shipping.address !== 'string' || shipping.address.trim().length === 0)) {
      errors.push("Shipping: Address must be a non-empty string.");
    }

    if (shipping.city !== undefined && (typeof shipping.city !== 'string' || shipping.city.trim().length === 0)) {
      errors.push("Shipping: City must be a non-empty string.");
    }

    if (shipping.country !== undefined && (typeof shipping.country !== 'string' || shipping.country.trim().length === 0)) {
      errors.push("Shipping: Country must be a non-empty string.");
    }
  }

  // Validate pricing fields if provided
  if (updateData.itemsPrice !== undefined && (isNaN(updateData.itemsPrice) || updateData.itemsPrice < 0)) {
    errors.push("Items price must be a valid number and cannot be negative.");
  }

  if (updateData.shippingPrice !== undefined && (isNaN(updateData.shippingPrice) || updateData.shippingPrice < 0)) {
    errors.push("Shipping price must be a valid number and cannot be negative.");
  }

  if (updateData.taxPrice !== undefined && (isNaN(updateData.taxPrice) || updateData.taxPrice < 0)) {
    errors.push("Tax price must be a valid number and cannot be negative.");
  }

  if (updateData.totalPrice !== undefined && (isNaN(updateData.totalPrice) || updateData.totalPrice <= 0)) {
    errors.push("Total price must be a valid number and greater than 0.");
  }

  // Validate note if provided
  if (updateData.note !== undefined && typeof updateData.note !== 'string') {
    errors.push("Note must be a string.");
  }

  if (updateData.note && updateData.note.length > 500) {
    errors.push("Note must not exceed 500 characters.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate status change
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - New status to change to
 * @returns {Object} - Validation result
 */
export const validateStatusChange = (currentStatus, newStatus) => {
  const errors = [];
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(newStatus)) {
    errors.push(`New status must be one of: ${validStatuses.join(', ')}`);
    return { isValid: false, errors };
  }

  // Define valid status transitions
  const statusTransitions = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [], // Final state
    cancelled: [] // Final state
  };

  if (!statusTransitions[currentStatus].includes(newStatus)) {
    errors.push(`Cannot change status from '${currentStatus}' to '${newStatus}'. Valid transitions: ${statusTransitions[currentStatus].join(', ') || 'none'}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate payment status change
 * @param {string} paymentStatus - Payment status to validate
 * @returns {Object} - Validation result
 */
export const validatePaymentStatus = (paymentStatus) => {
  const errors = [];
  const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

  if (!validPaymentStatuses.includes(paymentStatus)) {
    errors.push(`Payment status must be one of: ${validPaymentStatuses.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
