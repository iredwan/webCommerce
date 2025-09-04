/**
 * Invoice validation utilities
 * Provides validation functions for invoice-related operations
 */

import mongoose from "mongoose";

/**
 * Validate invoice creation data
 * @param {Object} invoiceData - Invoice data to validate
 * @returns {Object} - Validation result
 */
export const validateInvoiceCreation = (invoiceData) => {
  const errors = [];

  // Required fields validation
  if (!invoiceData.user || !mongoose.Types.ObjectId.isValid(invoiceData.user)) {
    errors.push("Valid user ID is required.");
  }

  if (!invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
    errors.push("Invoice items are required and must be a non-empty array.");
  }

  // Validate each invoice item
  if (invoiceData.items && Array.isArray(invoiceData.items)) {
    invoiceData.items.forEach((item, index) => {
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

      // Validate total amount calculation
      if (item.price && item.quantity) {
        const expectedTotal = item.price * item.quantity;
        if (item.totalAmount && Math.abs(item.totalAmount - expectedTotal) > 0.01) {
          errors.push(`Item ${index + 1}: Total amount does not match price × quantity.`);
        }
      }
    });
  }

  // Validate billing address
  if (!invoiceData.billingAddress) {
    errors.push("Billing address is required.");
  } else {
    const billing = invoiceData.billingAddress;
    
    if (!billing.fullName || typeof billing.fullName !== 'string' || billing.fullName.trim().length === 0) {
      errors.push("Billing: Full name is required.");
    }

    if (!billing.phone || typeof billing.phone !== 'string' || billing.phone.trim().length === 0) {
      errors.push("Billing: Phone number is required.");
    }

    if (!billing.address || typeof billing.address !== 'string' || billing.address.trim().length === 0) {
      errors.push("Billing: Address is required.");
    }

    if (!billing.city || typeof billing.city !== 'string' || billing.city.trim().length === 0) {
      errors.push("Billing: City is required.");
    }

    if (!billing.country || typeof billing.country !== 'string' || billing.country.trim().length === 0) {
      errors.push("Billing: Country is required.");
    }
  }

  // Validate financial fields
  if (invoiceData.subtotal !== undefined && (isNaN(invoiceData.subtotal) || invoiceData.subtotal < 0)) {
    errors.push("Subtotal must be a valid number and cannot be negative.");
  }

  if (invoiceData.totalTax !== undefined && (isNaN(invoiceData.totalTax) || invoiceData.totalTax < 0)) {
    errors.push("Total tax must be a valid number and cannot be negative.");
  }

  if (invoiceData.shippingCost !== undefined && (isNaN(invoiceData.shippingCost) || invoiceData.shippingCost < 0)) {
    errors.push("Shipping cost must be a valid number and cannot be negative.");
  }

  if (invoiceData.totalAmount !== undefined && (isNaN(invoiceData.totalAmount) || invoiceData.totalAmount <= 0)) {
    errors.push("Total amount must be a valid number and greater than 0.");
  }

  // Validate taxes array if provided
  if (invoiceData.taxes && Array.isArray(invoiceData.taxes)) {
    invoiceData.taxes.forEach((tax, index) => {
      if (tax.rate !== undefined && (isNaN(tax.rate) || tax.rate < 0 || tax.rate > 100)) {
        errors.push(`Tax ${index + 1}: Rate must be between 0 and 100.`);
      }
      if (tax.amount !== undefined && (isNaN(tax.amount) || tax.amount < 0)) {
        errors.push(`Tax ${index + 1}: Amount must be a non-negative number.`);
      }
    });
  }

  // Validate discount if provided
  if (invoiceData.discount) {
    const discount = invoiceData.discount;
    
    if (discount.type && !["percent", "flat"].includes(discount.type)) {
      errors.push("Discount type must be either 'percent' or 'flat'.");
    }

    if (discount.value !== undefined && (isNaN(discount.value) || discount.value < 0)) {
      errors.push("Discount value must be a non-negative number.");
    }

    if (discount.type === "percent" && discount.value > 100) {
      errors.push("Percentage discount cannot exceed 100%.");
    }

    if (discount.amount !== undefined && (isNaN(discount.amount) || discount.amount < 0)) {
      errors.push("Discount amount must be a non-negative number.");
    }
  }

  // Validate status and payment fields
  if (invoiceData.status && !["draft", "sent", "paid", "overdue", "cancelled"].includes(invoiceData.status)) {
    errors.push("Invalid invoice status.");
  }

  if (invoiceData.paymentStatus && !["pending", "paid", "failed", "refunded", "partial"].includes(invoiceData.paymentStatus)) {
    errors.push("Invalid payment status.");
  }

  if (invoiceData.paymentMethod && !["COD", "Bkash", "Nagad", "Card", "Paypal", "Bank Transfer"].includes(invoiceData.paymentMethod)) {
    errors.push("Invalid payment method.");
  }

  // Validate dates
  if (invoiceData.issueDate && isNaN(Date.parse(invoiceData.issueDate))) {
    errors.push("Invalid issue date format.");
  }

  if (invoiceData.dueDate && isNaN(Date.parse(invoiceData.dueDate))) {
    errors.push("Invalid due date format.");
  }

  if (invoiceData.issueDate && invoiceData.dueDate) {
    const issueDate = new Date(invoiceData.issueDate);
    const dueDate = new Date(invoiceData.dueDate);
    if (dueDate <= issueDate) {
      errors.push("Due date must be after issue date.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate invoice update data
 * @param {Object} updateData - Invoice update data to validate
 * @returns {Object} - Validation result
 */
export const validateInvoiceUpdate = (updateData) => {
  const errors = [];

  // Validate status if provided
  if (updateData.status && !["draft", "sent", "paid", "overdue", "cancelled"].includes(updateData.status)) {
    errors.push("Invalid invoice status.");
  }

  // Validate payment status if provided
  if (updateData.paymentStatus && !["pending", "paid", "failed", "refunded", "partial"].includes(updateData.paymentStatus)) {
    errors.push("Invalid payment status.");
  }

  // Validate payment method if provided
  if (updateData.paymentMethod && !["COD", "Bkash", "Nagad", "Card", "Paypal", "Bank Transfer"].includes(updateData.paymentMethod)) {
    errors.push("Invalid payment method.");
  }

  // Validate financial fields if provided
  if (updateData.subtotal !== undefined && (isNaN(updateData.subtotal) || updateData.subtotal < 0)) {
    errors.push("Subtotal must be a valid number and cannot be negative.");
  }

  if (updateData.totalTax !== undefined && (isNaN(updateData.totalTax) || updateData.totalTax < 0)) {
    errors.push("Total tax must be a valid number and cannot be negative.");
  }

  if (updateData.shippingCost !== undefined && (isNaN(updateData.shippingCost) || updateData.shippingCost < 0)) {
    errors.push("Shipping cost must be a valid number and cannot be negative.");
  }

  if (updateData.totalAmount !== undefined && (isNaN(updateData.totalAmount) || updateData.totalAmount <= 0)) {
    errors.push("Total amount must be a valid number and greater than 0.");
  }

  if (updateData.paidAmount !== undefined && (isNaN(updateData.paidAmount) || updateData.paidAmount < 0)) {
    errors.push("Paid amount must be a valid number and cannot be negative.");
  }

  // Validate billing address if provided
  if (updateData.billingAddress) {
    const billing = updateData.billingAddress;
    
    if (billing.fullName !== undefined && (typeof billing.fullName !== 'string' || billing.fullName.trim().length === 0)) {
      errors.push("Billing: Full name must be a non-empty string.");
    }

    if (billing.phone !== undefined && (typeof billing.phone !== 'string' || billing.phone.trim().length === 0)) {
      errors.push("Billing: Phone number must be a non-empty string.");
    }

    if (billing.address !== undefined && (typeof billing.address !== 'string' || billing.address.trim().length === 0)) {
      errors.push("Billing: Address must be a non-empty string.");
    }

    if (billing.city !== undefined && (typeof billing.city !== 'string' || billing.city.trim().length === 0)) {
      errors.push("Billing: City must be a non-empty string.");
    }

    if (billing.country !== undefined && (typeof billing.country !== 'string' || billing.country.trim().length === 0)) {
      errors.push("Billing: Country must be a non-empty string.");
    }
  }

  // Validate dates if provided
  if (updateData.issueDate && isNaN(Date.parse(updateData.issueDate))) {
    errors.push("Invalid issue date format.");
  }

  if (updateData.dueDate && isNaN(Date.parse(updateData.dueDate))) {
    errors.push("Invalid due date format.");
  }

  // Validate notes and terms length
  if (updateData.notes !== undefined && typeof updateData.notes !== 'string') {
    errors.push("Notes must be a string.");
  }

  if (updateData.notes && updateData.notes.length > 1000) {
    errors.push("Notes must not exceed 1000 characters.");
  }

  if (updateData.terms !== undefined && typeof updateData.terms !== 'string') {
    errors.push("Terms must be a string.");
  }

  if (updateData.terms && updateData.terms.length > 1000) {
    errors.push("Terms must not exceed 1000 characters.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate payment data
 * @param {Object} paymentData - Payment data to validate
 * @returns {Object} - Validation result
 */
export const validatePaymentData = (paymentData) => {
  const errors = [];

  if (!paymentData.amount || isNaN(paymentData.amount) || paymentData.amount <= 0) {
    errors.push("Payment amount is required and must be greater than 0.");
  }

  if (paymentData.method && !["COD", "Bkash", "Nagad", "Card", "Paypal", "Bank Transfer"].includes(paymentData.method)) {
    errors.push("Invalid payment method.");
  }

  if (paymentData.notes && typeof paymentData.notes !== 'string') {
    errors.push("Payment notes must be a string.");
  }

  if (paymentData.notes && paymentData.notes.length > 500) {
    errors.push("Payment notes must not exceed 500 characters.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
