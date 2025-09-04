'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import { enGB } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

// ✅ Popper কে body-তে পাঠানোর জন্য wrapper
const BodyPopper = ({ children }) => {
  if (typeof document === 'undefined') return null; // SSR safe
  return createPortal(
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      <div className="pointer-events-auto">{children}</div>
    </div>,
    document.body
  );
};

const CustomDatePicker = ({
  label = 'Select Date',
  name,
  formData,
  setFormData,
  showYearDropdown = true,
  showMonthDropdown = true,
  scrollableYearDropdown = true,
  yearDropdownItemNumber = 100,
  errors = null,
  placeholder = "DD/MM/YYYY",
  maxDate = new Date(),
  minDate = null,
  required = false,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Nested value getter
  const getNestedValue = (obj, path) => {
    try {
      const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
      return normalizedPath.split('.').reduce((acc, key) => acc?.[key], obj);
    } catch {
      return undefined;
    }
  };

  // Nested value setter
  const setNestedValue = (obj, path, value) => {
    try {
      const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
      const keys = normalizedPath.split('.');
      const updated = { ...obj };
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined) {
          const nextKey = keys[i + 1];
          current[key] = /^\d+$/.test(nextKey) ? [] : {};
        } else {
          current[key] = Array.isArray(current[key])
            ? [...current[key]]
            : { ...current[key] };
        }
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    } catch {
      return obj;
    }
  };

  // Load initial value
  useEffect(() => {
    const initialValue = getNestedValue(formData, name);
    if (initialValue) {
      let parsedDate;
      if (typeof initialValue === 'string') {
        if (/\d{4}-\d{2}-\d{2}T/.test(initialValue)) {
          parsedDate = new Date(initialValue);
        } else if (/\d{4}-\d{2}-\d{2}/.test(initialValue)) {
          parsedDate = new Date(initialValue);
        } else if (/\d{2}\/\d{2}\/\d{4}/.test(initialValue)) {
          parsedDate = parse(initialValue, 'dd/MM/yyyy', new Date(), { locale: enGB });
        } else {
          parsedDate = new Date(initialValue);
        }
      } else if (initialValue instanceof Date) {
        parsedDate = initialValue;
      }
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    } else {
      setSelectedDate(null);
    }
  }, [formData, name]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = format(date, 'dd/MM/yyyy');
      setFormData(prev => setNestedValue(prev, name, formattedDate));
    } else {
      setFormData(prev => setNestedValue(prev, name, ''));
    }
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      )}
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        locale={enGB}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        scrollableYearDropdown={scrollableYearDropdown}
        yearDropdownItemNumber={yearDropdownItemNumber}
        placeholderText={placeholder}
        maxDate={maxDate}
        minDate={minDate}
        className={`w-full px-3 py-2 border ${
          errors ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
        wrapperClassName="w-full"
        popperProps={{ strategy: "fixed" }}
        popperPlacement="bottom-start"
        popperClassName="react-datepicker-popper"
        popperContainer={({ children }) => <BodyPopper>{children}</BodyPopper>}
      />
      {errors && <span className="text-red-500 text-sm">{errors}</span>}
    </div>
  );
};

export default CustomDatePicker;
