'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserInfoQuery } from '../features/userInfo/userInfoApiSlice';

const PrivateRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useGetUserInfoQuery();

  React.useEffect(() => {
    if (!isLoading && !isError) {
      if (!data?.user && requireAuth) {
        router.replace('/login');
      } else if (
        requireAuth &&
        allowedRoles.length > 0 &&
        (!data?.user || !allowedRoles.includes(data.user.role))
      ) {
        router.replace('/unauthorized');
      }
    }
    // Optionally, handle error as unauthenticated
    if (isError && requireAuth) {
      router.replace('/login');
    }
  }, [isLoading, isError, data, requireAuth, allowedRoles, router]);

  // Show loader while loading or if user info is not yet available
  if (isLoading || (!data && !isError)) {
    return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>;
  }

  // Optionally, show nothing or a message if error
  if (isError && requireAuth) {
    return null;
  }

  if (!requireAuth) {
    return children;
  }

  if (!data?.user) {
    // Redirect handled in useEffect
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(data.user.role)) {
    // Redirect handled in useEffect
    return null;
  }

  return children;
};

export default PrivateRoute;