'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include', 
  }),
  tagTypes: [
    'UserOTP',
    'User',
    'WebColor',
    'Division',
    'District',
    'PoliceStation',
    'UserInfo',
  ],
  endpoints: () => ({}),
});
