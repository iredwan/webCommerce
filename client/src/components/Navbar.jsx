"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTruck, FaUser, FaUserPlus, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  return (
    // Update the nav element to use the theme colors
    <nav className="bg-background w-full shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
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
          <div className="hidden md:flex items-center space-x-6">
            <NavItem icon={<FaUserPlus />} text="Register" link="/register" />
            <NavItem icon={<FaTruck />} text="Track Order" link="/track-order" />
            <NavItem icon={<FaUser />} text="Login" link="/login" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <NavItem icon={<FaUser />} text="Login" link="/login" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text focus:outline-none transition-colors"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>
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
                <MobileNavItem 
                  icon={<FaUserPlus />} 
                  text="Register" 
                  link="/register" 
                  onClick={closeMenu}
                />
                <MobileNavItem 
                  icon={<FaTruck />} 
                  text="Track Order" 
                  link="/track-order" 
                  onClick={closeMenu}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Desktop Navigation Item Component
const NavItem = ({ icon, text, link }) => {
  return (
    <Link href={link} passHref>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="group relative"
      >
        <div className="flex items-center space-x-2 px-2 py-1 rounded-full border border-text">
          <span className="text-text text-sm">{icon}</span>
          <span className="text-text font-medium text-sm">
            {text}
          </span>
        </div>
        <motion.span 
          className="absolute bottom-0 left-0 w-0 h-0.5 bg-background group-hover:w-full transition-all duration-300"
          initial={{ width: 0 }}
          whileHover={{ width: '100%' }}
        />
      </motion.div>
    </Link>
  );
};

// Mobile Navigation Item Component
const MobileNavItem = ({ icon, text, link, onClick }) => {
  return (
    <Link href={link} passHref>
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="flex items-center px-2 py-1 text-text rounded-xl border-b-2 border-text"
        onClick={onClick}
      >
        <span className="mr-4 text-md">{icon}</span>
        <span className="font-medium text-md">{text}</span>
      </motion.div>
    </Link>
  );
};

export default Navbar;