import { apiSlice } from '../api/apiSlice';

export const districtApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllDistricts: builder.query({
      query: () => ({
        url: '/district/all',
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
      providesTags: ['District'],
    }),
    getDistrictsByDivision: builder.query({
      query: (divisionId) => ({
        url: `/district/by-division/${divisionId}`,
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
      providesTags: ['District'],
    }),
    upsertDistrict: builder.mutation({
      query: (districtData) => ({
        url: '/district/upsert',
        method: 'POST',
        body: districtData,
      }),
      invalidatesTags: ['District'],
    }),
  }),
});

export const {
  useGetAllDistrictsQuery,
  useGetDistrictsByDivisionQuery,
  useUpsertDistrictMutation,
} = districtApiSlice; 