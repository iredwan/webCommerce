'use client';

import { apiSlice } from '../api/apiSlice';

export const userInfoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: () => 'user-info/get',
      keepUnusedDataFor: 5,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          if (err?.error?.status === 401) {
            // We don't need to do anything here - the transformErrorResponse will handle it
          }
        }
      },
      validateStatus: (response, result) => {
        return true;
      },
      transformResponse: (response) => {
        if (!response || response.status === false || !response.user) {
          return {
            status: false,
            user: null,
            message: response?.message || 'Failed to fetch user info',
          };
        }

        return response;
      },
      transformErrorResponse: (error) => {
        const status = error.status || 'UNKNOWN';
        let message = error.data?.message || 'An error occurred';
        
        if (status === 401) {
          message = 'Please login';
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`API Error (${status}): ${message}`);
          }
        } else {
          console.warn(`API Error (${status}): ${message}`);
        }
        
        return {
          status: status,
          message: message
        };
      }
    }),
  }),
});

export const {
  useGetUserInfoQuery,
  useLazyGetUserInfoQuery,
} = userInfoApiSlice;
