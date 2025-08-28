'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller } from 'react-hook-form';
import { fetchCategories } from '@/features/category/categoryThunks';
import { selectAllCategories } from '@/features/category/categorySlice';
import { FaChevronDown } from "react-icons/fa";

/**
 * A reusable category search component integrated with React Hook Form
 */
const CategorySearchWithForm = ({
  label,
  name,
  control,
  rules = {},
  placeholder = 'Search for a category...',
  required = false,
  disabled = false,
  onSelectCategory,
}) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const wrapperRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `${label} is required` : false,
        ...rules,
      }}
      render={({ field, fieldState }) => {
        const { onChange, value } = field;
        const { error } = fieldState;
        
        const [inputValue, setInputValue] = useState('');
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [filteredCategories, setFilteredCategories] = useState([]);
        
        // Update input value when form value changes
        useEffect(() => {
          if (value) {
            const selectedCategory = categories.find(cat => cat._id === value);
            if (selectedCategory) {
              setInputValue(selectedCategory.categoryName);
            }
          } else {
            setInputValue('');
          }
        }, [value, categories]);
        
        // Handle input change for search
        const handleInputChange = (e) => {
          const newValue = e.target.value;
          setInputValue(newValue);
          
          if (newValue.trim() === '') {
            setFilteredCategories([]);
            setShowSuggestions(false);
            onChange('');
            if (onSelectCategory) onSelectCategory(null);
            return;
          }
          
          // Filter categories based on input
          const filtered = categories.filter(category => 
            category.categoryName.toLowerCase().includes(newValue.toLowerCase())
          );
          
          setFilteredCategories(filtered);
          setShowSuggestions(true);
        };
        
        // Handle suggestion click
        const handleSuggestionClick = (category) => {
          setInputValue(category.categoryName);
          setShowSuggestions(false);
          onChange(category._id);
          
          if (onSelectCategory) {
            onSelectCategory(category);
          }
        };
        
        // Handle focus
        const handleFocus = () => {
          if (inputValue.trim() !== '') {
            setShowSuggestions(true);
          }
        };
        
        // Handle dropdown icon click
        const handleDropdownClick = () => {
          if (showSuggestions) {
            setShowSuggestions(false);
          } else {
            // Show all categories when dropdown is clicked
            setFilteredCategories(categories);
            setShowSuggestions(true);
          }
        };
        
        // Handle click outside
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
        }, []);
        
        return (
          <div className="w-full relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-4 py-2.5 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  error ? 'border-red-500' : 'border-neutral-300'
                }`}
              />
              <div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={handleDropdownClick}
              >
                <FaChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
              </div>
            </div>
            
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
            )}

            {showSuggestions && (filteredCategories.length > 0 || categories.length > 0) && (
              <ul className="absolute z-[9999] w-full mt-1 max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 text-base shadow-xl border-2 border-gray-200 dark:border-gray-600">
                {(filteredCategories.length > 0 ? filteredCategories : categories).map((category) => (
                  <li
                    key={category._id}
                    className="relative cursor-pointer select-none py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                    onClick={() => handleSuggestionClick(category)}
                  >
                    {category.categoryName}
                  </li>
                ))}
              </ul>
            )}
            
            {inputValue && filteredCategories.length === 0 && showSuggestions && categories.length > 0 && (
              <div className="absolute z-[9999] w-full mt-1 p-4 text-center bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md shadow-xl border-2 border-gray-200 dark:border-gray-600">
                No categories found.
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default CategorySearchWithForm;
