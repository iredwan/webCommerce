'use client';

// Re-export everything from the files
export * from './categoryApiSlice';
export * from './categorySlice';
export * from './categoryThunks';

// Also export the reducer as default
import categoryReducer from './categorySlice';
export default categoryReducer;
