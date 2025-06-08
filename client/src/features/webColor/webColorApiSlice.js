'use client';

import { apiSlice } from '../api/apiSlice';

export const webColorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWebColors: builder.query({
      query: () => '/web-color/get',
      transformResponse: (response) => response,
      providesTags: ['WebColor'],
    }),
    
    upsertWebColors: builder.mutation({
      query: (colorData) => ({
        url: '/web-color/upsert',
        method: 'POST',
        body: colorData,
      }),
      invalidatesTags: ['WebColor'],
    }),
  }),
});

export const {
  useGetWebColorsQuery,
  useUpsertWebColorsMutation,
} = webColorApiSlice;