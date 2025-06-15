import { apiSlice } from '../api/apiSlice';

export const userOTPApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendOTP: builder.mutation({
      query: (contact) => ({
        url: '/user/otp',
        method: 'POST',
        body: { contact },
      }),
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: '/user/verify-otp',
        method: 'POST',
        credentials: 'include',
        body: {
          contact: data.contact,
          otp: data.otp,
        },
      }),
    }),
  }),
});

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
} = userOTPApiSlice; 