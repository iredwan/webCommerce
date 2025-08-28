'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { Controller } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';

/** Portal container: popper -> document.body (SSR safe) */
const BodyPopper = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // pointer-events-none wrapper যাতে কেবল ক্যালেন্ডার ক্লিক নেয়
  return createPortal(
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      <div className="pointer-events-auto">{children}</div>
    </div>,
    document.body
  );
};

const DatePickerWithForm = ({
  label = 'Select Date',
  name,
  control,
  rules = {},
  required = false,
  showYearDropdown = true,
  showMonthDropdown = true,
  scrollableYearDropdown = true,
  yearDropdownItemNumber = 100,
  placeholder = 'DD/MM/YYYY',
  maxDate = null,
  minDate = null,
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
      render={({ field, fieldState }) => {
        const { onChange, value } = field;
        const { error } = fieldState;

        const parseDate = (dateValue) => {
          if (!dateValue) return null;
          try {
            if (dateValue instanceof Date) return dateValue;

            if (typeof dateValue === 'string') {
              if (/\d{4}-\d{2}-\d{2}T/.test(dateValue)) return new Date(dateValue);
              if (/\d{4}-\d{2}-\d{2}$/.test(dateValue)) return new Date(dateValue);
              if (/\d{2}\/\d{2}\/\d{4}/.test(dateValue))
                return parse(dateValue, 'dd/MM/yyyy', new Date(), { locale: enGB });
            }

            const d = new Date(dateValue);
            return isNaN(d.getTime()) ? null : d;
          } catch {
            return null;
          }
        };

        const selectedDate = parseDate(value);

        const handleDateChange = (date) => {
          if (date) onChange(format(date, 'dd/MM/yyyy'));
          else onChange('');
        };

        return (
          <div className={`relative ${className}`}>
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
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
              wrapperClassName="w-full"
              /* Popper must be fixed + highest layer */
              popperProps={{ strategy: 'fixed' }}
              popperPlacement="bottom-start"
              popperClassName="react-datepicker-popper"
              /* ✅ Hard fix: render popper into body via portal */
              popperContainer={({ children }) => <BodyPopper>{children}</BodyPopper>}
            />

            {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
          </div>
        );
      }}
    />
  );
};

export default DatePickerWithForm;
