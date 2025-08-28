'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import CategorySearchWithForm from '../CategorySearchWithForm';

const CategorySearchWithFormExample = () => {
  // Set up React Hook Form
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      categoryId: '', // This will store the selected category ID
    }
  });

  // Watch for value changes
  const selectedCategoryId = watch('categoryId');

  // Handle form submission
  const onSubmit = (data) => {
    console.log('Form data:', data);
    alert(`Selected category ID: ${data.categoryId}`);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Category Search with React Hook Form</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <CategorySearchWithForm 
            label="Select Category"
            name="categoryId"
            control={control}
            required={true}
            placeholder="Search for categories..."
            onSelectCategory={(category) => {
              if (category) {
                console.log('Selected category in callback:', category);
              }
            }}
          />
        </div>
        
        {/* Display the selected category ID */}
        {selectedCategoryId && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="dark:text-gray-300">
              <strong>Selected Category ID:</strong> {selectedCategoryId}
            </p>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
};

export default CategorySearchWithFormExample;
