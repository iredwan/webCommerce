'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useDeleteCategoryImageMutation
} from '@/features/category/categoryApiSlice';
import { selectUserInfo } from '@/features/userInfo/userInfoSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaTag,
  FaImage,
  FaUpload
} from 'react-icons/fa';
import { MdCategory, MdDescription } from 'react-icons/md';
import { useForm, Controller } from 'react-hook-form';
import CustomInput from '@/components/CustomInput';
import CustomInputWithForm from '@/components/CustomInputWithForm';
import CategorySearchWithForm from '@/components/CategorySearchWithForm';
import ImageUploader from '@/components/ImageUploader';
import Pagination from '@/components/Pagination';
import deleteConfirm from '@/utils/deleteConfirm';
import uploadFilesWithProgress from '@/utils/fileUpload';

export default function CategoriesPage() {
  const router = useRouter();
  const userInfo = useSelector(selectUserInfo);
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  // React Hook Form setup
  const { control, handleSubmit: handleFormSubmit, watch, setValue, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      categoryName: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
      parentCategory: '',
      categoryImg: []
    }
  });

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParent, setFilterParent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingImageIds, setDeletingImageIds] = useState([]);

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      const currentImages = getValues('categoryImg') || [];
      currentImages.forEach(image => {
        if (image.preview && image.preview.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [getValues]);

  // API hooks
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch
  } = useGetAllCategoriesQuery({
    page: currentPage,
    limit,
    search: searchTerm,
    ...(filterParent && { parentCategory: filterParent })
  });

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [deleteCategoryImage] = useDeleteCategoryImageMutation();

  // Get unique parent categories for filter
  const uniqueParents = categoriesData?.data 
    ? [...new Set(categoriesData.data
        .filter(cat => cat.parentCategory)
        .map(cat => cat.parentCategory.categoryName))]
    : [];

  // Helper functions
  const resetForm = () => {
    // Clean up any preview URLs before resetting
    const currentImages = getValues('categoryImg') || [];
    currentImages.forEach(image => {
      if (image.preview && image.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image.preview);
      }
    });

    reset({
      categoryName: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
      parentCategory: '',
      categoryImg: []
    });
    setSelectedCategory(null);
    setEditMode(false);
    setUploadProgress(0);
    setDeletingImageIds([]);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setEditMode(true);
    
    // Set form values
    setValue('categoryName', category.categoryName || '');
    setValue('description', category.description || '');
    setValue('metaTitle', category.metaTitle || '');
    setValue('metaDescription', category.metaDescription || '');
    setValue('parentCategory', category.parentCategory?._id || '');
    setValue('categoryImg', category.categoryImg || []);
    
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    const confirmed = await deleteConfirm(
      'Delete Category',
      `Are you sure you want to delete "${category.categoryName}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteCategory(category._id).unwrap();
        toast.success('Category deleted successfully');
        refetch();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return [];

    try {
      setUploadProgress(0);
      
      const uploadedImages = await uploadFilesWithProgress(
        files,
        {
          maxFiles: 10, // Allow up to 10 images for categories
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          maxFileSize: 5 * 1024 * 1024, // 5MB per file
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
          onError: (error) => {
            toast.error(`Failed to upload images: ${error}`);
            throw new Error(error);
          }
        }
      );

      // Create preview URLs for files and map to uploaded images
      const filesArray = Array.isArray(files) ? files : [files];
      const processedImages = uploadedImages.map((image, index) => {
        const file = filesArray[index];
        let preview = '';
        if (file && file instanceof File) {
          preview = URL.createObjectURL(file);
        }
        
        return {
          image: image.filename,
          preview,
          isDisplayed: index === 0, // First image is displayed by default
          order: index,
          uploadedAt: new Date().toISOString()
        };
      });

      // Update form with new images
      const currentImages = getValues('categoryImg') || [];
      setValue('categoryImg', [...currentImages, ...processedImages]);

      setUploadProgress(0);
      toast.success(`${processedImages.length} image(s) uploaded successfully`);
      return processedImages;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload images');
      setUploadProgress(0);
      return [];
    }
  };

  const removeImage = async (imageIndex) => {
    const currentImages = getValues('categoryImg') || [];
    const imageToRemove = currentImages[imageIndex];

    if (!imageToRemove) {
      toast.error('Image not found');
      return;
    }

    try {
      // Clean up preview URL if it exists
      if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      // If editing existing category and image has _id, delete from server
      if (editMode && selectedCategory && imageToRemove._id) {
        setDeletingImageIds(prev => [...prev, imageToRemove._id]);
        
        const response = await deleteCategoryImage({
          id: selectedCategory._id,
          categoryImg: imageToRemove._id
        }).unwrap();
        
        if (response.status === true) {
          toast.success('Image deleted successfully');
        } else {
          toast.error(response.message || 'Failed to delete image');
          setDeletingImageIds(prev => prev.filter(id => id !== imageToRemove._id));
          return;
        }
      }

      // Remove from form
      const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
      setValue('categoryImg', updatedImages);
      
    } catch (error) {
      console.error('Delete image error:', error);
      toast.error(error.data?.message || error.message || 'Failed to delete image');
      setDeletingImageIds(prev => prev.filter(id => id !== imageToRemove._id));
    } finally {
      if (imageToRemove._id) {
        setDeletingImageIds(prev => prev.filter(id => id !== imageToRemove._id));
      }
    }
  };

  const toggleImageDisplay = (imageIndex) => {
    const currentImages = getValues('categoryImg') || [];
    const updatedImages = currentImages.map((img, index) => ({
      ...img,
      isDisplayed: index === imageIndex ? !img.isDisplayed : img.isDisplayed
    }));
    setValue('categoryImg', updatedImages);
  };

  // Form submission
  const onSubmit = async (formData) => {
    try {
      // Validate required fields
      if (!formData.categoryName?.trim()) {
        toast.error('Category name is required');
        return;
      }

      const submitData = {
        categoryName: formData.categoryName.trim(),
        description: formData.description?.trim() || '',
        metaTitle: formData.metaTitle?.trim() || '',
        metaDescription: formData.metaDescription?.trim() || '',
        parentCategory: formData.parentCategory || null,
        categoryImg: formData.categoryImg || []
      };

      let response;
      if (editMode && selectedCategory) {
        response = await updateCategory({
          id: selectedCategory._id,
          data: submitData
        }).unwrap();
        
        if (response.status === true) {
          toast.success('Category updated successfully');
        } else {
          toast.error(response.message || 'Failed to update category');
          return;
        }
      } else {
        response = await createCategory(submitData).unwrap();
        
        if (response.status === true) {
          toast.success('Category created successfully');
        } else {
          toast.error(response.message || 'Failed to create category');
          return;
        }
      }

      setShowModal(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.data?.message || error.message || 'Failed to save category');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading categories: {error.message}</p>
          <button
            onClick={refetch}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
        <div>
          <h1 className="text-center md:text-left text-2xl font-semibold text-gray-900 dark:text-white">
            Category Management
          </h1>
          <p className="text-center md:text-left text-gray-600 dark:text-gray-300 mt-1">
            Manage your product categories and hierarchy
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomInput
            label="Search Categories"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Parent
            </label>
            <select
              value={filterParent}
              onChange={(e) => setFilterParent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              <option value="null">Root Categories</option>
              {uniqueParents.map(parent => (
                <option key={parent} value={parent}>{parent}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterParent('');
                setCurrentPage(1);
              }}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto p-2">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Parent Category
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-2 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categoriesData?.data?.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-2 md:px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* Mobile: image above name */}
                      <div className="block md:hidden w-full">
                        <div className="flex flex-col items-start">
                          <div className="h-10 w-10 flex-shrink-0 mb-2">
                            {category.categoryImg?.[0] ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={category.categoryImg[0].image.startsWith('http') 
                                     ? category.categoryImg[0].image 
                                     : imageBaseUrl + category.categoryImg[0].image}
                                alt={category.categoryName}
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = "https://placehold.co/100/lightgray/gray?text=No+Image";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <MdCategory className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white text-wrap">
                            {category.categoryName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {category.slug}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 my-1">
                            Parent: {category.parentCategory?.categoryName || 'None'}
                          </div>
                        </div>
                      </div>
                      {/* Desktop: image left of name */}
                      <div className="hidden md:flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {category.categoryImg?.[0] ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={category.categoryImg[0].image.startsWith('http') 
                                   ? category.categoryImg[0].image 
                                   : imageBaseUrl + category.categoryImg[0].image}
                              alt={category.categoryName}
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://placehold.co/100/lightgray/gray?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <MdCategory className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.categoryName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {category.slug}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="hidden sm:table-cell px-6 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {category.parentCategory?.categoryName || (
                        <span className="text-gray-500 italic">Root Category</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="hidden sm:table-cell px-6 py-3">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {category.description || (
                        <span className="text-gray-500 italic">No description</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td className="px-2 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit Category"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Category"
                        disabled={isDeleting}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {categoriesData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={categoriesData.pagination.totalPages}
              onPageChange={setCurrentPage}
              totalItems={categoriesData.pagination.totalCategories}
              itemsPerPage={limit}
              onItemsPerPageChange={setLimit}
            />
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-30">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editMode ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInputWithForm
                    label="Category Name"
                    name="categoryName"
                    control={control}
                    placeholder="Enter category name"
                    required
                    rules={{ required: "Category name is required" }}
                  />

                  <div>
                    <CategorySearchWithForm
                      label="Parent Category"
                      name="parentCategory"
                      control={control}
                      placeholder="Search for parent category (optional)"
                      onSelectCategory={(category) => {
                        setValue('parentCategory', category ? category._id : '');
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter category description (optional)"
                      />
                    )}
                  />
                </div>
              </div>

              {/* SEO Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">SEO Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInputWithForm
                    label="Meta Title"
                    name="metaTitle"
                    control={control}
                    placeholder="Enter meta title (optional)"
                  />

                  <CustomInputWithForm
                    label="Meta Description"
                    name="metaDescription"
                    control={control}
                    placeholder="Enter meta description (optional)"
                  />
                </div>
              </div>

              {/* Category Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Category Images</h3>

                <div>
                  <ImageUploader
                    onUpload={handleImageUpload}
                    multiple={true}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    progress={uploadProgress}
                  />
                </div>

                {/* Display uploaded images */}
                <Controller
                  name="categoryImg"
                  control={control}
                  render={({ field: { value } }) => (
                    value && value.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {value.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.preview
                                    ? image.preview
                                    : (image.image.startsWith('http')
                                        ? image.image
                                        : imageBaseUrl + image.image)}
                              alt={`Category Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/300x200/lightgray/gray?text=Image+Not+Found";
                              }}
                            />
                            <div className="absolute top-1 right-1 flex gap-1">
                              <button
                                type="button"
                                onClick={() => toggleImageDisplay(index)}
                                className={`p-1 rounded text-xs ${image.isDisplayed
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-500 text-white'
                                  }`}
                                title={image.isDisplayed ? 'Hide image' : 'Display image'}
                              >
                                {image.isDisplayed ? <FaEye className="w-3 h-3" /> : <FaEyeSlash className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-1 bg-red-500 text-white rounded text-xs"
                                disabled={deletingImageIds.includes(image._id)}
                                title="Remove image"
                              >
                                {deletingImageIds.includes(image._id) ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-1 border-b-1 border-white"></div>
                                ) : (
                                  <FaTrash className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  {editMode ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
