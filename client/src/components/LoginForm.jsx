import React, { useState, useEffect } from "react";
import { useLoginMutation } from "../features/user/userApiSlice";
import { useLazyGetUserInfoQuery } from "../features/userInfo/userInfoApiSlice";
import {
  setUserInfo,
  clearUserInfo,
} from "../features/userInfo/userInfoSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { isValidEmail, isValidPhone } from "../utils/validations";

const LoginForm = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    contact: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [login, { isLoading: isLoginLoading, error: loginError }] =
    useLoginMutation();

  const [getUserInfo, { isLoading: isUserInfoLoading }] =
    useLazyGetUserInfoQuery();

  useEffect(() => {
    if (loginError) {
      toast.error(
        loginError.data?.message || "Login failed. Please try again."
      );
    }
  }, [loginError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user types
    setValidationErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.contact) {
      errors.contact = "Email or phone number is required";
    } else {
      // Check if input is email or phone
      const isEmail = isValidEmail(formData.contact) === null;
      const isPhone = isValidPhone(formData.contact) === null;

      if (!isEmail && !isPhone) {
        errors.contact = "Please enter a valid email address or phone number";
      }
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await login(formData).unwrap();
      if (!response?.status) {
        toast.error(response?.message || "Login failed. Please try again.");
        return;
      }
      // Login successful
      const userInfoResponse = await getUserInfo().unwrap();

      if (userInfoResponse?.status && userInfoResponse?.user) {
        dispatch(setUserInfo(userInfoResponse.user));

        toast.success(userInfoResponse?.message || "Login successful!");

        // Redirect after a short delay
        setTimeout(() => {
          if (userInfoResponse?.user?.role === "admin") {
            window.location.href = "/dashboard/admin";
          } else if (userInfoResponse?.user?.role === "manager") {
            window.location.href = "/dashboard/manager";
          } else if (userInfoResponse?.user?.role === "seller") {
            window.location.href = "/dashboard/seller";
          } else if (userInfoResponse?.user?.role === "customer") {
            window.location.href = "/dashboard/customer";
          } else {
            window.location.href = "/";
          }
        }, 1000);
      } else {
        dispatch(clearUserInfo());
        toast.error(
          userInfoResponse?.message || "Unauthorized or invalid user."
        );
      }
    } catch (error) {
      dispatch(clearUserInfo());
        toast.error(
          error.message
        );
    }
  };

  const isLoading = isLoginLoading || isUserInfoLoading;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Or{" "}
            <Link
              href="/user-register"
              className="font-medium text-primary hover:underline"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email or Phone Number
              </label>
              <input
                id="contact"
                name="contact"
                type="text"
                autoComplete="email"
                required
                value={formData.contact}
                onChange={handleInputChange}
                className={`appearance-none dark:bg-gray-800 relative block w-full px-3 py-2 border ${
                  validationErrors.contact
                    ? "border-red-300"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                placeholder="Enter your email or phone number"
              />
              {validationErrors.contact && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.contact}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none dark:bg-gray-800 relative block w-full px-3 py-2 border ${
                    validationErrors.password
                      ? "border-red-300"
                      : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}
            </div>
          </div>

          {/* ✅ Updated This Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center gap-2 sm:gap-0 space-y-2">
            <div className="flex items-center justify-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500  border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-text bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
