'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '@/features/category/categoryThunks';
import { selectAllCategories } from '@/features/category/categorySlice';

/**
 * A reusable component for searching categories
 * 
 * @param {Object} props
 * @param {string} props.label - Label for the input
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.initialCategoryId - Initial category ID (optional)
 * @param {string} props.initialCategoryName - Initial category name (optional)
 * @param {Function} props.onSelectCategory - Callback when a category is selected (returns category object)
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional classes for the input
 */
const CategorySearch = ({
  label = 'Category',
  placeholder = 'Search for a category...',
  initialCategoryId = '',
  initialCategoryName = '',
  onSelectCategory,
  required = false,
  className = '',
}) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const [inputValue, setInputValue] = useState(initialCategoryName);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const wrapperRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Set initial category if provided
  useEffect(() => {
    if (initialCategoryId && categories.length > 0) {
      const category = categories.find(cat => cat._id === initialCategoryId);
      if (category) {
        setSelectedCategory(category);
        setInputValue(category.categoryName);
      }
    } else if (initialCategoryName) {
      setInputValue(initialCategoryName);
    }
  }, [initialCategoryId, initialCategoryName, categories]);

  // Handle input change for search
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim() === '') {
      setFilteredCategories([]);
      setShowSuggestions(false);
      setSelectedCategory(null);
      if (onSelectCategory) onSelectCategory(null);
      return;
    }

    // Filter categories based on input
    const filtered = categories.filter(category => 
      category.categoryName.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredCategories(filtered);
    setShowSuggestions(true);
  };

  // Handle suggestion click
  const handleSuggestionClick = (category) => {
    setSelectedCategory(category);
    setInputValue(category.categoryName);
    setShowSuggestions(false);
    
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Focus handling
  const handleFocus = () => {
    if (inputValue.trim() !== '') {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white dark:border-gray-600 ${className}`}
      />
      
      {showSuggestions && filteredCategories.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-700 max-h-60 overflow-auto">
          {filteredCategories.map((category) => (
            <li
              key={category._id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              onClick={() => handleSuggestionClick(category)}
            >
              {category.categoryName}
            </li>
          ))}
        </ul>
      )}
      
      {inputValue && filteredCategories.length === 0 && showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-700 p-3 text-center">
          No categories found
        </div>
      )}
    </div>
  );
};

export default CategorySearch;
