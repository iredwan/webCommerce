'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { FaChevronDown } from "react-icons/fa";

// Extracted select component logic
const SelectComponent = ({
  label,
  required,
  disabled,
  placeholder,
  options,
  onSelectOption,
  wrapperRef,
  value,
  onChange = () => {}, // Default empty function
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  
  // Update input value when form value changes
  useEffect(() => {
    // Check if value is not undefined or null (to handle boolean false values correctly)
    if (value !== undefined && value !== null) {
      const selectedOption = options.find(option => {
        if (typeof option === 'object') {
          // Strict equality comparison for option.value and value
          return Object.is(option.value, value) || option.value === value;
        }
        // Strict equality comparison for option and value
        return Object.is(option, value) || option === value;
      });
      if (selectedOption) {
        setInputValue(typeof selectedOption === 'object' ? selectedOption.label : selectedOption);
      }
    } else {
      setInputValue('');
    }
  }, [value, options]);
  
  // Handle input change for search
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.trim() === '') {
      setFilteredOptions([]);
      setShowSuggestions(false);
      if (onChange && typeof onChange === 'function') {
        onChange('');
      }
      if (onSelectOption) onSelectOption(null);
      return;
    }
    
    // Filter options based on input
    const filtered = options.filter(option => {
      const optionText = typeof option === 'object' ? option.label : option;
      return optionText.toLowerCase().includes(newValue.toLowerCase());
    });
    
    setFilteredOptions(filtered);
    setShowSuggestions(true);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (option) => {
    const optionValue = typeof option === 'object' ? option.value : option;
    const optionLabel = typeof option === 'object' ? option.label : option;
    
    setInputValue(optionLabel);
    setShowSuggestions(false);
    
    if (onChange && typeof onChange === 'function') {
      onChange(optionValue);
    }
    
    if (onSelectOption) {
      onSelectOption(option);
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
      // Show all options when dropdown is clicked
      setFilteredOptions(options);
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
  }, [wrapperRef]);
  
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
         {disabled === false && <FaChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />}        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error.message || error}
        </p>
      )}

      {showSuggestions && (filteredOptions.length > 0 || options.length > 0) && (
        <ul className="absolute z-[9999] w-full mt-1 max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 text-base shadow-xl border-2 border-gray-200 dark:border-gray-600">
          {(filteredOptions.length > 0 ? filteredOptions : options).map((option, index) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            // Generate unique key handling boolean values
            const key = typeof option === 'object' 
              ? (typeof option.value === 'boolean' ? String(option.value) : option.value) || index 
              : (typeof option === 'boolean' ? String(option) : option);
            
            // Check if this option is selected
            const isSelected = typeof option === 'object' 
              ? Object.is(option.value, value) || option.value === value
              : Object.is(option, value) || option === value;
            
            return (
              <li
                key={key}
                className={`relative cursor-pointer select-none py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 ${
                  isSelected ? 'bg-gray-100 dark:bg-gray-600' : ''
                }`}
                onClick={() => handleSuggestionClick(option)}
              >
                {optionLabel}
              </li>
            );
          })}
        </ul>
      )}
      
      {inputValue && filteredOptions.length === 0 && showSuggestions && options.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 p-4 text-center bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md shadow-xl border-2 border-gray-200 dark:border-gray-600">
          No options found.
        </div>
      )}
    </div>
  );
};

/**
 * A reusable custom select component that can work with or without React Hook Form
 */
const CustomSelect = ({
  label,
  name,
  control,
  rules = {},
  placeholder = 'Search for an option...',
  required = false,
  disabled = false,
  options = [],
  onSelectOption,
  // Props for non-form usage
  value, // Kept for backward compatibility
  selected, // New prop name for consistency with other form components
  onChange,
  setSelected, // Function to update the selected value in parent
  error,
}) => {
  const wrapperRef = useRef(null);
  
  // Use selected prop first, fall back to value for backward compatibility
  const actualValue = selected !== undefined ? selected : value;
  
  // Log the value for debugging (can be removed later)
  useEffect(() => {
  }, [actualValue, selected, value, label]);
  
  // Create a handler that calls both onChange and setSelected if they exist
  const handleChange = (val) => {
    if (onChange && typeof onChange === 'function') {
      onChange(val);
    }
    
    if (setSelected && typeof setSelected === 'function') {
      setSelected(val);
    }
  };

  // If control is provided, use React Hook Form
  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
          ...rules,
        }}
        render={({ field, fieldState }) => {
          return (
            <SelectComponent
              label={label}
              required={required}
              disabled={disabled}
              placeholder={placeholder}
              options={options}
              onSelectOption={onSelectOption}
              wrapperRef={wrapperRef}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error}
            />
          );
        }}
      />
    );
  }
  
  return (
    <SelectComponent
      label={label}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      options={options}
      onSelectOption={onSelectOption}
      wrapperRef={wrapperRef}
      value={actualValue}
      onChange={handleChange}
      error={error}
    />
  );
};

export default CustomSelect;
