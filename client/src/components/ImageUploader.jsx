"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaUpload } from "react-icons/fa";

const ImageUpload = ({
  label = "Upload Image",
  accept = "image/*",
  name,
  onChange,
  error,
  className = "",
  required = false,
  height = 240,
  width,
  rounded = "full",
  imageIconSize = 24,
  defaultImage = null,
  edit = false,
}) => {
  const [preview, setPreview] = useState(defaultImage);
  const [isDefaultImage, setIsDefaultImage] = useState(!!defaultImage);
  const fileInputRef = useRef(null);
  useEffect(() => {
    // If defaultImage is a file object, create object URL
    if (defaultImage && typeof defaultImage === "object") {
      const url = URL.createObjectURL(defaultImage);
      setPreview(url);
      setIsDefaultImage(false);
      return () => URL.revokeObjectURL(url);
    } else if (defaultImage) {
      setPreview(defaultImage);
      setIsDefaultImage(true);
    } else {
      setPreview(null);
      setIsDefaultImage(false);
    }
  }, [defaultImage]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const selectedFile = e.target.files[0];
      if (!selectedFile || !selectedFile.type.startsWith("image/")) return;

      // Pass file to parent, parent will update defaultImage prop
      onChange?.(selectedFile);
    },
    [onChange]
  );

  const getRoundedClass = () => {
    switch (rounded) {
      case "none":
        return "";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "xl":
        return "rounded-xl";
      case "2xl":
        return "rounded-2xl";
      case "3xl":
        return "rounded-3xl";
      case "full":
        return "rounded-full";
      default:
        return "rounded-full";
    }
  };

  const containerStyle = {
    height: typeof height === "number" ? `${height}px` : height,
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
  };

  const iconSize = width ? Math.min(height, width) * 0.25 : height * 0.25;

  return (
    <div className={`group relative ${className}`}>
      {label && (
        <label
          htmlFor={`image-upload-${name}`}
          className="mb-2 block text-center text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-xs text-gray-400 ml-1">(required)</span>
          )}
        </label>
      )}

      <div
        style={containerStyle}
        className={`relative flex flex-col mx-auto items-center justify-center mt-1 overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-700 ${
          error
            ? "border-2 border-red-400/50"
            : "border border-gray-200 dark:border-gray-600"
        } ${getRoundedClass()} ${!width ? "w-full" : ""}`}
      >
        <input
          id={`image-upload-${name}`}
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          required={required && !preview}
        />

        {edit === true ? (
          // Edit mode: show image with edit overlay
          <div className="relative w-full h-full group">
            <div
              className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${getRoundedClass()}`}
            />
            <img
              src={preview || "/assets/images/default-profile.png"}
              alt="Preview"
              className={`h-full w-full object-cover object-center shadow-inner ${getRoundedClass()}`}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <button
                type="button"
                onClick={handleClick}
                className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 hover:bg-red-600"
              >
                Change Photo
              </button>
            </div>
          </div>
        ) : preview ? ( 
          <img
            src={preview}
            alt="Preview"
            className={`h-full w-full object-cover object-center shadow-inner ${getRoundedClass()}`}
          />
        ) : (
          <div
            onClick={handleClick}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center space-y-3"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleClick();
              }
            }}
            aria-label="Upload image"
          >
            <div
              style={{
                height: `${iconSize}px`,
                width: `${iconSize}px`,
              }}
              className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5"
            >
              <FaUpload
                style={{ fontSize: imageIconSize }}
                className="text-primary"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="text-primary underline-offset-2 hover:underline">
                  Click to upload <br />
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-center text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
