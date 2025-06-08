'use client';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  colors: {
    primaryColor: '#C62828',
    secondaryColor: '#FFFFFF',
    accentColor: '#81D4FA',
    backgroundColor: '#F0F4F8',
    textColor: '#263238'
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  message: ''
};

const webColorSlice = createSlice({
  name: 'webColor',
  initialState,
  reducers: {
    setColors: (state, action) => {
      state.colors = action.payload;
    },
    resetColors: (state) => {
      state.colors = initialState.colors;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    resetState: (state) => {
      return initialState;
    }
  },
});

export const { 
  setColors, 
  resetColors, 
  setStatus, 
  setError, 
  setMessage, 
  resetState 
} = webColorSlice.actions;

export default webColorSlice.reducer;