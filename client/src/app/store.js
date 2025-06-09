'use client';

import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice';
import webColorReducer from '../features/webColor/webColorSlice';
import userReducer from '../features/user/userSlice';
import userOTPReducer from '../features/userOTP/userOTPSlice';
import { apiSlice } from '../features/api/apiSlice';
// import other reducers...

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    user: userReducer,
    userOTP: userOTPReducer,
    webColor: webColorReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    // ...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});