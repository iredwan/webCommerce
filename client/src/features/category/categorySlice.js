'use client';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    addCategory: (state, action) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action) => {
      const index = state.categories.findIndex(
        (category) => category._id === action.payload._id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    removeCategory: (state, action) => {
      state.categories = state.categories.filter(
        (category) => category._id !== action.payload
      );
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    removeCategoryImage: (state, action) => {
      const { categoryId, imageId } = action.payload;
      const categoryIndex = state.categories.findIndex(
        (category) => category._id === categoryId
      );
      
      if (categoryIndex !== -1 && state.categories[categoryIndex].categoryImg) {
        state.categories[categoryIndex].categoryImg = 
          state.categories[categoryIndex].categoryImg.filter(
            (img) => img._id !== imageId
          );
      }

      if (state.selectedCategory && 
          state.selectedCategory._id === categoryId && 
          state.selectedCategory.categoryImg) {
        state.selectedCategory.categoryImg = 
          state.selectedCategory.categoryImg.filter(
            (img) => img._id !== imageId
          );
      }
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
  },
});

export const {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setSelectedCategory,
  clearSelectedCategory,
  removeCategoryImage,
  setLoading,
  setError,
  clearError,
} = categorySlice.actions;

export default categorySlice.reducer;

// Selectors
export const selectAllCategories = (state) => state.category.categories;
export const selectCategoryById = (state, id) => 
  state.category.categories.find(category => category._id === id);
export const selectParentCategories = (state) => 
  state.category.categories.filter(category => !category.parentCategory);
export const selectChildCategories = (state, parentId) => 
  state.category.categories.filter(
    category => category.parentCategory && category.parentCategory === parentId
  );
export const selectSelectedCategory = (state) => state.category.selectedCategory;
export const selectCategoryLoading = (state) => state.category.loading;
export const selectCategoryError = (state) => state.category.error;
