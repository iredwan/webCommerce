import React from "react";

const CustomInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = null,
  disabled = false,
  className = "",
  ...rest
}) => {
  return (
    <div className="form-elements">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border ${
          error ? "border-red-500" : "border-neutral-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default CustomInput;
