import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  otpSent: false,
  otpVerified: false,
  contact: null,
  attempts: 0,
  error: null,
};

const userOTPSlice = createSlice({
  name: 'userOTP',
  initialState,
  reducers: {
    setOTPSent: (state, action) => {
      state.otpSent = true;
      state.contact = action.payload.contact;
      state.attempts = action.payload.attempts || 0;
      state.error = null;
    },
    setOTPVerified: (state) => {
      state.otpVerified = true;
      state.error = null;
    },
    setOTPError: (state, action) => {
      state.error = action.payload;
    },
    resetOTPState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.contact = null;
      state.attempts = 0;
      state.error = null;
    },
  },
});

export const {
  setOTPSent,
  setOTPVerified,
  setOTPError,
  resetOTPState,
} = userOTPSlice.actions;

export default userOTPSlice.reducer;

// Selectors
export const selectOTPSent = (state) => state.userOTP.otpSent;
export const selectOTPVerified = (state) => state.userOTP.otpVerified;
export const selectOTPContact = (state) => state.userOTP.contact;
export const selectOTPAttempts = (state) => state.userOTP.attempts;
export const selectOTPError = (state) => state.userOTP.error; 