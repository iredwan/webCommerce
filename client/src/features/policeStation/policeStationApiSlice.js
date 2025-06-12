import { apiSlice } from '../api/apiSlice';

export const policeStationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPoliceStations: builder.query({
      query: () => ({
        url: '/ps/all',
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
      providesTags: ['PoliceStation'],
    }),
    getPoliceStationsByDistrict: builder.query({
      query: (districtId) => ({
        url: `/ps/by-district/${districtId}`,
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
      providesTags: ['PoliceStation'],
    }),
    upsertPoliceStation: builder.mutation({
      query: (psData) => ({
        url: '/ps/upsert',
        method: 'POST',
        body: psData,
      }),
      invalidatesTags: ['PoliceStation'],
    }),
  }),
});

export const {
  useGetAllPoliceStationsQuery,
  useGetPoliceStationsByDistrictQuery,
  useUpsertPoliceStationMutation,
} = policeStationApiSlice; 