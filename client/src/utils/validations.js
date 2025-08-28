/**
 * validators.js
 * Reusable validation utilities for an e-commerce platform
 * Covers: User Registration/Login, Shipping, Product, Coupon, Reviews
 */

const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneBD: /^01[3-9]\d{8}$/, // without +880
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
  postalCode: /^\d{4}$/,
};

// ✅ Common Validators
export const isRequired = (value) => (!!value ? null : 'This field is required');
export const isValidEmail = (value) => (!value ? 'Email is required' : regex.email.test(value) ? null : 'Invalid email format');
export const isValidPhone = (value) => (!value ? 'Phone is required' : regex.phoneBD.test(value.replace(/^\+880/, '')) ? null : 'Invalid Bangladeshi phone number');
export const isDateOfBirth = (value) => {
  if (!value) return 'Date of birth is required';
  let day, month, year, date;
  if (value instanceof Date && !isNaN(value.getTime())) {
    day = value.getDate();
    month = value.getMonth() + 1;
    year = value.getFullYear();
    date = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    let dateParts = trimmed.split(/[\/\-]/);
    if (dateParts.length !== 3) return 'Invalid date format (DD/MM/YYYY)';
    day = parseInt(dateParts[0], 10);
    month = parseInt(dateParts[1], 10);
    year = parseInt(dateParts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Invalid date format (DD/MM/YYYY)';
    date = new Date(year, month - 1, day);
  } else {
    return 'Invalid date format (DD/MM/YYYY)';
  }
  const today = new Date();
  const minAge = 16;
  const maxAge = 50;
  // Check if date is valid and matches input
  if (
    isNaN(date.getTime()) ||
    day < 1 || day > 31 ||
    month < 1 || month > 12 ||
    year < 1900 || year > today.getFullYear() ||
    date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year
  ) {
    return 'Invalid date format (DD/MM/YYYY)';
  }
  // Calculate age
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) 
    ? age - 1 
    : age;
  
  if (adjustedAge < minAge) return `Must be at least ${minAge} years old`;
  if (adjustedAge > maxAge) return `Must be no more than ${maxAge} years old`;
  
  return null;
};
export const isStrongPassword = (value) => (!value ? 'Password is required' : regex.password.test(value) ? null : 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
export const isMatch = (value, matchWith) => (value === matchWith ? null : 'Values do not match');
export const isPositive = (value) => (parseFloat(value) > 0 ? null : 'Value must be positive');
export const isWithinRange = (value, min, max) => (value >= min && value <= max ? null : `Value must be between ${min} and ${max}`);
export const hasMinLength = (value, length) => (value?.length >= length ? null : `Must be at least ${length} characters`);
export const hasMaxLength = (value, length) => (value?.length <= length ? null : `Must be no more than ${length} characters`);

// ✅ User Registration / Login
export const validateUser = {
  fullName: (value) => isRequired(value) || hasMinLength(value, 2),
  email: isValidEmail,
  phone: isValidPhone,
  password: isStrongPassword,
  confirmPassword: (value, original) => isMatch(value, original),
};

// ✅ Shipping / Checkout
export const validateShipping = {
  fullName: isRequired,
  phone: isValidPhone,
  email: (value) => !value ? null : isValidEmail(value),
  address1: isRequired,
  district: isRequired,
  upazila: isRequired,
};

// ✅ Product Add/Edit (Admin)
export const validateProduct = {
  name: (value) => isRequired(value) || hasMinLength(value, 3),
  category: isRequired,
  price: isPositive,
  discount: (value) => (value === '' || value === undefined) ? null : isWithinRange(Number(value), 0, 100),
  stock: (value) => Number.isInteger(+value) && +value >= 0 ? null : 'Stock must be a non-negative integer',
  sku: isRequired,
};

// ✅ Coupon Code / Promo
export const validateCoupon = {
  code: (value) => isRequired(value) || hasMaxLength(value, 20),
  discountType: isRequired,
  discountValue: isPositive,
  expiryDate: (value) => !value ? 'Expiry date is required' : new Date(value) > new Date() ? null : 'Expiry date must be in the future',
};

// ✅ Review / Rating Form
export const validateReview = {
  rating: (value) => value >= 1 && value <= 5 ? null : 'Rating must be between 1 and 5',
  reviewText: (value) => !value ? null : hasMaxLength(value, 500),
  reviewerName: (value) => isRequired(value) || hasMinLength(value, 2),
  email: (value) => !value ? null : isValidEmail(value),
};
