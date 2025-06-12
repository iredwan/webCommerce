import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  districts: [],
  selectedDistrict: null,
  divisionDistricts: [], // Districts for selected division
  loading: false,
  error: null,
};

const districtSlice = createSlice({
  name: 'district',
  initialState,
  reducers: {
    setDistricts: (state, action) => {
      state.districts = action.payload;
      state.error = null;
    },
    setSelectedDistrict: (state, action) => {
      state.selectedDistrict = action.payload;
      state.error = null;
    },
    setDivisionDistricts: (state, action) => {
      state.divisionDistricts = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearDistrictState: (state) => {
      state.districts = [];
      state.selectedDistrict = null;
      state.divisionDistricts = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setDistricts,
  setSelectedDistrict,
  setDivisionDistricts,
  setLoading,
  setError,
  clearDistrictState,
} = districtSlice.actions;

export default districtSlice.reducer;

// Selectors
export const selectAllDistricts = (state) => state.district.districts;
export const selectSelectedDistrict = (state) => state.district.selectedDistrict;
export const selectDivisionDistricts = (state) => state.district.divisionDistricts;
export const selectDistrictLoading = (state) => state.district.loading;
export const selectDistrictError = (state) => state.district.error; 