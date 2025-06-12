import { apiSlice } from '../api/apiSlice';

export const divisionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllDivisions: builder.query({
      query: () => ({
        url: '/division/all',
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Division'],
    }),
    upsertDivision: builder.mutation({
      query: (divisionData) => ({
        url: '/division/upsert',
        method: 'POST',
        body: divisionData,
      }),
      invalidatesTags: ['Division'],
    }),
  }),
});

export const {
  useGetAllDivisionsQuery,
  useUpsertDivisionMutation,
} = divisionApiSlice; 