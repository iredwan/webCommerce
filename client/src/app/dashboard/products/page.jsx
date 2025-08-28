'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetAllProductsForManageQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductPublishMutation
} from '@/features/product/productApiSlice';
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
  FaBox,
  FaTag,
  FaDollarSign,
  FaCalendarAlt,
  FaImage
} from 'react-icons/fa';
import { MdPublish, MdUnpublished } from 'react-icons/md';
import { FiClock } from 'react-icons/fi';
import CustomInput from '@/components/CustomInput';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/DatePickerWithForm';
import TimeInput from '@/components/TimeInput';
import { useForm, Controller } from 'react-hook-form';
import CustomInputWithForm from '@/components/CustomInputWithForm';
import CustomSelectWithForm from '@/components/CustomSelectWithForm';
import CategorySearchWithForm from '@/components/CategorySearchWithForm';
import ImageUploader from '@/components/ImageUploader';
import Pagination from '@/components/Pagination';
import deleteConfirm from '@/utils/deleteConfirm';
import uploadFilesWithProgress from '@/utils/fileUpload';

export default function ProductsPage() {
  const router = useRouter();
  const userInfo = useSelector(selectUserInfo);
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
  
  // Debug log to check the image base URL

  // React Hook Form setup for the main form
  const { control, handleSubmit: handleFormSubmit, watch, setValue, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      brand: '',
      basePrice: '',
      discount: '',
      discountType: 'percent',
      discountSchedule: {
        startDate: '',
        startTime: '00:00',
        endDate: '',
        endTime: '23:59',
        isActive: false
      },
      color: '',
      size: '',
      unit: '',
      isPublished: false,
      isFeatured: false,
      isPromotedOnBanner: false,
      tags: '',
      metaTitle: '',
      metaDescription: '',
      relatedProducts: [],
      salesCount: 0,
      totalStock: '',
      variants: [],
      images: []
    }
  });
  
  // Watch form values for reactivity
  const formValues = watch();
  
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDiscountSchedule, setShowDiscountSchedule] = useState(false);
  
  // Separate form control for the filter section
  const filterForm = useForm();

  // Helper function to convert ISO date to dd/MM/yyyy format
  const convertISOToDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error converting ISO date:', isoDate, error);
      return '';
    }
  };
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    basePrice: '',
    discount: '',
    discountType: 'percent',
    discountSchedule: {
      startDate: '',
      startTime: '00:00',
      endDate: '',
      endTime: '23:59',
      isActive: false
    },
    color: '',
    size: '',
    unit: '',
    isPublished: false,
    isFeatured: false,
    isPromotedOnBanner: false,
    tags: '',
    metaTitle: '',
    metaDescription: '',
    relatedProducts: [],
    salesCount: 0,
    totalStock: '',
    variants: [],
    images: []
  });



  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // API hooks
  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useGetAllProductsForManageQuery({
    page: currentPage,
    limit,
    search: searchTerm,
    brand: filterBrand,
    category: filterCategory,
    ...(filterPublished && { isPublished: filterPublished })
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [togglePublish, { isLoading: isToggling }] = useToggleProductPublishMutation();
  
  // Remove the problematic useDeleteProductImageMutation import for now
  // We'll handle image deletion differently
  
  // State to track which specific images are being deleted
  const [deletingImageIds, setDeletingImageIds] = useState([]);

  // Default variant for new products
  const defaultVariant = {
    sku: '',
    color: '',
    size: '',
    unit: '',
    price: '',
    stock: '',
    discount: '',
    discountType: 'percent',
    discountSchedule: {
      startDate: '',
      startTime: '00:00',
      endDate: '',
      endTime: '23:59',
      isActive: false
    },
    images: []
  };

  // Auto-update discount schedules based on current date
  useEffect(() => {
    const updateDiscountSchedules = () => {
      setFormData(prev => {
        const now = new Date();

        // Product-level discount schedule
        let updatedDiscountSchedule = { ...prev.discountSchedule };
        if (prev.discountSchedule.startDate && prev.discountSchedule.endDate) {
          try {
            let start, end;
            
            // Parse start date and time
            let startDate;
            if (prev.discountSchedule.startDate.includes('/')) {
              const [day, month, year] = prev.discountSchedule.startDate.split('/');
              startDate = new Date(year, month - 1, day);
            } else {
              startDate = new Date(prev.discountSchedule.startDate);
            }
            // Add time to start date
            if (prev.discountSchedule.startTime) {
              try {
                const [hours, minutes] = prev.discountSchedule.startTime.split(':');
                const hoursInt = parseInt(hours, 10);
                const minutesInt = parseInt(minutes, 10);
                
                if (!isNaN(hoursInt) && !isNaN(minutesInt)) {
                  startDate.setHours(hoursInt, minutesInt, 0, 0);
                } else {
                  console.warn(`Invalid start time format: ${prev.discountSchedule.startTime}`);
                  startDate.setHours(0, 0, 0, 0); // Default to beginning of day
                }
              } catch (e) {
                console.error(`Error parsing start time: ${prev.discountSchedule.startTime}`, e);
                startDate.setHours(0, 0, 0, 0);
              }
            } else {
              startDate.setHours(0, 0, 0, 0);
            }
            start = startDate;
            
            // Parse end date and time
            let endDate;
            if (prev.discountSchedule.endDate.includes('/')) {
              const [day, month, year] = prev.discountSchedule.endDate.split('/');
              endDate = new Date(year, month - 1, day);
            } else {
              endDate = new Date(prev.discountSchedule.endDate);
            }
            // Add time to end date
            if (prev.discountSchedule.endTime) {
              try {
                const [hours, minutes] = prev.discountSchedule.endTime.split(':');
                const hoursInt = parseInt(hours, 10);
                const minutesInt = parseInt(minutes, 10);
                
                if (!isNaN(hoursInt) && !isNaN(minutesInt)) {
                  endDate.setHours(hoursInt, minutesInt, 59, 999);
                } else {
                  console.warn(`Invalid end time format: ${prev.discountSchedule.endTime}`);
                  endDate.setHours(23, 59, 59, 999); // Default to end of day
                }
              } catch (e) {
                console.error(`Error parsing end time: ${prev.discountSchedule.endTime}`, e);
                endDate.setHours(23, 59, 59, 999);
              }
            } else {
              // Default to end of day if no time specified
              endDate.setHours(23, 59, 59, 999);
            }
            end = endDate;
            
            
            const shouldBeActive = now >= start && now <= end;
            // If manually turned off, do not auto-enable
            if (shouldBeActive && !prev.discountSchedule.isActive) {
              // Do not auto-enable if user turned off
              updatedDiscountSchedule.isActive = false;
            } else if (shouldBeActive) {
              updatedDiscountSchedule.isActive = true;
            } else if (!shouldBeActive && prev.discountSchedule.isActive) {
              // If manually left on, do not auto-disable
              updatedDiscountSchedule.isActive = prev.discountSchedule.isActive;
            } else {
              updatedDiscountSchedule.isActive = false;
            }
          } catch (error) {
            console.error('Error parsing discount schedule dates:', error);
          }
        }

        // Variant-level discount schedules
        const updatedVariants = prev.variants.map(variant => {
          if (variant.discountSchedule?.startDate && variant.discountSchedule?.endDate) {
            try {
              let start, end;
              
              // Parse start date and time
              let startDate;
              if (variant.discountSchedule.startDate.includes('/')) {
                const [day, month, year] = variant.discountSchedule.startDate.split('/');
                startDate = new Date(year, month - 1, day);
              } else {
                startDate = new Date(variant.discountSchedule.startDate);
              }
              // Add time to start date
              if (variant.discountSchedule.startTime) {
                try {
                  const [hours, minutes] = variant.discountSchedule.startTime.split(':');
                  const hoursInt = parseInt(hours, 10);
                  const minutesInt = parseInt(minutes, 10);
                  
                  if (!isNaN(hoursInt) && !isNaN(minutesInt)) {
                    startDate.setHours(hoursInt, minutesInt, 0, 0);
                  } else {
                    console.warn(`Variant: Invalid start time format: ${variant.discountSchedule.startTime}`);
                    startDate.setHours(0, 0, 0, 0); // Default to beginning of day
                  }
                } catch (e) {
                  console.error(`Variant: Error parsing start time: ${variant.discountSchedule.startTime}`, e);
                  startDate.setHours(0, 0, 0, 0);
                }
              } else {
                startDate.setHours(0, 0, 0, 0);
              }
              start = startDate;
              
              // Parse end date and time
              let endDate;
              if (variant.discountSchedule.endDate.includes('/')) {
                const [day, month, year] = variant.discountSchedule.endDate.split('/');
                endDate = new Date(year, month - 1, day);
              } else {
                endDate = new Date(variant.discountSchedule.endDate);
              }
              // Add time to end date
              if (variant.discountSchedule.endTime) {
                try {
                  const [hours, minutes] = variant.discountSchedule.endTime.split(':');
                  const hoursInt = parseInt(hours, 10);
                  const minutesInt = parseInt(minutes, 10);
                  
                  if (!isNaN(hoursInt) && !isNaN(minutesInt)) {
                    endDate.setHours(hoursInt, minutesInt, 59, 999);
                  } else {
                    console.warn(`Variant: Invalid end time format: ${variant.discountSchedule.endTime}`);
                    endDate.setHours(23, 59, 59, 999); // Default to end of day
                  }
                } catch (e) {
                  console.error(`Variant: Error parsing end time: ${variant.discountSchedule.endTime}`, e);
                  endDate.setHours(23, 59, 59, 999);
                }
              } else {
                // Default to end of day if no time specified
                endDate.setHours(23, 59, 59, 999);
              }
              end = endDate;
              
              
              const shouldBeActive = now >= start && now <= end;
              if (shouldBeActive && !variant.discountSchedule.isActive) {
                // Do not auto-enable if user turned off
                return {
                  ...variant,
                  discountSchedule: {
                    ...variant.discountSchedule,
                    isActive: false
                  }
                };
              } else if (shouldBeActive) {
                return {
                  ...variant,
                  discountSchedule: {
                    ...variant.discountSchedule,
                    isActive: true
                  }
                };
              } else if (!shouldBeActive && variant.discountSchedule.isActive) {
                // If manually left on, do not auto-disable
                return variant;
              } else {
                return {
                  ...variant,
                  discountSchedule: {
                    ...variant.discountSchedule,
                    isActive: false
                  }
                };
              }
            } catch (error) {
              console.error('Error parsing variant discount schedule dates:', error);
            }
          }
          return variant;
        });

        return {
          ...prev,
          discountSchedule: updatedDiscountSchedule,
          variants: updatedVariants
        };
      });
    };

    updateDiscountSchedules();
    // Run more frequently to catch time changes more accurately
    const interval = setInterval(updateDiscountSchedules, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Reset form
  const resetForm = () => {
    // Default values for React Hook Form
    const defaultValues = {
      name: '',
      description: '',
      category: '',
      brand: '',
      basePrice: '',
      discount: '',
      discountType: 'percent',
      discountSchedule: {
        startDate: '',
        startTime: '00:00',
        endDate: '',
        endTime: '23:59',
        isActive: false
      },
      color: '',
      size: '',
      unit: '',
      isPublished: false,
      isFeatured: false,
      isPromotedOnBanner: false,
      tags: '',
      metaTitle: '',
      metaDescription: '',
      relatedProducts: [],
      salesCount: 0,
      totalStock: '',
      variants: [],
      images: []
    };
    
    // Reset React Hook Form
    reset(defaultValues);
    
    // Also reset legacy form state (until fully migrated)
    setFormData(defaultValues);
    
    setValidationErrors({});
    setEditMode(false);
    setSelectedProduct(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle variant changes
  // Function to ensure a variant has all required nested objects
  const ensureVariantStructure = (variant) => {
    const safeVariant = { ...variant };
    
    // Make sure the discount schedule exists and has all required fields
    if (!safeVariant.discountSchedule) {
      safeVariant.discountSchedule = {
        startDate: '',
        startTime: '00:00',
        endDate: '',
        endTime: '23:59',
        isActive: false
      };
    } else {
      safeVariant.discountSchedule = {
        startDate: safeVariant.discountSchedule.startDate || '',
        startTime: safeVariant.discountSchedule.startTime || '00:00',
        endDate: safeVariant.discountSchedule.endDate || '',
        endTime: safeVariant.discountSchedule.endTime || '23:59',
        isActive: !!safeVariant.discountSchedule.isActive
      };
    }
    
    return safeVariant;
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    
    // Ensure the variant has all required structures
    updatedVariants[index] = ensureVariantStructure(updatedVariants[index]);
    
    // Update the field value
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  // Handle variant discount schedule changes
  const handleVariantDiscountScheduleChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    
    // Ensure variant structure is complete before updating
    updatedVariants[index] = ensureVariantStructure(updatedVariants[index]);
    const currentVariant = updatedVariants[index];

    const newDiscountSchedule = {
      ...currentVariant.discountSchedule,
      [field]: value
    };
    


    // Also update in React Hook Form
    const currentHookVariants = watch('variants') || [];
    if (currentHookVariants[index]) {
      setValue(`variants[${index}].discountSchedule.${field}`, value);

    }

    // Auto-activate when both dates are set and current date is within range
    if (field === 'startDate' || field === 'endDate') {
      const startDate = field === 'startDate' ? value : currentVariant.discountSchedule.startDate;
      const endDate = field === 'endDate' ? value : currentVariant.discountSchedule.endDate;

      if (startDate && endDate) {
        const now = new Date();
        let start, end;

        // Parse dates based on format (dd/MM/yyyy from DatePicker or ISO from database)
        try {
          if (startDate.includes('/')) {
            const [day, month, year] = startDate.split('/');
            start = new Date(year, month - 1, day);
          } else {
            start = new Date(startDate);
          }

          if (endDate.includes('/')) {
            const [day, month, year] = endDate.split('/');
            end = new Date(year, month - 1, day);
          } else {
            end = new Date(endDate);
          }

          // Auto-activate if current date is within the discount period
          newDiscountSchedule.isActive = now >= start && now <= end;
        } catch (error) {
          console.error('Error parsing variant dates:', error);
          newDiscountSchedule.isActive = false;
        }
      } else if (startDate && !endDate) {
        // If only start date is set, activate if start date is today or in the past
        try {
          let start;
          if (startDate.includes('/')) {
            const [day, month, year] = startDate.split('/');
            start = new Date(year, month - 1, day);
          } else {
            start = new Date(startDate);
          }
          const now = new Date();
          newDiscountSchedule.isActive = now >= start;
        } catch (error) {
          console.error('Error parsing variant start date:', error);
          newDiscountSchedule.isActive = false;
        }
      } else {
        // If dates are cleared, deactivate
        newDiscountSchedule.isActive = false;
      }
    }

    updatedVariants[index] = {
      ...currentVariant,
      discountSchedule: newDiscountSchedule
    };

    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  // Handle product discount schedule changes
  const handleDiscountScheduleChange = (field, value) => {
    setFormData(prev => {
      // Ensure discount schedule exists
      const currentDiscountSchedule = prev.discountSchedule || {
        startDate: '',
        endDate: '',
        isActive: false
      };
      
      const newDiscountSchedule = {
        ...currentDiscountSchedule,
        [field]: value
      };

      // Auto-activate when both dates are set and current date is within range
      if (field === 'startDate' || field === 'endDate') {
        const startDate = field === 'startDate' ? value : prev.discountSchedule.startDate;
        const endDate = field === 'endDate' ? value : prev.discountSchedule.endDate;

        if (startDate && endDate) {
          const now = new Date();
          let start, end;

          // Parse dates based on format (dd/MM/yyyy from DatePicker or ISO from database)
          try {
            if (startDate.includes('/')) {
              const [day, month, year] = startDate.split('/');
              start = new Date(year, month - 1, day);
            } else {
              start = new Date(startDate);
            }

            if (endDate.includes('/')) {
              const [day, month, year] = endDate.split('/');
              end = new Date(year, month - 1, day);
            } else {
              end = new Date(endDate);
            }

            // Auto-activate if current date is within the discount period
            newDiscountSchedule.isActive = now >= start && now <= end;
          } catch (error) {
            console.error('Error parsing dates:', error);
            newDiscountSchedule.isActive = false;
          }
        } else if (startDate && !endDate) {
          // If only start date is set, activate if start date is today or in the past
          try {
            let start;
            if (startDate.includes('/')) {
              const [day, month, year] = startDate.split('/');
              start = new Date(year, month - 1, day);
            } else {
              start = new Date(startDate);
            }
            const now = new Date();
            newDiscountSchedule.isActive = now >= start;
          } catch (error) {
            console.error('Error parsing start date:', error);
            newDiscountSchedule.isActive = false;
          }
        } else {
          // If dates are cleared, deactivate
          newDiscountSchedule.isActive = false;
        }
      }

      return {
        ...prev,
        discountSchedule: newDiscountSchedule
      };
    });
  };

  // Add variant
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...defaultVariant }]
    }));
    
    // Also update React Hook Form state
    const currentVariants = getValues('variants') || [];
    setValue('variants', [...currentVariants, { ...defaultVariant }]);
  };

  // Remove variant
  const removeVariant = (index) => {
    const variantToRemove = formData.variants[index];
    
    // Check if the variant has any images
    if (variantToRemove.images && variantToRemove.images.length > 0) {
      toast.error('Please remove all images from this variant before deleting it.');
      return;
    }
    
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
    
    // Also update React Hook Form state
    setValue('variants', updatedVariants);
    
    toast.success('Variant removed successfully');
  };

  // Handle image change
  const handleImageChange = (file, type = 'product', variantIndex = null) => {
    if (!file) return;
    
    if (type === 'product') {
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, {
          file: file,
          isDisplayed: true,
          order: prev.images.length,
          uploadedAt: new Date(),
          preview: previewUrl
        }]
      }));
      
      // Update React Hook Form value as well to keep both in sync
      const currentImages = watch('images') || [];
      setValue('images', [
        ...currentImages, 
        {
          file: file,
          isDisplayed: true,
          order: currentImages.length,
          uploadedAt: new Date()
        }
      ]);
    } else if (type === 'variant' && variantIndex !== null) {
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      
      const updatedVariants = [...formData.variants];
      // Create a new array if it doesn't exist or ensure it's extensible
      if (!updatedVariants[variantIndex].images || Object.isExtensible(updatedVariants[variantIndex].images) === false) {
        updatedVariants[variantIndex].images = [];
      }
      
      // Create a new images array with the new image
      const newImage = {
        file: file,
        isDisplayed: true,
        order: updatedVariants[variantIndex].images ? updatedVariants[variantIndex].images.length : 0,
        uploadedAt: new Date(),
        preview: previewUrl
      };
      
      updatedVariants[variantIndex].images = [
        ...(updatedVariants[variantIndex].images || []),
        newImage
      ];
      
      // Also update the React Hook Form state for variant images
      const formVariants = getValues('variants') || [];
      if (!formVariants[variantIndex]) {
        formVariants[variantIndex] = {};
      }
      if (!formVariants[variantIndex].images) {
        formVariants[variantIndex].images = [];
      }
      formVariants[variantIndex].images.push(newImage);
      setValue(`variants[${variantIndex}].images`, formVariants[variantIndex].images);
      
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
      
      // Update React Hook Form value as well to keep both in sync
      const currentVariants = watch('variants') || [];
      const updatedHookVariants = [...currentVariants];
      
      if (!updatedHookVariants[variantIndex]) {
        updatedHookVariants[variantIndex] = {};
      }
      
      // Create a new array if it doesn't exist or ensure it's extensible
      if (!updatedHookVariants[variantIndex].images || Object.isExtensible(updatedHookVariants[variantIndex].images) === false) {
        updatedHookVariants[variantIndex].images = [];
      }
      
      // Create a new images array with the new image
      updatedHookVariants[variantIndex].images = [
        ...(updatedHookVariants[variantIndex].images || []),
        {
          file: file,
          isDisplayed: true,
          order: updatedHookVariants[variantIndex].images ? updatedHookVariants[variantIndex].images.length : 0,
          uploadedAt: new Date()
        }
      ];
      
      setValue('variants', updatedHookVariants);
    }
  };

  // Remove product image
  const removeProductImage = async (imageIndex) => {
    try {
      const imageToRemove = formData.images[imageIndex];
      
      // Mark this image as being deleted
      setDeletingImageIds(prev => [...prev, `product-${imageIndex}`]);
      
      // Clean up preview URL if it exists to prevent memory leaks
      if (imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      // If this is a server image (has image property but not file property), delete it from server
      if (imageToRemove && imageToRemove.image && !imageToRemove.file) {
        
        // Extract just the filename from the path if needed
        const imageName = imageToRemove.image.includes('/') 
          ? imageToRemove.image.split('/').pop() 
          : imageToRemove.image;
        
        // Call the API directly to delete the image from server
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/image/${imageName}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          
          if (response.ok) {
          } else {
            console.error(`Failed to delete image ${imageName}:`, response.statusText);
          }
        } catch (error) {
          console.error(`Error deleting image ${imageName}:`, error);
        }
      }
      
      // Remove from form state
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== imageIndex)
      }));
      
      // Also remove from React Hook Form value to keep both in sync
      const currentImages = watch('images') || [];
      setValue('images', currentImages.filter((_, index) => index !== imageIndex));
      
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error(error.data?.message || "Failed to remove image");
    } finally {
      // Remove from deleting state regardless of success or failure
      setDeletingImageIds(prev => prev.filter(id => id !== `product-${imageIndex}`));
    }
  };

  // Remove variant image
  const removeVariantImage = async (variantIndex, imageIndex) => {
    try {
      const updatedVariants = [...formData.variants];
      
      // Mark this image as being deleted
      setDeletingImageIds(prev => [...prev, `variant-${variantIndex}-${imageIndex}`]);
      
      // Clean up preview URL if it exists
      const imageToRemove = updatedVariants[variantIndex]?.images?.[imageIndex];
      if (imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      // If this is a server image (has image property but not file property), delete it from server
      if (imageToRemove && imageToRemove.image && !imageToRemove.file) {
        // Extract just the filename from the path if needed
        const imageName = imageToRemove.image.includes('/') 
          ? imageToRemove.image.split('/').pop() 
          : imageToRemove.image;
        
        // Call the API directly to delete the image from server
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/image/${imageName}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          
          if (!response.ok) {
            toast.error(`Failed to delete variant image: ${response.statusText}`);
          }
        } catch (error) {
          toast.error(`Error deleting variant image: ${error.message}`);
        }
      }
      
      // Create a new filtered images array
      if (updatedVariants[variantIndex] && updatedVariants[variantIndex].images) {
        const filteredImages = [];
        updatedVariants[variantIndex].images.forEach((img, idx) => {
          if (idx !== imageIndex) {
            filteredImages.push(img);
          }
        });
        updatedVariants[variantIndex].images = filteredImages;
      }
      
      // Update form state
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
      
      // Also update React Hook Form value
      const currentVariants = watch('variants') || [];
      const updatedHookVariants = [...currentVariants];
      
      if (updatedHookVariants[variantIndex] && updatedHookVariants[variantIndex].images) {
        // Create a new filtered images array for the hook form
        const filteredHookImages = [];
        updatedHookVariants[variantIndex].images.forEach((img, idx) => {
          if (idx !== imageIndex) {
            filteredHookImages.push(img);
          }
        });
        updatedHookVariants[variantIndex].images = filteredHookImages;
        setValue('variants', updatedHookVariants);
      }
      
      toast.success("Image removed successfully");
    } catch (error) {
      toast.error("Failed to remove variant image");
    } finally {
      // Remove from deleting state regardless of success or failure
      setDeletingImageIds(prev => prev.filter(id => id !== `variant-${variantIndex}-${imageIndex}`));
    }
  };

  // Toggle image display status
  const toggleImageDisplay = (imageIndex, type = 'product', variantIndex = null) => {
    if (type === 'product') {
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, index) =>
          index === imageIndex ? { ...img, isDisplayed: !img.isDisplayed } : img
        )
      }));
    } else if (type === 'variant' && variantIndex !== null) {
      const updatedVariants = [...formData.variants];
      
      if (updatedVariants[variantIndex] && updatedVariants[variantIndex].images) {
        // Create a new images array with updated display status
        const updatedImages = [];
        updatedVariants[variantIndex].images.forEach((img, index) => {
          if (index === imageIndex) {
            updatedImages.push({ ...img, isDisplayed: !img.isDisplayed });
          } else {
            updatedImages.push(img);
          }
        });
        updatedVariants[variantIndex].images = updatedImages;
        
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const formValues = getValues(); // Get current form values from React Hook Form

    if (!formValues.name?.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formValues.category) {
      errors.category = 'Category is required';
    }

    if (!formValues.basePrice || parseFloat(formValues.basePrice) <= 0) {
      errors.basePrice = 'Valid base price is required';
    }

    // Validate variants only if they exist
    if (formData.variants && formData.variants.length > 0) {
      formData.variants.forEach((variant, index) => {
        if (!variant.sku?.trim()) {
          errors[`variant_${index}_sku`] = 'SKU is required';
        }
        if (!variant.price || parseFloat(variant.price) <= 0) {
          errors[`variant_${index}_price`] = 'Valid price is required';
        }
        if (variant.stock < 0) {
          errors[`variant_${index}_stock`] = 'Stock cannot be negative';
        }
      });
    }

    // Validate totalStock based on variant presence
    const currentVariants = formValues.variants || [];
    if (currentVariants.length === 0) {
      // If no variants, totalStock is mandatory
      if (!formValues.totalStock || parseInt(formValues.totalStock) < 0) {
        errors.totalStock = 'Valid total stock is required when not using variants';
      }
    } else {
      // If variants exist, totalStock is optional but if provided must be valid
      if (formValues.totalStock !== undefined && formValues.totalStock !== '' && parseInt(formValues.totalStock) < 0) {
        errors.totalStock = 'Stock cannot be negative';
      }
    }

    // Additional validation for edit mode
    if (editMode && !selectedProduct?._id) {
      errors.general = 'Product ID is missing for update operation';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to normalize dates for comparison
  const normalizeDateForComparison = (dateStr) => {
    if (!dateStr) return '';
    try {
      if (dateStr.includes('/')) {
        // Convert dd/MM/yyyy to ISO date for comparison
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day).toISOString().split('T')[0];
      } else if (dateStr.includes('T')) {
        // Already ISO format, extract date part
        return new Date(dateStr).toISOString().split('T')[0];
      } else {
        return new Date(dateStr).toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Error normalizing date:', dateStr, error);
      return dateStr; // Return original if can't parse
    }
  };

  // Helper function to get only changed fields
  const getChangedFields = (original, current) => {
    const changes = {};
    
    // Helper function to deep compare objects with special handling for dates
    const isEqual = (a, b, fieldName = '') => {
      if (a === b) return true;
      if (a == null || b == null) return a === b;
      if (typeof a !== typeof b) {
        // Handle numeric/string conversions
        if ((typeof a === 'number' && typeof b === 'string') ||
            (typeof a === 'string' && typeof b === 'number')) {
          return String(a) === String(b);
        }
        return false;
      }
      
      // Special handling for date fields
      if (fieldName.includes('Date') || fieldName === 'startDate' || fieldName === 'endDate') {
        return normalizeDateForComparison(a) === normalizeDateForComparison(b);
      }
      
      if (typeof a === 'object') {
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        
        if (Array.isArray(a)) {
          if (a.length !== b.length) return false;
          return a.every((item, index) => isEqual(item, b[index], `${fieldName}[${index}]`));
        }
        
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every(key => isEqual(a[key], b[key], key));
      }
      
      // Both values are primitives at this point (string, number, boolean)
      return a === b;
    };
    
    // Compare simple fields - with special handling for fields that need explicit conversion
    const simpleFields = ['description', 'color', 'size', 'unit', 
                          'isPublished', 'isFeatured', 'isPromotedOnBanner', 
                          'metaTitle', 'metaDescription'];
    
    simpleFields.forEach(field => {
      if (!isEqual(original[field], current[field], field)) {
        changes[field] = current[field];
      }
    });

    // Special handling for numeric fields
    const numericFields = ['basePrice', 'salesCount', 'totalStock'];
    numericFields.forEach(field => {
      const originalValue = Number(original[field]) || 0;
      const currentValue = Number(current[field]) || 0;
      if (originalValue !== currentValue) {
        changes[field] = current[field];
      }
    });
    
    // Special handling for name
    if (String(original.name || '') !== String(current.name || '')) {
      changes.name = current.name;
    }
    
    // Special handling for brand
    if (String(original.brand || '') !== String(current.brand || '')) {
      changes.brand = current.brand;
    }
    
    // Special handling for discount
    if (String(original.discount || 0) !== String(current.discount || 0)) {
      changes.discount = current.discount;
    }
    
    // Special handling for discountType
    if (String(original.discountType || 'percent') !== String(current.discountType || 'percent')) {
      changes.discountType = current.discountType;
    }
    
    // Compare category (handle object vs string ID)
    const originalCategory = typeof original.category === 'object' ? original.category?._id : original.category;
    const currentCategory = current.category;
    if (originalCategory !== currentCategory) {
      changes.category = currentCategory;
    }
    
    // Compare tags (convert to comparable format)
    const originalTags = Array.isArray(original.tags) ? [...original.tags] : [];
    
    // Properly handle tags that might be a string or an array
    let currentTags;
    if (typeof current.tags === 'string') {
      currentTags = current.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (Array.isArray(current.tags)) {
      currentTags = [...current.tags]; 
    } else {
      currentTags = [];
    }
    
    // Compare tags by converting to strings for comparison
    const sortedOriginal = [...originalTags].sort();
    const sortedCurrent = [...currentTags].sort();
    
    if (JSON.stringify(sortedOriginal) !== JSON.stringify(sortedCurrent)) {
      changes.tags = currentTags;
    }
    
    // Compare relatedProducts
    if (!isEqual(original.relatedProducts, current.relatedProducts)) {
      changes.relatedProducts = current.relatedProducts;
    }
    
    // Compare discountSchedule with proper date handling - more specific check
    // First ensure the objects exist
    const origDS = original.discountSchedule || {};
    const currDS = current.discountSchedule || {};
    
    // Extract and log values for debugging
    const origIsActive = Boolean(origDS.isActive);
    const currIsActive = Boolean(currDS.isActive);
    
    const dsChanged = 
      normalizeDateForComparison(origDS.startDate) !== normalizeDateForComparison(currDS.startDate) ||
      origDS.startTime !== currDS.startTime ||
      normalizeDateForComparison(origDS.endDate) !== normalizeDateForComparison(currDS.endDate) ||
      origDS.endTime !== currDS.endTime ||
      origIsActive !== currIsActive;
    
    if (dsChanged) {
      changes.discountSchedule = current.discountSchedule;
    }
    
    // Compare images (check if there are actual changes beyond preview URLs)
    const originalImages = original.images || [];
    const currentImages = current.images || [];
    
    // Create comparable image objects (without preview URLs and file objects)
    const normalizeImage = (img) => ({
      image: img.image || '',
      isDisplayed: img.isDisplayed !== undefined ? img.isDisplayed : true,
      order: img.order || 0
    });
    
    const normalizedOriginal = originalImages.map(normalizeImage);
    const normalizedCurrent = currentImages
      .filter(img => img.image || img.file) // Only include images that have actual content
      .map(normalizeImage);
    
    if (!isEqual(normalizedOriginal, normalizedCurrent)) {
      changes.images = current.images;
    }
    
    // Compare variants with more careful normalization
    const originalVariants = original.variants || [];
    const currentVariants = current.variants || [];
    
    // Check if variants have changed
    let variantsChanged = false;
    
    // If array lengths differ, variants have changed
    if (originalVariants.length !== currentVariants.length) {
      variantsChanged = true;
    } else {
      // Compare each variant in detail
      for (let i = 0; i < originalVariants.length; i++) {
        const origV = originalVariants[i] || {};
        const currV = currentVariants[i] || {};
        
        // Compare basic fields
        if (
          origV.sku !== currV.sku ||
          origV.color !== currV.color ||
          origV.size !== currV.size ||
          origV.unit !== currV.unit ||
          String(origV.price) !== String(currV.price) ||
          String(origV.stock) !== String(currV.stock) ||
          String(origV.discount) !== String(currV.discount) ||
          origV.discountType !== currV.discountType
        ) {
          variantsChanged = true;
          break;
        }
        
        // Compare variant discount schedule
        const origDS = origV.discountSchedule || {};
        const currDS = currV.discountSchedule || {};
        
        if (
          normalizeDateForComparison(origDS.startDate) !== normalizeDateForComparison(currDS.startDate) ||
          origDS.startTime !== currDS.startTime ||
          normalizeDateForComparison(origDS.endDate) !== normalizeDateForComparison(currDS.endDate) ||
          origDS.endTime !== currDS.endTime ||
          origIsActive !== currIsActive
        ) {
          variantsChanged = true;
          break;
        }
        
        // Compare images
        const origImages = origV.images || [];
        const currImages = currV.images || [];
        
        if (origImages.length !== currImages.length) {
          variantsChanged = true;
          break;
        }
      }
    }
    
    if (variantsChanged) {
      changes.variants = current.variants;
    }
    
    return changes;
  };

  // Handle form submission
  const onSubmit = async (hookFormData) => {
    // React Hook Form has already validated the form
    try {
      // Additional validation before submission
      const basePrice = parseFloat(hookFormData.basePrice);
      if (!basePrice || basePrice <= 0) {
        toast.error('Valid base price is required and must be greater than 0');
        return;
      }

      if (!hookFormData.name?.trim()) {
        toast.error('Product name is required');
        return;
      }

      if (!hookFormData.category) {
        toast.error('Category is required');
        return;
      }

      setUploadProgress(0);
      
      // Upload product images first
      const uploadedProductImages = [];
      
      // First, keep all existing images that have an 'image' property (already on server)
      for (const image of formData.images) {
        if (image.image && !image.file) {
          // This is an existing image, keep it
          uploadedProductImages.push({
            image: image.image,
            isDisplayed: image.isDisplayed,
            order: image.order,
            uploadedAt: image.uploadedAt || new Date()
          });
        }
      }
      
      // Now process any new file uploads
      for (const image of formData.images) {
        if (image.file instanceof File) {
          try {
            const uploadResult = await uploadFilesWithProgress([image.file], {
              maxFiles: 1,
              onProgress: (progress) => {
                setUploadProgress(progress);
              },
              onError: (error) => {
                toast.error(`Failed to upload product image: ${error}`);
                throw new Error(error);
              }
            });
            
            if (uploadResult && uploadResult[0]) {
              uploadedProductImages.push({
                image: uploadResult[0].filename, // Changed from url to filename
                isDisplayed: image.isDisplayed || true,
                order: image.order || uploadedProductImages.length,
                uploadedAt: new Date()
              });
            }
          } catch (error) {
            toast.error('Failed to upload product image');
          }
        }
      }
      
      // Upload variant images
      const variantsWithUploadedImages = await Promise.all(
        formData.variants.map(async (variant, variantIdx) => {
          const uploadedVariantImages = [];
          
          // First, keep all existing images that have an 'image' property (already on server)
          if (variant.images && variant.images.length > 0) {
            for (const image of variant.images) {
              if (image.image && !image.file) {
                // This is an existing image, keep it
                uploadedVariantImages.push({
                  image: image.image,
                  isDisplayed: image.isDisplayed,
                  order: image.order,
                  uploadedAt: image.uploadedAt || new Date()
                });
              }
            }
          }
          
          // Now process any new file uploads
          for (const image of variant.images || []) {
            if (image.file instanceof File) {
              try {
                const uploadResult = await uploadFilesWithProgress([image.file], {
                  maxFiles: 1,
                  onProgress: (progress) => {
                    setUploadProgress(progress);
                  },
                  onError: (error) => {
                    toast.error(`Failed to upload variant image: ${error}`);
                    throw new Error(error);
                  }
                });
                
                if (uploadResult && uploadResult[0]) {
                  uploadedVariantImages.push({
                    image: uploadResult[0].filename, // Changed from url to filename
                    isDisplayed: image.isDisplayed || true,
                    order: image.order || uploadedVariantImages.length,
                    uploadedAt: new Date()
                  });
                }
              } catch (error) {
                toast.error('Failed to upload variant image');
              }
            }
          }
          
          return {
            ...variant,
            images: uploadedVariantImages
          };
        })
      );
      
      // Helper function to convert date format
      const convertDateToISO = (dateStr) => {
        if (!dateStr) return '';
        try {
          if (dateStr.includes('/')) {
            // Convert dd/MM/yyyy to ISO date
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day).toISOString();
          } else {
            // Already in ISO format or can be parsed directly
            return new Date(dateStr).toISOString();
          }
        } catch (error) {
          console.error('Error converting date:', dateStr, error);
          return '';
        }
      };

      // Log the image data before creating the submit data
      // Log form data before merging
      // Specifically log time values
      // Log hook form variants data
      // Creating new product
      // API Response
      // Editing product
      // Product unit
      // Product Images
      // First image structure
      // Complete image path would be
      
      // Merge data from React Hook Form and formData
      // Use hookFormData for the form-controlled fields and formData for others
      console.log('Debug totalStock:', {
        hookFormDataTotalStock: hookFormData.totalStock,
        hookFormDataTotalStockType: typeof hookFormData.totalStock,
        parsedTotalStock: hookFormData.totalStock ? parseInt(hookFormData.totalStock, 10) : 0,
        variantsLength: variantsWithUploadedImages.length,
        allHookFormData: hookFormData
      });
      
      const submitData = {
        name: hookFormData.name?.trim() || '',
        description: hookFormData.description?.trim() || '',
        category: hookFormData.category,
        brand: hookFormData.brand?.trim() || '',
        basePrice: parseFloat(hookFormData.basePrice) || 0,
        discount: parseFloat(hookFormData.discount) || 0,
        discountType: hookFormData.discountType || 'percent',
        discountSchedule: {
          startDate: convertDateToISO(hookFormData.discountSchedule?.startDate),
          startTime: hookFormData.discountSchedule?.startTime || '00:00',
          endDate: convertDateToISO(hookFormData.discountSchedule?.endDate),
          endTime: hookFormData.discountSchedule?.endTime || '23:59',
          isActive: typeof hookFormData.discountSchedule?.isActive === 'boolean' ? hookFormData.discountSchedule.isActive : false
        },
        color: hookFormData.color?.trim() || '',
        size: hookFormData.size?.trim() || '',
        unit: hookFormData.unit?.trim() || '',
        isPublished: hookFormData.isPublished,
        isFeatured: hookFormData.isFeatured,
        isPromotedOnBanner: hookFormData.isPromotedOnBanner,
        tags: hookFormData.tags ?
          (typeof hookFormData.tags === 'string' ?
            hookFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) :
            hookFormData.tags) : [],
        metaTitle: hookFormData.metaTitle?.trim() || '',
        metaDescription: hookFormData.metaDescription?.trim() || '',
        relatedProducts: hookFormData.relatedProducts || [],
        salesCount: parseInt(hookFormData.salesCount) || 0,
        // Always include totalStock - it can override auto-calculation or be mandatory when no variants
        totalStock: hookFormData.totalStock && hookFormData.totalStock !== '' ? parseInt(hookFormData.totalStock, 10) : 0,
        variants: variantsWithUploadedImages.map((variant, idx) => {
          // Get form data from React Hook Form for this variant
          const hookVariant = hookFormData.variants?.[idx] || {};
          
          return {
            sku: hookVariant.sku?.trim() || variant.sku || '',
            color: hookVariant.color?.trim() || variant.color || '',
            size: hookVariant.size?.trim() || variant.size || '',
            unit: hookVariant.unit?.trim() || variant.unit || '',
            price: parseFloat(hookVariant.price) || parseFloat(variant.price) || 0,
            stock: parseInt(hookVariant.stock) || parseInt(variant.stock) || 0,
            discount: parseFloat(hookVariant.discount) || parseFloat(variant.discount) || 0,
            discountType: hookVariant.discountType || variant.discountType || 'percent',
            discountSchedule: {
              startDate: convertDateToISO(hookVariant.discountSchedule?.startDate) || convertDateToISO(variant.discountSchedule?.startDate),
              startTime: hookVariant.discountSchedule?.startTime || variant.discountSchedule?.startTime || '00:00',
              endDate: convertDateToISO(hookVariant.discountSchedule?.endDate) || convertDateToISO(variant.discountSchedule?.endDate),
              endTime: hookVariant.discountSchedule?.endTime || variant.discountSchedule?.endTime || '23:59',
              isActive: typeof hookVariant.discountSchedule?.isActive === 'boolean' ? 
                hookVariant.discountSchedule.isActive : 
                (typeof variant.discountSchedule?.isActive === 'boolean' ? variant.discountSchedule.isActive : false)
            },
            // Use the processed images from variantsWithUploadedImages that includes both existing and newly uploaded images
            images: variant.images || []
          };
        }),
        images: uploadedProductImages || []
      };

      let response;
      if (editMode && selectedProduct) {
        // Debug: Log the values being compared
        console.log('DEBUG - selectedProduct.totalStock:', selectedProduct.totalStock);
        console.log('DEBUG - submitData.totalStock:', submitData.totalStock);
        console.log('DEBUG - selectedProduct.variants:', selectedProduct.variants);
        console.log('DEBUG - submitData.variants:', submitData.variants);
        
        // Get only the changed fields for update
        const changedFields = getChangedFields(selectedProduct, submitData);
        console.log('DEBUG - changedFields:', changedFields);
        
        // Only send update if there are any changes
        if (Object.keys(changedFields).length > 0) {
          response = await updateProduct({
            id: selectedProduct._id,
            data: changedFields
          }).unwrap();
        } else {
          toast.info('No changes to save');
          setShowModal(false);
          return;
        }
      } else {
        response = await createProduct(submitData).unwrap();
      }

      if (response?.status) {
        toast.success(response.message || `Product ${editMode ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        resetForm();
        refetch();
      } else {
        console.error('API returned error status:', response);
        toast.error(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error details:', {
        error,
        errorMessage: error?.message,
        errorData: error?.data,
        errorStatus: error?.status,
        fullError: JSON.stringify(error, null, 2)
      });

      // Better error message extraction
      let errorMessage = 'An error occurred';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage);
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setSelectedProduct(product);
    // Process the variants first to ensure they have proper structure
    const processedVariants = product.variants?.length > 0 
      ? product.variants.map(variant => ensureVariantStructure({
          sku: variant.sku || '',
          color: variant.color || '',
          size: variant.size || '',
          unit: variant.unit || '',
          price: variant.price ? variant.price.toString() : '',
          stock: variant.stock ? variant.stock.toString() : '',
          discount: variant.discount ? variant.discount.toString() : '',
          discountType: variant.discountType || 'percent',
          discountSchedule: {
            startDate: variant.discountSchedule?.startDate ? convertISOToDisplayDate(variant.discountSchedule.startDate) : '',
            startTime: typeof variant.discountSchedule?.startTime === 'string' && variant.discountSchedule.startTime.match(/^\d{2}:\d{2}$/) ? variant.discountSchedule.startTime : '00:00',
            endDate: variant.discountSchedule?.endDate ? convertISOToDisplayDate(variant.discountSchedule.endDate) : '',
            endTime: typeof variant.discountSchedule?.endTime === 'string' && variant.discountSchedule.endTime.match(/^\d{2}:\d{2}$/) ? variant.discountSchedule.endTime : '23:59',
            isActive: variant.discountSchedule?.isActive || false
          },
          // Process existing images to have preview URLs
          images: variant.images ? variant.images.map(img => ({
            ...img,
            // Use the actual image URL as the preview for existing images
            preview: img.image ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${img.image}` : undefined
          })) : []
        }))
      : [];
      
    // Update both the form state for React Hook Form and the legacy formData state
    const formValues = {
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || '',
      brand: product.brand || '',
      basePrice: product.basePrice ? product.basePrice.toString() : '',
      discount: product.discount ? product.discount.toString() : '',
      discountType: product.discountType || 'percent',
      discountSchedule: {
        startDate: product.discountSchedule?.startDate ? convertISOToDisplayDate(product.discountSchedule.startDate) : '',
        startTime: product.discountSchedule?.startTime || '00:00',
        endDate: product.discountSchedule?.endDate ? convertISOToDisplayDate(product.discountSchedule.endDate) : '',
        endTime: product.discountSchedule?.endTime || '23:59',
        isActive: product.discountSchedule?.isActive || false
      },
      color: product.color || '',
      size: product.size || '',
      unit: product.unit || '',
      isPublished: product.isPublished || false,
      isFeatured: product.isFeatured || false,
      isPromotedOnBanner: product.isPromotedOnBanner || false,
      tags: product.tags ? product.tags.join(', ') : '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      relatedProducts: product.relatedProducts || [],
      salesCount: product.salesCount || 0,
      totalStock: product.totalStock || 0,
      variants: processedVariants,
      // Process existing images to have preview URLs
      images: product.images ? product.images.map(img => ({
        ...img,
        // Use the actual image URL as the preview for existing images
        preview: img.image ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${img.image}` : undefined
      })) : []
    };
    
    // Update React Hook Form state
    reset(formValues);
    
    // Also update the legacy formData state (until fully migrated)
    setFormData(formValues);
    setEditMode(true);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (productId) => {
    const confirmed = await deleteConfirm({
      title: 'Delete Product',
      text: 'Are you sure you want to delete this product?',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      icon: 'warning',
    });

    if (confirmed) {
      try {
        const response = await deleteProduct(productId).unwrap();
        if (response.status) {
          toast.success(response.message || 'Product deleted successfully');
          refetch();
        } else {
          toast.error(response.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.data?.message || 'Failed to delete product');
      }
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (productId) => {
    try {
      const response = await togglePublish(productId).unwrap();
      if (response.status) {
        toast.success(response.message || 'Product status updated');
        refetch();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Toggle publish error:', error);
      toast.error(error.data?.message || 'Failed to update status');
    }
  };

  // Handle pagination
  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  // Get unique brands for filter
  const uniqueBrands = [...new Set(
    productsData?.data?.map(product => product.brand).filter(Boolean) || []
  )];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
        <div>
          <h1 className=" text-center md:text-left text-2xl font-semibold text-gray-900 dark:text-white">
            Product Management
          </h1>
          <p className="text-center md:text-left text-gray-600 dark:text-gray-300 mt-1">
            Manage your product inventory and details
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
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CustomInput
            label="Search Products"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full"
          />

          <CustomSelect
            label="Filter by Brand"
            options={[...uniqueBrands]}
            selected={filterBrand}
            setSelected={setFilterBrand}
            placeholder="All Brands"
          />

          <div>
            {/* We need a separate form control just for filtering */}
            <CategorySearchWithForm
              label="Filter by Category"
              name="filterCategory"
              control={filterForm.control}
              placeholder="Search for a category..."
              onSelectCategory={(category) => {
                setFilterCategory(category ? category._id : '');
              }}
            />
          </div>

          <CustomSelect
            label="Published Status"
            options={['All Status', 'Published', 'Draft']}
            selected={filterPublished === '' ? 'All Status' : filterPublished === 'true' ? 'Published' : 'Draft'}
            setSelected={(value) => {
              if (value === 'All Status') setFilterPublished('');
              else if (value === 'Published') setFilterPublished('true');
              else if (value === 'Draft') setFilterPublished('false');
            }}
            placeholder="All Status"
          />

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBrand('');
                setFilterCategory('');
                setFilterPublished('');
                setCurrentPage(1);
                filterForm.reset({filterCategory: ''}); // Reset the filter form
              }}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto p-2">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-2 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {productsData?.data?.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-2 md:px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* Mobile: image above name */}
                      <div className="block md:hidden w-full">
                        <div className="flex flex-col items-start">
                          <div className="h-10 w-10 flex-shrink-0 mb-2">
                            {product.images?.[0] ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={product.images[0]?.preview && product.images[0].preview.trim() !== "" 
                                     ? product.images[0].preview 
                                     : product.images[0].image
                                       ? (product.images[0].image.startsWith('http') 
                                          ? product.images[0].image 
                                          : imageBaseUrl + product.images[0].image)
                                       : ''}
                                alt={product.name}
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = "https://placehold.co/100/lightgray/gray?text=No+Image";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <FaImage className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white text-wrap">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.brand}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 my-1">
                            {product.category?.categoryName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 my-1">
                            ৳ {product.basePrice}
                            {product.discount > 0 && (
                              <span className="text-green-600 ml-2">
                                (-{product.discount}{product.discountType === 'percent' ? ' %' : ' ৳'})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Desktop: image left of name */}
                      <div className="hidden md:flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.images[0]?.preview && product.images[0].preview.trim() !== "" 
                                   ? product.images[0].preview 
                                   : product.images[0].image
                                     ? (product.images[0].image.startsWith('http') 
                                        ? product.images[0].image 
                                        : imageBaseUrl + product.images[0].image)
                                     : ''}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://placehold.co/100/lightgray/gray?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <FaImage className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white text-wrap">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.category?.categoryName || 'N/A'}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      ৳ {product.basePrice}
                      {product.discount > 0 && (
                        <span className="text-green-600 ml-2">
                          (-{product.discount}{product.discountType === 'percent' ? ' %' : ' ৳'})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-3 text-center whitespace-nowrap">
                    <span className={`text-sm ${product.totalStock < 10
                      ? 'text-red-600'
                      : product.totalStock < 50
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {product.totalStock}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isPublished
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {product.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-2 md:px-6 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleTogglePublish(product._id)}
                        className={`${product.isPublished
                          ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400'
                          : 'text-green-600 hover:text-green-900 dark:text-green-400'
                        }`}
                        title={product.isPublished ? 'Unpublish' : 'Publish'}
                        disabled={isToggling}
                      >
                        {product.isPublished ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
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

        {(!productsData?.data || productsData.data.length === 0) && (
          <div className="text-center py-12">
            <FaBox className="mx-auto h-12 w-12 text-gray-400" />

            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new product.
            </p>
          </div>
        )}
      </div>
      {productsData?.pagination?.totalPages > 1 && (
        <Pagination
          pageCount={productsData.pagination.totalPages}
          onPageChange={handlePageChange}
          currentPage={currentPage - 1}
        />
      )}

      {/* Product Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] mt-0 md:mt-16 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-30 modal-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editMode ? 'Edit Product' : 'Add New Product'}
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
                <h3 className="text-lg font-medium text-center md:text-left text-gray-900 dark:text-white">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInputWithForm
                    label="Product Name"
                    name="name"
                    control={control}
                    placeholder="Enter product name"
                    required
                    rules={{ required: "Product name is required" }}
                  />

                  <CustomInputWithForm
                    label="Brand"
                    name="brand"
                    control={control}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CategorySearchWithForm
                    label="Category"
                    name="category"
                    control={control}
                    required
                    placeholder="Search for a category..."
                    onSelectCategory={(category) => {
                      if (category) {
                        setFormData(prev => ({...prev, category: category._id}));
                      }
                    }}
                  />

                  <CustomInputWithForm
                    label="Base Price"
                    name="basePrice"
                    type="number"
                    control={control}
                    placeholder="Enter base price"
                    required
                    rules={{
                      required: 'Base price is required',
                      min: { value: 0.01, message: 'Base price must be greater than 0' }
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CustomInputWithForm
                    label="Discount"
                    name="discount"
                    type="number"
                    control={control}
                    placeholder="Enter discount"
                  />

                  <CustomSelectWithForm
                    label="Discount Type"
                    name="discountType"
                    control={control}
                    options={[
                      { value: 'percent', label: 'Percent' },
                      { value: 'flat', label: 'Flat' }
                    ]}
                  />

                  <CustomInputWithForm
                    label="Tags (comma separated)"
                    name="tags"
                    control={control}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {/* update button */}
                {editMode && (
                  <div className="flex justify-end">
                   <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  Update Product
                </button>
                </div>
                )}

                {/* Discount Schedule */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Discount Schedule</h4>
                      <button
                        type="button"
                        onClick={() => setShowDiscountSchedule(!showDiscountSchedule)}
                        className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                      >
                        {showDiscountSchedule ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <span className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Automatically activates when dates match current time
                    </span>
                  </div>
                  
                  {showDiscountSchedule && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                      name="discountSchedule.startDate"
                      control={control}
                      render={({ field }) => (
                        <CustomDatePicker
                          label="Discount Start Date"
                          name="discountSchedule.startDate"
                          control={control}
                          formData={{ discountSchedule: { startDate: field.value } }}
                          setFormData={(prev) => {
                            const newValue = prev?.discountSchedule?.startDate || '';
                            field.onChange(newValue);
                            return prev;
                          }}
                          minDate={null}
                          maxDate={null}
                        />
                      )}
                    />
                    
                    <TimeInput
                      label="Start Time"
                      name="discountSchedule.startTime"
                      control={control}
                      className="dark:text-white"
                      defaultValue={formData.discountSchedule?.startTime || '00:00'}
                    />

                    <Controller
                      name="discountSchedule.endDate"
                      control={control}
                      render={({ field }) => (
                        <CustomDatePicker
                          label="Discount End Date"
                          name="discountSchedule.endDate"
                          control={control}
                          formData={{ discountSchedule: { endDate: field.value } }}
                          setFormData={(prev) => {
                            const newValue = prev?.discountSchedule?.endDate || '';
                            field.onChange(newValue);
                            return prev;
                          }}
                          minDate={null}
                          maxDate={null}
                        />
                      )}
                    />
                    
                    <TimeInput
                      label="End Time"
                      name="discountSchedule.endTime"
                      control={control}
                      className="dark:text-white"
                      defaultValue={formData.discountSchedule?.endTime || '23:59'}
                    />


                    <div className="hidden md:flex items-center">
                      <Controller
                        name="discountSchedule.isActive"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        )}
                      />
                      <label className="ml-2 text-sm text-gray-900 dark:text-white">
                        Discount Active
                      </label>
                      {formData.discountSchedule.startDate && formData.discountSchedule.endDate && (
                        <div className="ml-2">
                          {(() => {
                            try {
                              const now = new Date();
                              let start, end;

                              // Parse dates based on format
                              if (formData.discountSchedule.startDate.includes('/')) {
                                const [day, month, year] = formData.discountSchedule.startDate.split('/');
                                start = new Date(year, month - 1, day);
                              } else {
                                start = new Date(formData.discountSchedule.startDate);
                              }

                              if (formData.discountSchedule.endDate.includes('/')) {
                                const [day, month, year] = formData.discountSchedule.endDate.split('/');
                                end = new Date(year, month - 1, day);
                              } else {
                                end = new Date(formData.discountSchedule.endDate);
                              }

                              const shouldBeActive = now >= start && now <= end;

                              if (shouldBeActive && formData.discountSchedule.isActive) {
                                return (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Auto-Active
                                  </span>
                                );
                              } else if (shouldBeActive && !formData.discountSchedule.isActive) {
                                return (
                                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                    Manual Override
                                  </span>
                                );
                              } else if (!shouldBeActive && formData.discountSchedule.isActive) {
                                return (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    Manual Active
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    Inactive
                                  </span>
                                );
                              }
                            } catch (error) {
                              console.error('Error parsing dates for status:', error);
                              return (
                                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                  Date Error
                                </span>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Active button for mobile */}
                  {showDiscountSchedule && (
                  <div className="md:hidden flex items-center">
                      <Controller
                        name="discountSchedule.isActive"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              // Also update formData for compatibility
                              handleDiscountScheduleChange('isActive', e.target.checked);
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        )}
                      />
                      <label className="ml-2 text-sm text-gray-900 dark:text-white">
                        Discount Active
                      </label>
                      {formData.discountSchedule.startDate && formData.discountSchedule.endDate && (
                        <div className="ml-2">
                          {(() => {
                            try {
                              const now = new Date();
                              let start, end;

                              // Parse dates based on format
                              if (formData.discountSchedule.startDate.includes('/')) {
                                const [day, month, year] = formData.discountSchedule.startDate.split('/');
                                start = new Date(year, month - 1, day);
                              } else {
                                start = new Date(formData.discountSchedule.startDate);
                              }

                              if (formData.discountSchedule.endDate.includes('/')) {
                                const [day, month, year] = formData.discountSchedule.endDate.split('/');
                                end = new Date(year, month - 1, day);
                              } else {
                                end = new Date(formData.discountSchedule.endDate);
                              }

                              const shouldBeActive = now >= start && now <= end;

                              if (shouldBeActive && formData.discountSchedule.isActive) {
                                return (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Auto-Active
                                  </span>
                                );
                              } else if (shouldBeActive && !formData.discountSchedule.isActive) {
                                return (
                                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                    Manual Override
                                  </span>
                                );
                              } else if (!shouldBeActive && formData.discountSchedule.isActive) {
                                return (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    Manual Active
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    Inactive
                                  </span>
                                );
                              }
                            } catch (error) {
                              console.error('Error parsing dates for status:', error);
                              return (
                                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                  Date Error
                                </span>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Product Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <CustomInputWithForm
                    label="Product Color"
                    name="color"
                    control={control}
                    placeholder="Enter product color"
                  />

                  <CustomInputWithForm
                    label="Product Size"
                    name="size"
                    control={control}
                    placeholder="Enter product size"
                  />

                  <CustomInputWithForm
                    label="Unit"
                    name="unit"
                    control={control}
                    placeholder="e.g., kg, pcs, liter"
                  />

                  <CustomInputWithForm
                    label="Sales Count"
                    name="salesCount"
                    type="number"
                    control={control}
                    placeholder="Sales count"
                    disabled={true}
                  />
                </div>

                {/* update button */}
                {editMode && (
                  <div className="flex justify-end">
                   <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  Update Product
                </button>
                </div>
                )}

                {/* Product Images */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-center md:text-left text-gray-900 dark:text-white">Product Images</h4>

                  <ImageUploader
                    label="Upload Product Images"
                    name="productImages"
                    onChange={(file) => handleImageChange(file, 'product')}
                    accept="image/*"
                    width={300}
                    rounded='md'
                    className="mb-4"
                  />

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative border rounded-lg overflow-hidden">
                          <img
                            src={image?.preview && image.preview.trim() !== "" 
                                 ? image.preview 
                                 : image.image 
                                   ? (image.image.startsWith('http') 
                                      ? image.image 
                                      : imageBaseUrl + image.image)
                                   : ''}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              console.error("Image failed to load:", image.image);
                              e.target.onerror = null; 
                              e.target.src = "https://placehold.co/300x200/lightgray/gray?text=Image+Not+Found";
                            }}
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              type="button"
                              onClick={() => toggleImageDisplay(index, 'product')}
                              className={`p-1 rounded text-xs ${image.isDisplayed
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-500 text-white'
                                }`}
                            >
                              {image.isDisplayed ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProductImage(index)}
                              className="p-1 bg-red-500 text-white rounded text-xs"
                              disabled={deletingImageIds.includes(`product-${index}`)}
                            >
                              {deletingImageIds.includes(`product-${index}`) ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
                        placeholder="Enter product description"
                      />
                    )}
                  />
                </div>
              </div>

              {/* update button */}
              {editMode && (
                <div className="flex justify-end">
                   <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  Update Product
                </button>
                </div>
              )}

              {/* Product Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Options</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-900 dark:text-white">
                      Published
                    </label>
                  </div>

                  <div className="flex items-center">
                    <Controller
                      name="isFeatured"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      )}
                    />
                    <label className="ml-2 text-sm text-gray-900 dark:text-white">
                      Featured
                    </label>
                  </div>

                  <div className="flex items-center">
                    <Controller
                      name="isPromotedOnBanner"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      )}
                    />
                    <label className="ml-2 text-sm text-gray-900 dark:text-white">
                      Promoted on Banner
                    </label>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Variants</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Add Variant
                  </button>
                </div>
                
                {/* Total Stock Input - always shown but with different validation */}
                <div className={`border border-gray-200 dark:border-gray-600 rounded-lg p-4 ${(formValues.variants?.length || 0) === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    {(formValues.variants?.length || 0) === 0 ? 'Product Stock (No Variants)' : 'Total Stock Override (Optional)'}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {(formValues.variants?.length || 0) === 0 
                      ? 'Since you\'re not using variants, set the total stock quantity for this product here.' 
                      : 'Optional: Override the automatically calculated total stock from variants. Leave empty to use auto-calculated value.'}
                  </p>
                  <CustomInputWithForm
                    label={(formValues.variants?.length || 0) === 0 ? "Total Stock Quantity" : "Total Stock Override"}
                    name="totalStock"
                    control={control}
                    type="number"
                    placeholder={(formValues.variants?.length || 0) === 0 ? "Enter total stock quantity" : "Leave empty for auto-calculation"}
                    rules={{
                      min: { value: 0, message: "Stock cannot be negative" },
                      validate: (value) => {
                        const variants = getValues('variants') || [];
                        if (variants.length === 0) {
                          // No variants - totalStock is required
                          if (!value || value === '' || isNaN(parseInt(value)) || parseInt(value) < 0) {
                            return 'Total stock is required when no variants are used';
                          }
                        } else {
                          // With variants - optional but if provided must be valid
                          if (value && value !== '' && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
                            return 'Stock cannot be negative';
                          }
                        }
                        // Valid value
                        return true;
                      }
                    }}
                    required={(formValues.variants?.length || 0) === 0}
                    min="0"
                    step="1"
                    className="max-w-xs"
                  />
                </div>
                
                {(formValues.variants?.length || 0) === 0 ? (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No variants added yet. Variants are optional and allow you to create different versions of your product with specific attributes like color, size, price, and stock levels.
                    </p>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      Add Your First Variant
                    </button>
                  </div>
                ) : (
                  formData.variants.map((variant, index) => (
                  <div key={index}>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Variant {index + 1}
                      </h4>
                      {formData.variants.length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="bg-red-600 hover:bg-red-800 text-sm text-white px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <CustomInputWithForm
                        label="SKU"
                        name={`variants[${index}].sku`}
                        control={control}
                        placeholder="Enter SKU"
                        required
                        rules={{ required: "SKU is required" }}
                      />

                      <CustomInputWithForm
                        label="Color"
                        name={`variants[${index}].color`}
                        control={control}
                        placeholder="Enter color"
                      />

                      <CustomInputWithForm
                        label="Size"
                        name={`variants[${index}].size`}
                        control={control}
                        placeholder="Enter size"
                      />
                      
                      <CustomInputWithForm
                        label="Unit"
                        name={`variants[${index}].unit`}
                        control={control}
                        placeholder="e.g., kg, pcs, liter"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <CustomInputWithForm
                        label="Price"
                        name={`variants[${index}].price`}
                        type="number"
                        control={control}
                        placeholder="Enter price"
                        required
                        rules={{ required: "Price is required" }}
                      />

                      <CustomInputWithForm
                        label="Stock"
                        name={`variants[${index}].stock`}
                        type="number"
                        control={control}
                        placeholder="Enter stock quantity"
                        required
                        rules={{ required: "Stock is required" }}
                      />

                      <CustomInputWithForm
                        label="Variant Discount"
                        name={`variants[${index}].discount`}
                        type="number"
                        control={control}
                        placeholder="Enter discount"
                      />
                    </div>

                    {/* Variant Discount Schedule */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Variant Discount Schedule</h5>
                          <button
                            type="button"
                            onClick={() => setShowDiscountSchedule(!showDiscountSchedule)}
                            className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                          >
                            {showDiscountSchedule ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                      {showDiscountSchedule && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Initialize variant discount schedule if needed */}
                        {(() => {
                          // Make sure the variant has a properly initialized discountSchedule
                          if (!variant.discountSchedule) {
                            const updatedVariants = [...formData.variants];
                            updatedVariants[index] = {
                              ...updatedVariants[index],
                              discountSchedule: {
                                startDate: '',
                                startTime: '00:00',
                                endDate: '',
                                endTime: '23:59',
                                isActive: false
                              }
                            };
                            // Use setTimeout to avoid state updates during render
                            setTimeout(() => {
                              setFormData(prev => ({...prev, variants: updatedVariants}));
                            }, 0);
                          }
                          
                          return (
                            <>
                              <Controller
                                name={`variants[${index}].discountSchedule.startDate`}
                                control={control}
                                render={({ field }) => (
                                  <CustomDatePicker
                                    label="Discount Start Date"
                                    name={`variants[${index}].discountSchedule.startDate`}
                                    control={control}
                                    formData={{ 
                                      variants: formData.variants.map((v, i) => 
                                        i === index ? { ...v, discountSchedule: { ...v.discountSchedule, startDate: field.value } } : v
                                      )
                                    }}
                                    setFormData={(prev) => {
                                      if (prev?.variants?.[index]?.discountSchedule?.startDate) {
                                        const newValue = prev.variants[index].discountSchedule.startDate;
                                        field.onChange(newValue);
                                      }
                                      return prev;
                                    }}
                                    minDate={null}
                                    maxDate={null}
                                  />
                                )}
                              />

                              <Controller
                                name={`variants[${index}].discountSchedule.startTime`}
                                control={control}
                                defaultValue="00:00"
                                render={({ field }) => (
                                  <TimeInput
                                    label="Start Time"
                                    name={`variants[${index}].discountSchedule.startTime`}
                                    control={control}
                                    className="dark:text-white"
                                    defaultValue={field.value || "00:00"}
                                    value={field.value}
                                    onChange={(time) => {
                                      field.onChange(time);
                                      handleVariantDiscountScheduleChange(index, 'startTime', time);
                                    }}
                                  />
                                )}
                              />
      
                              <Controller
                                name={`variants[${index}].discountSchedule.endDate`}
                                control={control}
                                render={({ field }) => (
                                  <CustomDatePicker
                                    label="Discount End Date"
                                    name={`variants[${index}].discountSchedule.endDate`}
                                    control={control}
                                    formData={{ 
                                      variants: formData.variants.map((v, i) => 
                                        i === index ? { ...v, discountSchedule: { ...v.discountSchedule, endDate: field.value } } : v
                                      )
                                    }}
                                    setFormData={(prev) => {
                                      if (prev?.variants?.[index]?.discountSchedule?.endDate) {
                                        const newValue = prev.variants[index].discountSchedule.endDate;
                                        field.onChange(newValue);
                                      }
                                      return prev;
                                    }}
                                    minDate={null}
                                    maxDate={null}
                                  />
                                )}
                              />

                              <Controller
                                name={`variants[${index}].discountSchedule.endTime`}
                                control={control}
                                defaultValue="23:59"
                                render={({ field }) => (
                                  <TimeInput
                                    label="End Time"
                                    name={`variants[${index}].discountSchedule.endTime`}
                                    control={control}
                                    className="dark:text-white"
                                    defaultValue={field.value || "23:59"}
                                    value={field.value}
                                    onChange={(time) => {
                                      field.onChange(time);
                                      handleVariantDiscountScheduleChange(index, 'endTime', time);
                                    }}
                                  />
                                )}
                              />
                            </>
                          );
                        })()}

                        <div className="hidden md:flex items-center">
                          <Controller
                            name={`variants[${index}].discountSchedule.isActive`}
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value || false}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                            )}
                          />
                          <label className="ml-2 text-sm text-gray-900 dark:text-white">
                            Discount Active
                          </label>
                          {variant?.discountSchedule?.startDate && variant?.discountSchedule?.endDate && (
                            <div className="ml-2">
                              {(() => {
                                try {
                                  const now = new Date();
                                  let start, end;

                                  // Parse dates based on format
                                  if (variant.discountSchedule.startDate.includes('/')) {
                                    const [day, month, year] = variant.discountSchedule.startDate.split('/');
                                    start = new Date(year, month - 1, day);
                                  } else {
                                    start = new Date(variant.discountSchedule.startDate);
                                  }

                                  if (variant.discountSchedule.endDate.includes('/')) {
                                    const [day, month, year] = variant.discountSchedule.endDate.split('/');
                                    end = new Date(year, month - 1, day);
                                  } else {
                                    end = new Date(variant.discountSchedule.endDate);
                                  }

                                  const shouldBeActive = now >= start && now <= end;

                                  if (shouldBeActive && variant.discountSchedule.isActive) {
                                    return (
                                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                        Auto-Active
                                      </span>
                                    );
                                  } else if (shouldBeActive && !variant.discountSchedule.isActive) {
                                    return (
                                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                        Manual Override
                                      </span>
                                    );
                                  } else if (!shouldBeActive && variant.discountSchedule.isActive) {
                                    return (
                                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        Manual Active
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        Inactive
                                      </span>
                                    );
                                  }
                                } catch (error) {
                                  console.error('Error parsing dates for status:', error);
                                  return (
                                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                      Date Error
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                      )}

                      {/* Active button for mobile */}
                      {showDiscountSchedule && (
                      <div className="md:hidden flex items-center pt-2">
                        <Controller
                          name={`variants.${index}.discountSchedule.isActive`}
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                // Also update formData for compatibility
                                handleVariantDiscountScheduleChange(index, 'isActive', e.target.checked);
                              }}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                          )}
                        />
                        <label className="ml-2 text-sm text-gray-900 dark:text-white">
                          Discount Active
                        </label>
                        {variant?.discountSchedule?.startDate && variant?.discountSchedule?.endDate && (
                          <div className="ml-2">
                            {(() => {
                              try {
                                const now = new Date();
                                let start, end;

                                // Parse dates based on format
                                if (variant.discountSchedule.startDate.includes('/')) {
                                  const [day, month, year] = variant.discountSchedule.startDate.split('/');
                                  start = new Date(year, month - 1, day);
                                } else {
                                  start = new Date(variant.discountSchedule.startDate);
                                }

                                if (variant.discountSchedule.endDate.includes('/')) {
                                  const [day, month, year] = variant.discountSchedule.endDate.split('/');
                                  end = new Date(year, month - 1, day);
                                } else {
                                  end = new Date(variant.discountSchedule.endDate);
                                }

                                const shouldBeActive = now >= start && now <= end;

                                if (shouldBeActive && variant.discountSchedule.isActive) {
                                  return (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                      Auto-Active
                                    </span>
                                  );
                                } else if (shouldBeActive && !variant.discountSchedule.isActive) {
                                  return (
                                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                      Manual Override
                                    </span>
                                  );
                                } else if (!shouldBeActive && variant.discountSchedule.isActive) {
                                  return (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      Manual Active
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      Inactive
                                    </span>
                                  );
                                }
                              } catch (error) {
                                console.error('Error parsing dates for status:', error);
                                return (
                                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                    Date Error
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>
                      )}
                    </div>

                    {/* Variant Images */}
                    <div className="mt-4 space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Variant Images</h5>

                      <ImageUploader
                        label={`Upload Images for Variant ${index + 1}`}
                        name={`variantImages_${index}`}
                        onChange={(file) => handleImageChange(file, 'variant', index)}
                        accept="image/*"
                        width={300}
                        rounded='md'
                        className="mb-2"
                        height={120}
                      />
                      {variant.images && variant.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {variant.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative border rounded overflow-hidden">
                              <img
                                src={image?.preview && image.preview.trim() !== "" 
                                      ? image.preview 
                                      : image.image
                                        ? (image.image.startsWith('http') 
                                           ? image.image 
                                           : imageBaseUrl + image.image)
                                        : ''}
                                alt={`Variant ${index + 1} Image ${imgIndex + 1}`}
                                className="w-full h-24 object-cover"
                                onError={(e) => {
                                  console.error("Variant image failed to load:", image.image);
                                  e.target.onerror = null; 
                                  e.target.src = "https://placehold.co/300x200/lightgray/gray?text=Image+Not+Found";
                                }}
                              />
                              <div className="absolute top-1 right-1 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleImageDisplay(imgIndex, 'variant', index)}
                                  className={`p-0.5 rounded text-xs ${image.isDisplayed
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-500 text-white'
                                    }`}
                                >
                                  {image.isDisplayed ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(index, imgIndex)}
                                  className="p-0.5 bg-red-500 text-white rounded text-xs"
                                  disabled={deletingImageIds.includes(`variant-${index}-${imgIndex}`)}
                                >
                                  {deletingImageIds.includes(`variant-${index}-${imgIndex}`) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-1 border-b-1 border-white"></div>
                                  ) : (
                                    <FaTrash className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Variant Update Button */}
                    {editMode && (
                      <div className="flex justify-end mt-4">
                      <button
                        type="submit"
                        disabled={isCreating || isUpdating}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {(isCreating || isUpdating) && (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        )}
                        Update Variant
                      </button>
                    </div>
                    )}
                  </div>
                </div>
                ))
                )}
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">SEO Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInput
                    label="Meta Title"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Enter meta title"
                  />

                  <CustomInput
                    label="Meta Description"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Enter meta description"
                  />
                </div>
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
                  {editMode ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
