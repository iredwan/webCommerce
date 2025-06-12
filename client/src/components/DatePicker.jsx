'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

const CustomDatePicker = ({ 
  label = 'Select Date',
  name,
  formData,
  setFormData,
  errors = {},
  placeholder = "DD/MM/YYYY",
  dateFormat = "dd/MM/yyyy",
  maxDate = new Date(),
  minDate = null,
  required = false,
  showYearDropdown = true,
  showMonthDropdown = false,
  scrollableYearDropdown = true,
  yearDropdownItemNumber = 100,
  className = ""
}) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Extract the field name and initial value from formData
  const fieldName = name || 'date';
  const errorMessage = errors[fieldName] || '';

  // Initialize from formData if it exists
  useEffect(() => {
    if (formData[fieldName]) {
      try {
        // Parse the date from dd/MM/yyyy format
        const parsedDate = parse(formData[fieldName], 'dd/MM/yyyy', new Date());
        setSelectedDate(parsedDate);
      } catch (error) {
        console.error(`Error parsing date for ${fieldName}:`, error);
      }
    }
  }, [formData, fieldName]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    if (date) {
      // Format the date to dd/MM/yyyy for storage
      const formattedDate = format(date, 'dd/MM/yyyy');
      setFormData(prev => ({ ...prev, [fieldName]: formattedDate }));
    } else {
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <DatePicker
          id={fieldName}
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat={dateFormat}
          showYearDropdown={showYearDropdown}
          showMonthDropdown={showMonthDropdown}
          scrollableYearDropdown={scrollableYearDropdown}
          yearDropdownItemNumber={yearDropdownItemNumber}
          placeholderText={placeholder}
          maxDate={maxDate}
          minDate={minDate}
          wrapperClassName="w-full"
          className={`w-full px-4 py-2.5 pr-20 border ${errors.dob ? 'border-red-500' : 'border-neutral-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white dark:border-gray-300`}
        />
        <div
          onClick={() => document.getElementById(fieldName).focus()}
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {errorMessage && <span className="text-red-500 text-sm mt-1 block">{errorMessage}</span>}
    </div>
  );
};

export default CustomDatePicker;




