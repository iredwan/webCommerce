import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.user = action.payload;
      state.error = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearUserInfo: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setUserInfo,
  setLoading,
  setError,
  clearUserInfo,
} = userInfoSlice.actions;

export default userInfoSlice.reducer;

// ✅ Selectors
export const selectUserInfo = (state) => state.userInfo.user;
export const selectUserInfoLoading = (state) => state.userInfo.loading;
export const selectUserInfoError = (state) => state.userInfo.error;
export const selectIsAuthenticated = (state) => Boolean(state.userInfo.user);
