'use client';

import React from 'react';
import { Controller } from 'react-hook-form';

const CustomInputWithForm = ({
  label,
  name,
  control,
  rules = {},
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  min,
  max,
  step,
  ...otherProps
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
        const { onChange, value, ref } = field;
        const { error } = fieldState;

        const handleChange = (e) => {
          if (type === 'number') {
            onChange(e.target.value === '' ? '' : e.target.valueAsNumber);
          } else {
            onChange(e.target.value);
          }
        };

        return (
          <div className="form-elements">
            {label && (
              <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            <input
              id={name}
              type={type}
              name={name}
              value={value ?? ''}
              onChange={handleChange}
              ref={ref}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              {...otherProps}
              className={`w-full px-4 py-2.5 border ${
                error ? 'border-red-500' : 'border-neutral-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${className}`}
            />

            {error && (
              <p className="mt-1 text-sm text-red-500">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
};

export default CustomInputWithForm;
