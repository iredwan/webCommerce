'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetAllUsersQuery, useDeleteUserMutation, useUpdateUserMutation } from '@/features/user/userApiSlice';
import { selectUserInfo } from '@/features/userInfo/userInfoSlice';
import Pagination from '@/components/Pagination';
import { FaBan, FaTrash, FaUserPlus, FaEye, FaLock, FaLockOpen, FaUserShield, FaUserTag } from 'react-icons/fa';
import { HiCheckCircle, HiShieldCheck  } from "react-icons/hi";
import { useSelector } from 'react-redux';
import deleteConfirm from '@/utils/deleteConfirm';
import { toast } from 'react-toastify';
const UsersPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [formData, setFormData] = useState({
    isBlocked: '',
    isVerified: '',
  });

  const { data: usersData, isLoading, error, refetch } = 
  useGetAllUsersQuery({
    page: currentPage,
    limit,
  }, {
    skip: !limit || limit === 0
  });

    const [deleteUser] = useDeleteUserMutation();
    const [updateUser] = useUpdateUserMutation();

  const userInfo = useSelector(selectUserInfo);
  const userId = userInfo?._id;
  const userRole = userInfo?.role;

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  const handleUserClick = (userId) => {
    router.push(`/dashboard/admin/users/${userId}`);
  };

    const handleBlockUser = async (userId, isBlocked) => {
      try {
        const response = await updateUser({ id: userId, isBlocked: !isBlocked }).unwrap();
        if (response.status === true) {
          toast.success(response.message || (isBlocked ? 'User unblocked' : 'User blocked'));
          refetch();
        } else {
          toast.error(response.message || 'Failed to update block status');
        }
      } catch (error) {
        toast.error('Failed to update block status');
      }
    };

    const handleVerifyUser = async (userId, isVerified) => {
      try {
        const response = await updateUser({ id: userId, isVerified: !isVerified }).unwrap();
        if (response.status === true) {
          toast.success(response.message || (isVerified ? 'User unverified' : 'User verified'));
          refetch();
        } else {
          toast.error(response.message || 'Failed to update verify status');
        }
      } catch (error) {
        toast.error('Failed to update verify status');
      }
    };

    const handleDeleteUser = async (userId) => {
    const confirmed = await deleteConfirm({
      title: 'Delete User',
      text: 'Are you sure you want to delete this user?',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      icon: 'warning',
    });
    if (confirmed) {
      try {
       const response = await deleteUser(userId).unwrap();
        if (response.status === true) {
            toast.success(`${response.message}`);
            refetch();
        }
        if (response.status === 'false') {
          toast.error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Error loading users. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex md:flex-row flex-col justify-between items-center my-6 gap-3">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Users Management</h1>
      {/* Limit input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder= "Set Limit"
          onChange={(e) => setLimit(e.target.value)}
          className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      {/* Search Bar    */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by email or phone"
          className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        </div>
        <button 
        title='Click to add a new user'
        onClick={() => router.push(`/dashboard/${userRole}/users/add`)}
        className="bg-background text-text px-4 py-2 rounded-md flex items-center gap-2">
          <FaUserPlus /> Add User
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-background text-text">
              <th className="px-2 md:px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                Name
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider">
                Contact Info
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 md:px-6 py-3 text-sm text-center font-medium  uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300">
            {usersData?.data.map((user) => (
              <tr
                key={user._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${userId === user._id ? "bg-gray-100 dark:bg-gray-600" : ""}`}
              >
                <td 
                className="px-2 md:px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                      <div
                      onClick={() => handleUserClick(user._id)}
                      className="text-sm font-medium text-gray-900 dark:text-gray-200 cursor-pointer hover:scale-105 transition-transform">
                        {user.cus_firstName} {user.cus_lastName} 
                        {user.role === 'admin' ? <HiShieldCheck  className='inline-block ml-2 text-primary' /> 
                        :
                        user.role === 'manager' ? <FaUserShield  className='inline-block ml-2 text-primary' /> 
                        :
                        user.role === 'seller' ? <FaUserTag  className='inline-block ml-2 text-primary' /> 
                        :
                        user.isVerified ? <HiCheckCircle className='inline-block ml-2 text-primary' />
                        : ''}
                      </div>
                  </div>
                  <div className="md:hidden text-sm text-gray-500 dark:text-gray-400 my-1">
                    {user.cus_email}
                  </div>
                  <div className="md:hidden text-sm text-gray-500 dark:text-gray-400">
                    {user.cus_phone}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">{user.cus_email}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.cus_phone}</div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-center gap-1">
                    <span
                      className={`px-3 py-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isBlocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                    <span
                      className={`px-3 py-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </td>
                <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleUserClick(user._id)}
                      className="text-blue-600 hover:text-blue-900 hover:scale-110 transition-transform"
                    >
                      <FaEye title='Click to view user details' size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyUser(user._id, user.isVerified);
                      }}
                      className='hover:scale-110 transition-transform'
                    >
                      {user.isVerified ?
                      <FaBan 
                      title='Click to unverify this user' className='text-primary' size={18} /> 
                      : 
                      <HiCheckCircle 
                      title='Click to verify this user'
                      className='text-primary' size={18} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockUser(user._id, user.isBlocked);
                      }}
                      className='hover:scale-110 transition-transform'
                    >
                      {user.isBlocked ? 
                      <FaLock 
                      title='Click to unblock this user' 
                      className='text-yellow-500'  size={18} /> 
                      : 
                      <FaLockOpen 
                      title='Click to block this user'
                      className='text-yellow-500' size={18} />}
                    </button>
                      <button
                      onClick={() => handleDeleteUser(user._id)}
                      title='Click to delete this user'
                      className="text-red-600 hover:text-red-900 hover:scale-110 transition-transform"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {usersData?.pagination && (
        <div className="mt-4">
          <Pagination
            pageCount={usersData.pagination.pages}
            onPageChange={handlePageChange}
            currentPage={currentPage - 1}
          />
        </div>
      )}
    </div>
  );
}

export default UsersPage