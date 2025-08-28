import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  filteredProducts: [],
  currentProduct: null,
  productStats: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    priceRange: [0, 10000],
    sortBy: 'createdAt-desc',
    search: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  }
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.filteredProducts = action.payload;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setProductStats: (state, action) => {
      state.productStats = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Filtering and sorting
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: null,
        priceRange: [0, 10000],
        sortBy: 'createdAt-desc',
        search: '',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // Local state updates for optimistic UI updates
    addProduct: (state, action) => {
      state.products = [action.payload, ...state.products];
    },
    updateProductInList: (state, action) => {
      const index = state.products.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.currentProduct && state.currentProduct._id === action.payload._id) {
        state.currentProduct = action.payload;
      }
    },
    removeProductFromList: (state, action) => {
      state.products = state.products.filter(p => p._id !== action.payload);
      if (state.currentProduct && state.currentProduct._id === action.payload) {
        state.currentProduct = null;
      }
    },
    // Stock management
    updateProductStock: (state, action) => {
      const { productId, variantSku, newStock } = action.payload;
      
      // Update in product list
      const productIndex = state.products.findIndex(p => p._id === productId);
      if (productIndex !== -1) {
        const product = state.products[productIndex];
        const variantIndex = product.variants.findIndex(v => v.sku === variantSku);
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock = newStock;
          
          // Recalculate total stock
          product.totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          
          state.products[productIndex] = product;
        }
      }
      
      // Update in current product if it matches
      if (state.currentProduct && state.currentProduct._id === productId) {
        const variantIndex = state.currentProduct.variants.findIndex(v => v.sku === variantSku);
        if (variantIndex !== -1) {
          state.currentProduct.variants[variantIndex].stock = newStock;
          
          // Recalculate total stock
          state.currentProduct.totalStock = state.currentProduct.variants.reduce(
            (sum, v) => sum + v.stock, 0
          );
        }
      }
    },
  },
});

export const {
  setProducts,
  setCurrentProduct,
  clearCurrentProduct,
  setProductStats,
  setLoading,
  setError,
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  addProduct,
  updateProductInList,
  removeProductFromList,
  updateProductStock,
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.product.products;
export const selectFilteredProducts = (state) => state.product.filteredProducts;
export const selectCurrentProduct = (state) => state.product.currentProduct;
export const selectProductStats = (state) => state.product.productStats;
export const selectProductLoading = (state) => state.product.loading;
export const selectProductError = (state) => state.product.error;
export const selectProductFilters = (state) => state.product.filters;
export const selectProductPagination = (state) => state.product.pagination;

export default productSlice.reducer;
