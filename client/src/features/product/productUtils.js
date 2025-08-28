/**
 * Utility functions for product operations
 */

// Format product price with currency symbol
export const formatPrice = (price, currency = '$') => {
  return `${currency}${parseFloat(price).toFixed(2)}`;
};

// Calculate discount percentage
export const calculateDiscountPercentage = (basePrice, discountedPrice) => {
  if (!basePrice || !discountedPrice || basePrice <= 0) return 0;
  const discountPercentage = ((basePrice - discountedPrice) / basePrice) * 100;
  return Math.round(discountPercentage);
};

// Sort products by different criteria
export const sortProducts = (products, sortBy) => {
  if (!products || !Array.isArray(products)) return [];
  
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price-asc':
      return sortedProducts.sort((a, b) => {
        const aPrice = a.discountedPrice || a.basePrice;
        const bPrice = b.discountedPrice || b.basePrice;
        return aPrice - bPrice;
      });
    case 'price-desc':
      return sortedProducts.sort((a, b) => {
        const aPrice = a.discountedPrice || a.basePrice;
        const bPrice = b.discountedPrice || b.basePrice;
        return bPrice - aPrice;
      });
    case 'name-asc':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      return sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    default:
      return sortedProducts;
  }
};

// Filter products by category
export const filterProductsByCategory = (products, categoryId) => {
  if (!categoryId) return products;
  return products.filter(product => product.category?._id === categoryId || product.category === categoryId);
};

// Filter products by price range
export const filterProductsByPriceRange = (products, priceRange) => {
  if (!priceRange || !Array.isArray(priceRange) || priceRange.length !== 2) return products;
  const [min, max] = priceRange;
  
  return products.filter(product => {
    const price = product.discountedPrice || product.basePrice;
    return price >= min && price <= max;
  });
};

// Search products by name, description or tags
export const searchProducts = (products, searchText) => {
  if (!searchText) return products;
  
  const searchLower = searchText.toLowerCase();
  
  return products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower)) ||
      (Array.isArray(product.tags) && product.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  });
};

// Check if product is in stock
export const isProductInStock = (product) => {
  if (!product) return false;
  
  // Check total stock
  if (product.totalStock && product.totalStock > 0) return true;
  
  // Check individual variant stock
  if (Array.isArray(product.variants)) {
    return product.variants.some(variant => variant.stock > 0);
  }
  
  return false;
};

// Get available variants for a product
export const getAvailableVariants = (product) => {
  if (!product || !Array.isArray(product.variants)) return [];
  
  return product.variants.filter(variant => variant.stock > 0);
};

// Check if product is on sale (has discount)
export const isProductOnSale = (product) => {
  return product && product.discount && product.discount > 0 && product.discountedPrice < product.basePrice;
};

// Get primary image URL from product
export const getProductPrimaryImage = (product) => {
  if (!product) return '';
  
  // Check if there's a primary image marked in the product
  if (Array.isArray(product.images)) {
    const primaryImage = product.images.find(img => img.isPrimary);
    if (primaryImage) return primaryImage.url;
    
    // Return first image if no primary is marked
    if (product.images.length > 0) return product.images[0].url;
  }
  
  // Fallback to placeholder
  return '/assets/images/product-placeholder.png';
};

// Format product features for display
export const formatProductFeatures = (product) => {
  if (!product || !product.features) return [];
  
  if (typeof product.features === 'string') {
    // Split string by newlines or commas if it's a string
    return product.features
      .split(/[\n,]+/)
      .map(feature => feature.trim())
      .filter(feature => feature.length > 0);
  } else if (Array.isArray(product.features)) {
    return product.features;
  }
  
  return [];
};

// Validate product data before submission
export const validateProductData = (productData) => {
  const errors = {};
  
  if (!productData.name || productData.name.trim() === '') {
    errors.name = 'Product name is required';
  }
  
  if (!productData.basePrice || isNaN(parseFloat(productData.basePrice))) {
    errors.basePrice = 'Valid base price is required';
  }
  
  if (!productData.category) {
    errors.category = 'Category is required';
  }
  
  if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
    errors.variants = 'At least one variant is required';
  } else {
    // Check each variant
    const variantErrors = [];
    productData.variants.forEach((variant, index) => {
      const currentErrors = {};
      
      if (!variant.name || variant.name.trim() === '') {
        currentErrors.name = 'Variant name is required';
      }
      
      if (!variant.sku || variant.sku.trim() === '') {
        currentErrors.sku = 'SKU is required';
      }
      
      if (isNaN(parseInt(variant.stock))) {
        currentErrors.stock = 'Valid stock quantity is required';
      }
      
      if (Object.keys(currentErrors).length > 0) {
        variantErrors[index] = currentErrors;
      }
    });
    
    if (variantErrors.length > 0) {
      errors.variants = variantErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
