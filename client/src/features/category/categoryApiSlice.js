'use client';

import { apiSlice } from "../api/apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: (params) => ({
        url: "/category/get-all",
        params: params,
      }),
      providesTags: ["Categories"],
    }),
    getCategory: builder.query({
      query: (id) => `/category/get/${id}`,
      providesTags: ["Categories"],
    }),
    getCategoryByName: builder.query({
      query: (name) => `/category/get-by-name/${name}`,
      providesTags: ["Categories"],
    }),
    getCategoryForAdmin: builder.query({
      query: (id) => `/category/admin/get/${id}`,
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "/category/create",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/category/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategoryImage: builder.mutation({
      query: ({ id, categoryImg }) => ({
        url: `/category/delete-image/${id}`,
        method: "PATCH",
        body: { categoryImg },
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryQuery,
  useGetCategoryByNameQuery,
  useGetCategoryForAdminQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryImageMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
