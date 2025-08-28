'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  setCategories, 
  setSelectedCategory, 
  setLoading, 
  setError, 
  addCategory,
  updateCategory as updateCategoryAction,
  removeCategory,
  removeCategoryImage
} from './categorySlice';

// Thunk to fetch all categories
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (params, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/get-all${params ? `?${new URLSearchParams(params)}` : ''}`);
      const data = await response.json();
      
      if (!data.status) {
        dispatch(setError(data.message));
        return rejectWithValue(data.message);
      }
      
      dispatch(setCategories(data.data));
      return data.data;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Thunk to fetch a category by ID
export const fetchCategoryById = createAsyncThunk(
  'category/fetchCategoryById',
  async (id, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/get/${id}`);
      const data = await response.json();
      
      if (!data.status) {
        dispatch(setError(data.message));
        return rejectWithValue(data.message);
      }
      
      dispatch(setSelectedCategory(data.data));
      return data.data;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Thunk to create a new category
export const createNewCategory = createAsyncThunk(
  'category/createNewCategory',
  async (categoryData, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!data.status) {
        dispatch(setError(data.message));
        return rejectWithValue(data.message);
      }
      
      dispatch(addCategory(data.data));
      return data.data;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Thunk to update a category
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, data: categoryData }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!data.status) {
        dispatch(setError(data.message));
        return rejectWithValue(data.message);
      }
      
      dispatch(updateCategoryAction(data.data));
      return data.data;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Thunk to delete a category
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!data.status) {
        dispatch(setError(data.message));
        return rejectWithValue(data.message);
      }
      
      dispatch(removeCategory(id));
      return id;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Thunk to delete a category image
export const deleteCategoryImage = createAsyncThunk(
  'category/deleteCategoryImage',
  async ({ id, categoryImg }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/delete-image/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryImg }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!data.status) {
        dispatch(setError(data.message));
        return rejectWithValue(data.message);
      }
      
      dispatch(removeCategoryImage({ categoryId: id, imageId: categoryImg }));
      return { categoryId: id, imageId: categoryImg };
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
