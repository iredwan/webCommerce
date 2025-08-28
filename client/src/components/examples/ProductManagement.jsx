'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useToggleProductPublishMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} from '@/features/product/productApiSlice';
import {
  setProducts,
  setCurrentProduct,
  selectProducts,
  selectCurrentProduct,
  selectProductLoading,
  selectProductError
} from '@/features/product/productSlice';
import { formatPrice, isProductInStock, getProductPrimaryImage } from '@/features/product/productUtils';

const ProductManagement = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const currentProduct = useSelector(selectCurrentProduct);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);

  // Example query with pagination params
  const { 
    data: productsData, 
    isLoading: isProductsLoading, 
    isError: isProductsError 
  } = useGetAllProductsQuery({ page: 1, limit: 10 });

  // Example mutation hooks
  const [togglePublish, { isLoading: isTogglingPublish }] = useToggleProductPublishMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Example of loading a specific product
  const productId = '123'; // This would typically come from route params or state
  const { 
    data: productData, 
    isLoading: isProductLoading 
  } = useGetProductByIdQuery(productId, {
    // Skip the query if we don't have an ID
    skip: !productId,
  });

  // Example of updating Redux state when API data is loaded
  useEffect(() => {
    if (productsData?.data) {
      dispatch(setProducts(productsData.data));
    }
  }, [productsData, dispatch]);

  useEffect(() => {
    if (productData?.data) {
      dispatch(setCurrentProduct(productData.data));
    }
  }, [productData, dispatch]);

  // Example handler for toggling product publish status
  const handleTogglePublish = async (id) => {
    try {
      await togglePublish(id).unwrap();
      // Success handling
    } catch (err) {
      // Error handling
      console.error('Failed to toggle publish status:', err);
    }
  };

  // Example handler for updating product
  const handleUpdateProduct = async (id, data) => {
    try {
      await updateProduct({ id, data }).unwrap();
      // Success handling
    } catch (err) {
      // Error handling
      console.error('Failed to update product:', err);
    }
  };

  // Example handler for deleting product
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      // Success handling
    } catch (err) {
      // Error handling
      console.error('Failed to delete product:', err);
    }
  };

  // Render products list
  return (
    <div className="product-management">
      <h1>Product Management</h1>
      
      {isProductsLoading ? (
        <div>Loading products...</div>
      ) : isProductsError ? (
        <div>Error loading products</div>
      ) : (
        <div className="products-list">
          {products.map(product => (
            <div key={product._id} className="product-item">
              <img 
                src={getProductPrimaryImage(product)} 
                alt={product.name}
                width={100}
                height={100}
              />
              <div className="product-details">
                <h3>{product.name}</h3>
                <p>Price: {formatPrice(product.basePrice)}</p>
                {product.discountedPrice && (
                  <p>Sale Price: {formatPrice(product.discountedPrice)}</p>
                )}
                <p>Status: {product.isPublished ? 'Published' : 'Draft'}</p>
                <p>In Stock: {isProductInStock(product) ? 'Yes' : 'No'}</p>
              </div>
              <div className="product-actions">
                <button 
                  onClick={() => handleTogglePublish(product._id)}
                  disabled={isTogglingPublish}
                >
                  {product.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleUpdateProduct(product._id, { name: 'Updated Name' })}
                  disabled={isUpdating}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Current Product Details */}
      {currentProduct && (
        <div className="current-product">
          <h2>Current Product: {currentProduct.name}</h2>
          {/* Additional product details would go here */}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
