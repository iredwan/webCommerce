import { apiSlice } from '../api/apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/user/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/user/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    registerWithRef: builder.mutation({
      query: (userData) => ({
        url: '/user/register-with-ref',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/user/logout',
        method: 'POST',
      }),
    }),
    getUser: builder.query({
      query: () => '/user/get-user',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/user/get-user-by-id/${id}`,
      providesTags: ['User'],
    }),
    getAllUsers: builder.query({
      query: (params) => ({
        url: '/user/get-all-users',
        params: params,
      }),
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/user/update-user/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/delete-user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterWithRefMutation,
  useLogoutMutation,
  useGetUserQuery,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice; 