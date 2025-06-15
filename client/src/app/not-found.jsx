import Link from 'next/link';
import { FaHome, FaSearch } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center w-full max-w-md bg-white px-4 py-6 rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-6xl sm:text-8xl font-bold text-primary">404</h1>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-600 dark:text-gray-300 mt-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8 text-sm sm:text-base">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-4 sm:space-x-4 justify-center">
  <Link
    href="/"
    className="inline-flex items-center justify-center text-sm px-6 py-3 bg-background text-text font-medium rounded-full w-40"
  >
    <FaHome className="mr-1" />
    Go Home
  </Link>
  <Link
    href="/products"
    className="inline-flex items-center justify-center text-sm px-6 py-3 bg-background text-text font-medium rounded-full w-48"
  >
    <FaSearch className="mr-1" />
    Browse Products
  </Link>
</div>


      </div>
    </div>
  );
} 