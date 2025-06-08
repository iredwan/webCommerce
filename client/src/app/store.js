'use client';

import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice';
import webColorReducer from '../features/webColor/webColorSlice';
import { apiSlice } from '../features/api/apiSlice';
// import other reducers...

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    webColor: webColorReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    // ...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});