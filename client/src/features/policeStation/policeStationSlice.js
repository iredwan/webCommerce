import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  policeStations: [],
  selectedPoliceStation: null,
  districtPoliceStations: [], // Police stations for selected district
  loading: false,
  error: null,
};

const policeStationSlice = createSlice({
  name: 'policeStation',
  initialState,
  reducers: {
    setPoliceStations: (state, action) => {
      state.policeStations = action.payload;
      state.error = null;
    },
    setSelectedPoliceStation: (state, action) => {
      state.selectedPoliceStation = action.payload;
      state.error = null;
    },
    setDistrictPoliceStations: (state, action) => {
      state.districtPoliceStations = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearPoliceStationState: (state) => {
      state.policeStations = [];
      state.selectedPoliceStation = null;
      state.districtPoliceStations = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setPoliceStations,
  setSelectedPoliceStation,
  setDistrictPoliceStations,
  setLoading,
  setError,
  clearPoliceStationState,
} = policeStationSlice.actions;

export default policeStationSlice.reducer;

// Selectors
export const selectAllPoliceStations = (state) => state.policeStation.policeStations;
export const selectSelectedPoliceStation = (state) => state.policeStation.selectedPoliceStation;
export const selectDistrictPoliceStations = (state) => state.policeStation.districtPoliceStations;
export const selectPoliceStationLoading = (state) => state.policeStation.loading;
export const selectPoliceStationError = (state) => state.policeStation.error; 