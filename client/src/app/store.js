'use client';

import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice';
import webColorReducer from '../features/webColor/webColorSlice';
import userReducer from '../features/user/userSlice';
import userOTPReducer from '../features/userOTP/userOTPSlice';
import divisionReducer from '../features/division/divisionSlice';
import districtReducer from '../features/district/districtSlice';
import policeStationReducer from '../features/policeStation/policeStationSlice';
import { apiSlice } from '../features/api/apiSlice';
// import other reducers...

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    user: userReducer,
    userOTP: userOTPReducer,
    division: divisionReducer,
    district: districtReducer,
    policeStation: policeStationReducer,
    webColor: webColorReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    // ...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});