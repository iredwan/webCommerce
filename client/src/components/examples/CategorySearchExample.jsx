'use client';

import React, { useState } from 'react';
import CategorySearch from './CategorySearch';

const CategorySearchExample = () => {
  // State to store the selected category
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    console.log('Selected category:', category);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Category Search Example</h2>
      
      {/* Example with no initial value */}
      <div className="mb-6">
        <CategorySearch 
          label="Select Category"
          placeholder="Type to search categories..."
          onSelectCategory={handleCategorySelect}
          required={true}
        />
      </div>
      
      {/* Display selected category information */}
      {selectedCategory && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 className="text-lg font-semibold dark:text-white">Selected Category:</h3>
          <p className="dark:text-gray-300"><strong>Name:</strong> {selectedCategory.categoryName}</p>
          <p className="dark:text-gray-300"><strong>ID:</strong> {selectedCategory._id}</p>
          {selectedCategory.parentCategory && (
            <p className="dark:text-gray-300"><strong>Parent:</strong> {selectedCategory.parentCategory}</p>
          )}
        </div>
      )}
      
      {/* Example with initial category (uncomment and provide valid values to test)
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">With Initial Value</h3>
        <CategorySearch 
          label="Edit Category"
          initialCategoryId="your-category-id-here"
          initialCategoryName="Category Name"
          onSelectCategory={(cat) => console.log('Updated category:', cat)}
        />
      </div>
      */}
    </div>
  );
};

export default CategorySearchExample;
