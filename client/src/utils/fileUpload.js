'use client';

import imageCompression from 'browser-image-compression';

/**
 * Utility function for uploading compressed image files to the server
 * @param {FileList|File[]} files - The files to upload (from input[type="file"] or drag and drop)
 * @param {Object} options - Additional options
 * @param {number} options.maxFiles - Maximum number of files to upload (default: 20)
 * @param {Function} options.onSuccess - Callback function when upload is successful (receives file data)
 * @param {Function} options.onError - Callback function when upload fails (receives error message)
 * @param {Function} options.onProgress - Callback function for upload progress (not implemented yet)
 * @returns {Promise} Promise that resolves with the uploaded file data or rejects with error
 */
const uploadFiles = async (files, options = {}) => {
  const { 
    maxFiles = 20, 
    onSuccess, 
    onError,
    onProgress 
  } = options;
  
  try {
    const filesArray = Array.from(files);
    
    // Validate number of files
    if (filesArray.length > maxFiles) {
      const error = `You can only upload a maximum of ${maxFiles} files at once.`;
      if (onError) onError(error);
      return Promise.reject(new Error(error));
    }

    if (!filesArray.length) {
      const error = 'No files selected for upload';
      if (onError) onError(error);
      return Promise.reject(new Error(error));
    }

    // Compress each file before uploading
    const compressedFiles = await Promise.all(filesArray.map(async (file) => {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        initialQuality: 0.7,
        useWebWorker: true,
      };
      return await imageCompression(file, options);
    }));

    // Create FormData
    const formData = new FormData();
    compressedFiles.forEach(file => {
      formData.append('file', file);
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const uploadUrl = `${baseUrl}/file-upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      const error = data.msg || 'Upload failed';
      if (onError) onError(error);
      return Promise.reject(new Error(error));
    }

    if (onSuccess) onSuccess(data.file);
    return data.file;

  } catch (err) {
    const errorMessage = err.message || 'Error uploading files';
    if (onError) onError(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
};

export default uploadFiles;
