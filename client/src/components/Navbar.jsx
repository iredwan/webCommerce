"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGetUserInfoQuery } from "@/features/userInfo/userInfoApiSlice";
import { useLogoutMutation } from "@/features/user/userApiSlice";
import {
  setUserInfo,
  clearUserInfo,
  selectUserInfo,
  selectIsAuthenticated,
} from "@/features/userInfo/userInfoSlice";
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const currentPath = usePathname();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const user = useSelector(selectUserInfo);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const {
    data: userData,
    isLoading: userInfoLoading,
    error: userInfoError,
    isError: isUserInfoError,
  } = useGetUserInfoQuery(undefined, {
    skip: false,
    refetchOnWindowFocus: false,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (userData?.status && userData?.user) {
      dispatch(setUserInfo(userData.user));
    } else if (userData?.status === false) {
      dispatch(clearUserInfo());
    }
    if (userInfoError && userInfoError.status !== 401) {
      toast.error("Failed to load user info.");
    }
  }, [userData, userInfoError, dispatch]);

  const [logoutUser] = useLogoutMutation();

  const logOutFunction = async () => {
    try {
      const result = await logoutUser().unwrap();
      dispatch(clearUserInfo());
      toast.success(result?.message || "Logout successful");
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };



  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Close when pressing Escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const userRole = user?.role;
  const roleRoutes ={
    admin: "/dashboard/admin",
    manager: "/dashboard/manager",
    seller: "/dashboard/seller",
    customer: "/dashboard/customer",
  }
  const dashboardPath = roleRoutes[userRole];

  return (
    // Update the nav element to use the theme colors
    <nav className="bg-background w-full shadow-lg">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <motion.span 
                className="text-text text-2xl md:text-3xl font-bold tracking-tight"
                whileHover={{ scale: 1.05 }}
              >
                Web Commerce
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center text-center">
          <NavLink href="/" current={currentPath}>Home</NavLink>
            {!isAuthenticated && (
              <NavLink href="/user-register" current={currentPath}>Register</NavLink>
            )}
            {isAuthenticated && (
              <NavLink href="/products" current={currentPath}>Products</NavLink>
            )}
            <NavLink href="/track-order" current={currentPath}>Track Order</NavLink>
            <NavLink href="/about" current={currentPath}>About</NavLink>
            <NavLink href="/contact" current={currentPath}>Contact</NavLink>
            {dashboardPath && (
                <NavLink href={dashboardPath} current={currentPath}>
                  <div className="flex items-center">
                    <FiSettings className="mr-1" /> Dashboard
                  </div>
                </NavLink>
              )}
          </div>

          <div className="hidden md:flex">
            {isAuthenticated ? (
              <button
                onClick={logOutFunction}
                className="bg-background text-text border border-text px-2 py-1.5 rounded-full text-sm shadow-md flex items-center gap-1 hover:scale-105 transition-all duration-300"
              >
                <FiLogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-background text-text border border-text px-2 py-1.5 rounded-full text-sm shadow-md flex items-center gap-1 hover:scale-105 transition-all duration-300"
              >
                <FiUser className="h-4 w-4" /> Login
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated ? (
              <button
                onClick={logOutFunction}
                className="bg-background text-text border border-text px-2 py-1.5 rounded-full text-sm shadow-md flex items-center gap-1 hover:scale-105 transition-all duration-300"
              >
                <FiLogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-background text-text border border-text px-2 py-1.5 rounded-full text-sm shadow-md flex items-center gap-1 hover:scale-105 transition-all duration-300"
              >
                <FiUser className="h-4 w-4" /> Login
              </Link>
            )}
            {isMenuOpen === false ? (
              <div
                onClick={() => setIsMenuOpen(true)}
                className="">
                  <FaBars className="h-6 w-6 text-white cursor-pointer"/>
                </div>
            ):(
              <div
                onClick={() => setIsMenuOpen(false)}
                className="">
                  <FaTimes className="h-6 w-6 text-white cursor-pointer"/>
                </div>
            )}
          </div>
       </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background"
              onClick={closeMenu}
            />
            
            {/* Menu Panel */}
            <motion.div 
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-background shadow-xl"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-text/10">
                <Link href="/" className="text-text text-xl font-bold" onClick={closeMenu}>
                  WebCommerce
                </Link>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md text-text focus:outline-none"
                >
                  <FaTimes className="text-xl" />
                  <span className="sr-only">Close menu</span>
                </button>
              </div>
              
              <div className="h-[calc(100%-4rem)] overflow-y-auto py-4 px-2 flex flex-col gap-4">
              <MobileNavLink href="/" current={currentPath} onClick={closeMenu}>Home</MobileNavLink>
            {!isAuthenticated && (
              <MobileNavLink href="/user-register" current={currentPath} onClick={closeMenu}>Register</MobileNavLink>
            )}
            {isAuthenticated && (
              <MobileNavLink href="/products" current={currentPath} onClick={() => setIsMenuOpen(false)}>Products</MobileNavLink>
            )}
            <MobileNavLink href="/track-order" current={currentPath} onClick={() => setIsMenuOpen(false)}>Track Order</MobileNavLink>
            <MobileNavLink href="/about" current={currentPath} onClick={() => setIsMenuOpen(false)}>About</MobileNavLink>
            <MobileNavLink href="/contact" current={currentPath} onClick={() => setIsMenuOpen(false)}>Contact</MobileNavLink>
            {dashboardPath && (
            <MobileNavLink href={dashboardPath} current={currentPath} onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center">
                <FiSettings className="mr-1" /> Dashboard
              </div>
            </MobileNavLink>
          )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </nav>
  );
};

// Desktop Navigation Item Component
const NavLink = ({ href = '/', current, children }) => {
  const isActive = href === current;
  return (
    <Link
      href={href}
      className={`px-2 py-1 transition-all rounded-md ${
        isActive
          ? "text-white text-md font-semibold border-b-2 border-white"
          : "text-gray-100 hover:text-white text-md hover:font-semibold hover:border-b-2 hover:border-white"
      }`}
    >
      {children}
    </Link>
  );
};

// Mobile Navigation Item Component
const MobileNavLink = ({ href, current, children, onClick }) => {
  const isActive = href === current;
  return (
    <Link href={href} passHref>
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="flex items-center px-2 py-1 text-text rounded-xl border-b-2 border-text"
        onClick={onClick}
      >
        <span className="font-medium text-md">{children}</span>
      </motion.div>
    </Link>
  );
};

export default Navbar;