
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { FaChevronDown } from "react-icons/fa";

const CustomSelectDropdown = ({
  label,
  required,
  disabled,
  placeholder,
  options,
  value,
  onChange,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const selectedOption = options.find(option => {
        if (typeof option === 'object') {
          return Object.is(option.value, value) || option.value === value;
        }
        return Object.is(option, value) || option === value;
      });
      if (selectedOption) {
        setInputValue(typeof selectedOption === 'object' ? selectedOption.label : selectedOption);
      }
    } else {
      setInputValue('');
    }
  }, [value, options]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue.trim() === '') {
      setFilteredOptions([]);
      setShowSuggestions(false);
      if (onChange) onChange('');
      return;
    }
    const filtered = options.filter(option => {
      const optionText = typeof option === 'object' ? option.label : option;
      return optionText.toLowerCase().includes(newValue.toLowerCase());
    });
    setFilteredOptions(filtered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (option) => {
    const optionValue = typeof option === 'object' ? option.value : option;
    const optionLabel = typeof option === 'object' ? option.label : option;
    setInputValue(optionLabel);
    setShowSuggestions(false);
    if (onChange) onChange(optionValue);
  };

  const handleFocus = () => {
    if (inputValue.trim() !== '') {
      setShowSuggestions(true);
    }
  };

  const handleDropdownClick = () => {
    if (showSuggestions) {
      setShowSuggestions(false);
    } else {
      setFilteredOptions(options);
      setShowSuggestions(true);
    }
  };

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
          className={`w-full px-4 py-2.5 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${error ? 'border-red-500' : 'border-neutral-300'}`}
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
          {error.message || error}
        </p>
      )}
      {showSuggestions && (filteredOptions.length > 0 || options.length > 0) && (
        <ul className="absolute z-[9999] w-full mt-1 max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 text-base shadow-xl border-2 border-gray-200 dark:border-gray-600">
          {(filteredOptions.length > 0 ? filteredOptions : options).map((option, index) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            const key = typeof option === 'object' 
              ? (typeof option.value === 'boolean' ? String(option.value) : option.value) || index 
              : (typeof option === 'boolean' ? String(option) : option);
            const isSelected = typeof option === 'object' 
              ? Object.is(option.value, value) || option.value === value
              : Object.is(option, value) || option === value;
            return (
              <li
                key={key}
                className={`relative cursor-pointer select-none py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 ${isSelected ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
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

const CustomSelectWithForm = ({
  label,
  name,
  control,
  options = [],
  rules = {},
  required = false,
  disabled = false,
  placeholder = 'Search for an option...',
  className = '',
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `${label} is required` : false,
        ...rules,
      }}
      render={({ field, fieldState }) => (
        <CustomSelectDropdown
          label={label}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          options={options}
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error}
        />
      )}
    />
  );
};

export default CustomSelectWithForm;
