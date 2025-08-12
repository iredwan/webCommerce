'use client';

import imageCompression from 'browser-image-compression';

/**
 * Upload compressed files with progress support using XMLHttpRequest
 * 
 * @param {FileList|File[]} files - The files to upload
 * @param {Object} options - Upload options
 * @param {number} options.maxFiles - Maximum number of files (default: 20)
 * @param {Function} options.onSuccess - Called on successful upload
 * @param {Function} options.onError - Called on error
 * @param {Function} options.onProgress - Called with progress percentage
 * @returns {Promise} Resolves with uploaded file data
 */
const uploadFilesWithProgress = async (files, options = {}) => {
  const {
    maxFiles = 20,
    onSuccess,
    onError,
    onProgress,
  } = options;

  try {
    const filesArray = Array.from(files);

    if (!filesArray.length) {
      const error = 'No files selected for upload';
      onError?.(error);
      return Promise.reject(new Error(error));
    }

    if (filesArray.length > maxFiles) {
      const error = `You can only upload a maximum of ${maxFiles} files`;
      onError?.(error);
      return Promise.reject(new Error(error));
    }

    // Compress files in parallel
    const compressedFiles = await Promise.all(filesArray.map(async (file) => {
      const compressionOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        initialQuality: 0.7,
        useWebWorker: true,
      };
      return await imageCompression(file, compressionOptions);
    }));

    // Prepare FormData
    const formData = new FormData();
    compressedFiles.forEach(file => {
      formData.append('file', file);
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const uploadUrl = `${baseUrl}/file-upload`;

    // Upload with XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', uploadUrl);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && typeof onProgress === 'function') {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.status) {
            onSuccess?.(data.file);
            resolve(data.file);
          } else {
            const error = data.msg || 'Upload failed';
            onError?.(error);
            reject(new Error(error));
          }
        } catch (err) {
          const error = 'Invalid server response';
          onError?.(error);
          reject(new Error(error));
        }
      };

      xhr.onerror = () => {
        const error = 'Upload failed due to a network error';
        onError?.(error);
        reject(new Error(error));
      };

      xhr.send(formData);
    });

  } catch (err) {
    const errorMessage = err.message || 'Unexpected error occurred';
    onError?.(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
};

export default uploadFilesWithProgress;
