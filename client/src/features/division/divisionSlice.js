import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  divisions: [],
  selectedDivision: null,
  loading: false,
  error: null,
};

const divisionSlice = createSlice({
  name: 'division',
  initialState,
  reducers: {
    setDivisions: (state, action) => {
      state.divisions = action.payload;
      state.error = null;
    },
    setSelectedDivision: (state, action) => {
      state.selectedDivision = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearDivisionState: (state) => {
      state.divisions = [];
      state.selectedDivision = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setDivisions,
  setSelectedDivision,
  setLoading,
  setError,
  clearDivisionState,
} = divisionSlice.actions;

export default divisionSlice.reducer;

// Selectors
export const selectAllDivisions = (state) => state.division.divisions;
export const selectSelectedDivision = (state) => state.division.selectedDivision;
export const selectDivisionLoading = (state) => state.division.loading;
export const selectDivisionError = (state) => state.division.error; 