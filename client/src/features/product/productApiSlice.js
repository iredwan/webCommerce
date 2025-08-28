import { apiSlice } from "../api/apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products (public)
    getAllProducts: builder.query({
      query: (params) => ({
        url: "/products/get-all",
        params: params,
      }),
      providesTags: ["Products"],
    }),

    // Get all products (admin/manager/seller)
    getAllProductsForManage: builder.query({
      query: (params) => ({
        url: "/products/all-for-manage",
        params: params,
      }),
      providesTags: ["Products"],
    }),

    // Get product by ID
    getProductById: builder.query({
      query: (id) => `/products/get/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    // Get product by ID for admin
    getProductByIdAdmin: builder.query({
      query: (id) => `/products/admin/get/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    // Get product by slug
    getProductBySlug: builder.query({
      query: (slug) => `/products/public/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Products", slug }],
    }),

    // Search products
    searchProducts: builder.query({
      query: (searchParams) => ({
        url: "/products/public/search",
        params: searchParams,
      }),
      providesTags: ["Products"],
    }),

    // Create product
    createProduct: builder.mutation({
      query: (productData) => ({
        url: "/products/create",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Products"],
    }),

    // Update product
    updateProduct: builder.mutation({
      query: ({ id, data }) => {
        console.log('API Update endpoint being called:', `/products/update/${id}`);
        return {
          url: `/products/update/${id}`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // Delete product (soft delete)
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // Delete product image
    deleteProductImage: builder.mutation({
      query: (imageName) => ({
        url: `/products/image/${imageName}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // Toggle product publish status
    toggleProductPublish: builder.mutation({
      query: (id) => ({
        url: `/products/toggle/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // Update product stock
    updateProductStock: builder.mutation({
      query: ({ id, variantSku, stockChange }) => ({
        url: `/products/${id}/stock`,
        method: "PATCH",
        body: { variantSku, stockChange },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // Get products by category
    getProductsByCategory: builder.query({
      query: (categoryId) => `/products/public/category/${categoryId}`,
      providesTags: ["Products"],
    }),

    // Get featured products
    getFeaturedProducts: builder.query({
      query: (params) => ({
        url: "/products/public/featured",
        params: params,
      }),
      providesTags: ["Products"],
    }),

    // Get products on sale
    getProductsOnSale: builder.query({
      query: (params) => ({
        url: "/products/public/on-sale",
        params: params,
      }),
      providesTags: ["Products"],
    }),

    // Get related products
    getRelatedProducts: builder.query({
      query: (productId) => `/products/public/${productId}/related`,
      providesTags: ["Products"],
    }),

    // Apply discount to product
    applyDiscount: builder.mutation({
      query: ({ id, discountData }) => ({
        url: `/products/${id}/discount/apply`,
        method: "PATCH",
        body: discountData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // Remove discount from product
    removeDiscount: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/discount/remove`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // Get inventory low stock products
    getLowStockProducts: builder.query({
      query: (params) => ({
        url: "/products/inventory/low-stock",
        params: params,
      }),
      providesTags: ["Products"],
    }),

    // Get product analytics
    getProductStats: builder.query({
      query: (params) => ({
        url: "/products/stats",
        params: params,
      }),
      providesTags: ["ProductStats"],
    }),

    // Get top selling products
    getTopSellingProducts: builder.query({
      query: (params) => ({
        url: "/products/analytics/top-selling",
        params: params,
      }),
      providesTags: ["ProductStats"],
    }),

    // Increment product view count
    incrementProductView: builder.mutation({
      query: (id) => ({
        url: `/products/public/${id}/view`,
        method: "PATCH",
      }),
    }),

    // Add product variant
    addProductVariant: builder.mutation({
      query: ({ id, variantData }) => ({
        url: `/products/${id}/variants`,
        method: "POST",
        body: variantData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        "Products",
      ],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetAllProductsForManageQuery,
  useGetProductByIdQuery,
  useGetProductByIdAdminQuery,
  useGetProductBySlugQuery,
  useSearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteProductImageMutation,
  useToggleProductPublishMutation,
  useUpdateProductStockMutation,
  useGetProductsByCategoryQuery,
  useGetFeaturedProductsQuery,
  useGetProductsOnSaleQuery,
  useGetRelatedProductsQuery,
  useApplyDiscountMutation,
  useRemoveDiscountMutation,
  useGetLowStockProductsQuery,
  useGetProductStatsQuery,
  useGetTopSellingProductsQuery,
  useIncrementProductViewMutation,
  useAddProductVariantMutation,
} = productApiSlice;
