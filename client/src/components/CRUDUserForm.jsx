'use client'
import React, { useState, useEffect } from "react";
import CustomInput from "./CustomInput";
import CustomSelect from "./CustomSelect";
import ImageUpload from "./ImageUploader";
import { useRegisterWithRefMutation, useUpdateUserMutation, useDeleteUserMutation } from "../features/user/userApiSlice";
import { selectUserInfo } from '@/features/userInfo/userInfoSlice';
import ModernLocationSelector from "./LocationSelector";
import CustomDatePicker from "./DatePicker";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  validateUser,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  isDateOfBirth,
} from "../utils/validations";
import {
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaShippingFast,
  FaTrashAlt,
  FaUser,
} from "react-icons/fa";
import { MdBookmarkAdded } from "react-icons/md";
import { useSelector } from "react-redux";
import { FaDeleteLeft, FaEnvelopeCircleCheck, FaPhone } from "react-icons/fa6";
import uploadFilesWithProgress from "@/utils/fileUpload";
import deleteConfirm from "@/utils/deleteConfirm";


const AddUserForm = ({ editMode = false, userData, isUserProfile = false }) => {
  const id = userData?._id
  const router = useRouter();
  const [addUser, { isLoading }] = useRegisterWithRefMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [sameAsAddress, setSameAsAddress] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactType, setContactType] = useState("email");

  const userInfo = useSelector(selectUserInfo);
  const userRole = userInfo?.role;

  const defaultFormData = {
    role: "customer",
    ref_userID: "",
    isBlocked: false,
    isVerified: false,
    editBy: "",
    img: null,
    cus_firstName: "",
    cus_lastName: "",
    cus_dob: "",
    gender: "",
    cus_phone: "",
    cus_email: "",
    password: "",
    cus_country: "Bangladesh",
    cus_division: "",
    cus_district: "",
    cus_police_station: "",
    cus_union_ward: "",
    cus_village: "",
    ship_country: "Bangladesh",
    ship_division: "",
    ship_district: "",
    ship_police_station: "",
    ship_union_ward: "",
    ship_village: "",
    ship_phone: "",
  };
  const [formData, setFormData] = useState(defaultFormData);
  const refUserData = userData?.ref_userId;
  const editedByUserData = userData?.editBy;
  useEffect(() => {
    if (editMode && userData) {
      
      setFormData((prev) => {
        const newData = {
          ...prev,
          ...defaultFormData,
          ...userData,
          password: "", 
        };
        
        // Make sure isBlocked is explicitly a boolean
        if (userData.isBlocked !== undefined) {
          newData.isBlocked = Boolean(userData.isBlocked);
        }
        return newData;
      });
    }
  }, [editMode, userData]);

  // Only show form after userData is loaded in editMode
  if (editMode && !userData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Hide password fields in edit mode
  const showPasswordFields = !editMode;

  const validateField = (name, value) => {
    if (editMode && (name === "password" || name === "confirmPassword")) {
      return null; // skip password validation in edit mode
    }
    let error = null;

    switch (name) {
      case "cus_firstName":
        error = validateUser.fullName(value);
        break;
      case "cus_dob":
        // Always validate as string
        if (value instanceof Date && !isNaN(value.getTime())) {
          const day = value.getDate().toString().padStart(2, '0');
          const month = (value.getMonth() + 1).toString().padStart(2, '0');
          const year = value.getFullYear();
          error = isDateOfBirth(`${day}/${month}/${year}`);
        } else {
          error = isDateOfBirth(typeof value === 'string' ? value.trim() : '');
        }
        break;
      case "cus_email":
        error = isValidEmail(value);
        break;
      case "cus_phone":
        error = isValidPhone(value);
        break;
      case "password":
        error = isStrongPassword(value);
        break;
      case "cus_union_ward":
      case "cus_village":
      case "ship_union_ward":
      case "ship_village":
        error = validateUser.fullName(value);
        break;
      case "ship_phone":
        error = value ? isValidPhone(value) : null;
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update the form data
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // If sameAsAddress is true and we're updating a customer address field,
      // update the corresponding shipping field
      if (sameAsAddress && name.startsWith('cus_')) {
        const shippingField = name.replace('cus_', 'ship_');
        newData[shippingField] = value;
      }

      return newData;
    });

    // Validate field on change
    const error = validateField(name, value);

    // Clear validation error if the field is valid
    if (!error) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    // Update contactType based on email/phone input
    if (name === "cus_email" && value) {
      setContactType("email");
    } else if (name === "cus_phone" && value) {
      setContactType("phone");
    }
  };

  const handleAddressLocationChange = ({
    divisionName,
    districtName,
    policeStationName,
  }) => {
    setFormData((prev) => ({
      ...prev,
      cus_division: divisionName || prev.cus_division,
      cus_district: districtName || prev.cus_district,
      cus_police_station: policeStationName || prev.cus_police_station,
    }));

    if (sameAsAddress) {
      setFormData((prev) => ({
        ...prev,
        ship_division: divisionName || prev.ship_division,
        ship_district: districtName || prev.ship_district,
        ship_police_station: policeStationName || prev.ship_police_station,
      }));
    }
  };

  const handleShippingLocationChange = ({
    divisionName,
    districtName,
    policeStationName,
  }) => {
    setFormData((prev) => ({
      ...prev,
      ship_division: divisionName || prev.ship_division,
      ship_district: districtName || prev.ship_district,
      ship_police_station: policeStationName || prev.ship_police_station,
    }));
  };

  const handleSameAsAddressChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsAddress(isChecked);

    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        ship_country: prev.cus_country,
        ship_division: prev.cus_division,
        ship_district: prev.cus_district,
        ship_police_station: prev.cus_police_station,
        ship_union_ward: prev.cus_union_ward,
        ship_village: prev.cus_village,
        ship_phone: prev.cus_phone,
      }));
    }
  };

  useEffect(() => {
    if (sameAsAddress) {
      setFormData((prev) => ({
        ...prev,
        ship_country: prev.cus_country,
        ship_division: prev.cus_division,
        ship_district: prev.cus_district,
        ship_police_station: prev.cus_police_station,
        ship_union_ward: prev.cus_union_ward,
        ship_village: prev.cus_village,
        ship_phone: prev.cus_phone,
      }));
    }
  }, [
    sameAsAddress,
    formData.cus_division,
    formData.cus_district,
    formData.cus_police_station,
  ]);


  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate password
    const error = validateField(name, value);

    // Clear validation error if the field is valid
    if (!error) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    // Validate confirm password if it exists
    if (confirmPassword) {
      if (value !== confirmPassword) {
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword: null,
        }));
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== formData.password) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "cus_firstName",
      "cus_dob",
      "gender",
      "cus_phone",
      "cus_email",
      "cus_division",
      "cus_district",
      "cus_police_station",
      "cus_village",
    ];
    if (!editMode) requiredFields.push("password");

    function formatDateToDDMMYYYY(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return dateString; // invalid হলে 그대로 ফেরত দাও
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
      } else {
        if (field === "cus_dob") {
      let dob = formData[field];

      // ✅ যদি ISO date (2001-01-09T18:00:00.000Z) আসে → DD/MM/YYYY তে convert করো
      if (/^\d{4}-\d{2}-\d{2}T/.test(dob)) {
        dob = formatDateToDDMMYYYY(dob);
        formData[field] = dob; // 👈 formData আপডেট করে রাখলাম
      }

      // ✅ এখন regex দিয়ে চেক করো (DD/MM/YYYY বা D/M/YYYY)
      if (/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.test(dob)) {
        const error = validateField(field, dob);
        if (error) {
          errors[field] = error;
        }
      } else {
        errors[field] = "Invalid date format (DD/MM/YYYY)";
      }
        } else {
          const error = validateField(field, formData[field]);
          if (error) {
            errors[field] = error;
          }
        }
      }
    });

    // Validate shipping fields if not same as address
    if (!sameAsAddress) {
      const shippingFields = [
        "ship_division",
        "ship_district",
        "ship_police_station",
        "ship_village",
      ];

      shippingFields.forEach((field) => {
        if (!formData[field]) {
          errors[field] = "This field is required";
        } else {
          const error = validateField(field, formData[field]);
          if (error) {
            errors[field] = error;
          }
        }
      });

      if (formData.ship_phone) {
        const error = validateField("ship_phone", formData.ship_phone);
        if (error) {
          errors.ship_phone = error;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
  // If a new image file is selected, create a preview URL
  const [previewUrl, setPreviewUrl] = useState("");

    const handleImageChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      img: file,
    }));
  };

    useEffect(() => {
    if (formData.img && typeof formData.img === "object") {
      const url = URL.createObjectURL(formData.img);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [formData.img]);

  const profileImage = previewUrl || (userData?.img?.trim() ? imageUrl + userData.img : "");


  const handleSubmit = async (e) => {

  e.preventDefault();
  if (!validateForm()) {
    toast.error("Please fix the validation errors before submitting");
    return;
  }

  try {
    // Handle profile image upload if it's a new file
    let img = null;
    if (formData.img instanceof File) {
      const uploadResult = await uploadFilesWithProgress([formData.img], {
        maxFiles: 1,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        onProgress: (progress) => {
          // You could add a progress indicator here if needed
        },
        onError: (error) => {
          toast.error(`Failed to upload profile image: ${error}`);
          throw new Error(error);
        }
      });
      img = uploadResult?.[0]?.filename;
    }

    let response;
    let submitData = { ...formData, 
      img: img || formData.img,
    };
    // Avoid sending empty password during update
    if (editMode && !submitData.password) {
      delete submitData.password;
    }

    if (editMode) {
      response = await updateUser({ id, data: submitData }).unwrap();
    } else {
      delete submitData.editBy; 
      response = await addUser(submitData).unwrap();
    }

    if (response.status === true) {
  toast.success(editMode ? "User updated successfully!" : "User added successfully!");

  if (!editMode) {
    router.push(`/dashboard/${userRole}/users`);
  }
    } else {
      toast.error(response.message || (editMode ? "Failed to update user" : "Failed to add user"));
    }
  } catch (err) {
    toast.error(err.data?.message || (editMode ? "Failed to update user" : "Failed to add user"));
    console.error(editMode ? "Failed to update user:" : "Failed to add user:", err);
  }
};

function toCamelCase(str) {
  if (!str) return "";
  return str
    .split(/[_\s]+/) // split by underscore or space
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

  return (
    <div className="grid gap-6 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
        {/* Image Uploader Section */}
        <div className="mb-6">
          <ImageUpload
            label="Profile Image"
            accept="image/*"
            name="img"
            onChange={handleImageChange}
            className=""
            required={false}
            height={200}
            width={200}
            rounded={"full"}
            imageIconSize={"24"}
            defaultImage={profileImage || ""}
            edit={editMode}
          />
          {validationErrors.img && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.img}</p>
          )}
        </div>
        <h2 className="text-2xl font-bold mb-6 dark:text-white text-center md:text-left flex flex-col items-center md:flex-row md:items-start">
          <FaUser className="text-primary mb-1 md:mb-0 md:mr-1" />
          <span>Personal Information</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomInput
            label="First Name"
            type="text"
            name="cus_firstName"
            placeholder="First Name"
            required
            value={formData.cus_firstName}
            onChange={handleInputChange}
            error={validationErrors.cus_firstName}
          />
          <CustomInput
            label="Last Name"
            type="text"
            name="cus_lastName"
            placeholder="Last Name"
            value={formData.cus_lastName}
            onChange={handleInputChange}
            error={validationErrors.cus_lastName}
          />
          <div>
            <CustomDatePicker
              label="Date of Birth"
              name="cus_dob"
              formData={formData}
              errors={validationErrors.cus_dob}
              setFormData={setFormData}
              minDate={
                new Date(new Date().setFullYear(new Date().getFullYear() - 50))
              }
              maxDate={
                new Date(new Date().setFullYear(new Date().getFullYear() - 16))
              }
              required={true}
              className="mb-2 w-full"
              onChange={(value) => {
                // Validate the date immediately when it changes
                const error = validateField("cus_dob", value);
                setValidationErrors((prev) => ({
                  ...prev,
                  cus_dob: error,
                }));
              }}
            />
          </div>
          <CustomSelect
            label="Gender"
            options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]}
            selected={formData.gender}
            setSelected={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
            required
            placeholder="Select gender..."
            error={validationErrors.gender}
          />
          <CustomInput
            label="Phone"
            type="tel"
            name="cus_phone"
            required
            placeholder="Phone Number"
            value={formData.cus_phone}
            onChange={handleInputChange}
            error={validationErrors.cus_phone}
          />
          <CustomInput
            label="Email"
            type="email"
            name="cus_email"
            required
            placeholder="Email"
            value={formData.cus_email}
            onChange={handleInputChange}
            error={validationErrors.cus_email}
            disabled={editMode}
            className={editMode ? "opacity-60 cursor-not-allowed" : ""}
          />
          {showPasswordFields && (
            <>
              <div className="relative">
                <CustomInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  error={validationErrors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 top-6 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative">
                <CustomInput
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={validationErrors.confirmPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 top-6 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </>
          )}
        </div>
        {editMode && (
          <div className="w-full max-w-4xl mx-auto mt-6">
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-background text-text px-4 py-2 rounded-lg "
                disabled={isLoading || isUpdating}
              >
                {isLoading || isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 dark:text-white text-center md:text-left flex flex-col items-center md:flex-row md:items-start">
          <FaMapMarkerAlt className="text-primary mb-1 md:mb-0 md:mr-1" /> Address Information
        </h2>
        <ModernLocationSelector
          initialDivisionName={formData.cus_division}
          initialDistrictName={formData.cus_district}
          initialPoliceStationName={formData.cus_police_station}
          onChange={handleAddressLocationChange}
          required={true}
          className="mb-6"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomInput
            label="Union/Ward/Sector"
            type="text"
            name="cus_union_ward"
            value={formData.cus_union_ward}
            onChange={handleInputChange}
            error={validationErrors.cus_union_ward}
          />
          <CustomInput
            label="Village/Road/House"
            type="text"
            name="cus_village"
            required
            value={formData.cus_village}
            onChange={handleInputChange}
            error={validationErrors.cus_village}
          />
        </div>
        {editMode && (
          <div className="w-full max-w-4xl mx-auto mt-6">
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-background text-text px-4 py-2 rounded-lg "
                disabled={isLoading || isUpdating}
              >
                {isLoading || isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
        <div className="mb-6">
          {/* Heading and Switch Wrapper */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Title */}
            <h2 className="text-2xl font-bold dark:text-white text-center md:text-left flex flex-col items-center md:flex-row md:items-start">
              <FaShippingFast className="text-primary mb-1 md:mb-0 md:mr-1" />
              <span>Shipping Information</span>
            </h2>

            {/* Switch: hidden on small, shown on md+ */}
            <div className="hidden md:flex mt-4 md:mt-0">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsAddress}
                  onChange={handleSameAsAddressChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Same as Address
                </span>
              </label>
            </div>
          </div>

          {/* Mobile-only switch */}
          <div className="flex justify-center mt-4 md:hidden">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sameAsAddress}
                onChange={handleSameAsAddressChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Same as Address
              </span>
            </label>
          </div>
        </div>

        <ModernLocationSelector
          onChange={handleShippingLocationChange}
          required={true}
          className="mb-6"
          initialDivisionName={formData.ship_division}
          initialDistrictName={formData.ship_district}
          initialPoliceStationName={formData.ship_police_station}
          disabled={sameAsAddress}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomInput
            label="Union/Ward/Sector"
            type="text"
            name="ship_union_ward"
            value={formData.ship_union_ward}
            onChange={handleInputChange}
            error={validationErrors.ship_union_ward}
            disabled={sameAsAddress}
            className={sameAsAddress ? "opacity-50 cursor-not-allowed" : ""}
          />
          <CustomInput
            label="Village/Road/House"
            type="text"
            name="ship_village"
            required
            value={formData.ship_village}
            onChange={handleInputChange}
            error={validationErrors.ship_village}
            disabled={sameAsAddress}
            className={sameAsAddress ? "opacity-50 cursor-not-allowed" : ""}
          />
          <CustomInput
            label="Shipping Phone"
            type="tel"
            name="ship_phone"
            value={formData.ship_phone}
            onChange={handleInputChange}
            error={validationErrors.ship_phone}
            disabled={sameAsAddress}
            className={sameAsAddress ? "opacity-50 cursor-not-allowed" : ""}
          />
        </div>
        {editMode && (
          <div className="w-full max-w-4xl mx-auto mt-6">
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-background text-text px-4 py-2 rounded-lg "
                disabled={isLoading || isUpdating}
              >
                {isLoading || isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        )}
      </div>

      {editMode && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-6">
                <h2 className="text-2xl font-bold mb-6 dark:text-white text-center md:text-left flex flex-col items-center md:flex-row md:items-start">
                <FaCheckCircle className="text-primary mb-1 md:mb-0 md:mr-1" />
                <span>Additional Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <CustomSelect
                  label="Role"
                  options={[{ value: "customer", label: "Customer" }, { value: "admin", label: "Admin" }, { value: "manager", label: "Manager" }, { value: "seller", label: "Seller" }]}
                  selected={formData.role}
                  setSelected={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  placeholder="Select role..."
                  disabled={isUserProfile === true && editMode}
                  className={isUserProfile === true && editMode ? "opacity-60 cursor-not-allowed" : ""}
                  />
                </div>
                <div>
                  <CustomSelect
                  label="Is Verified"
                  options={[{ value: true, label: "Verified" }, { value: false, label: "Not Verified" }]}
                  selected={formData.isVerified}
                  setSelected={(value) => setFormData((prev) => ({ ...prev, isVerified: value }))}
                  placeholder="Select verification status..."
                  disabled={isUserProfile === true && editMode}
                  className={isUserProfile === true && editMode ? "opacity-60 cursor-not-allowed" : ""}
                  />
                </div>
                 <div>
                  <CustomSelect
                  label="Is Blocked"
                  options={[
                    { value: false, label: "Active" },
                    { value: true, label: "Blocked" },
                  ]}
                  selected={formData.isBlocked}
                  setSelected={(value) => setFormData((prev) => ({ ...prev, isBlocked: value }))}
                  placeholder="Select status..."
                  disabled={isUserProfile === true && editMode}
                  className={isUserProfile === true && editMode ? "opacity-60 cursor-not-allowed" : ""}
                  />
                </div>
                </div>

                {editMode && isUserProfile !== true && (
                <div className="w-full max-w-4xl mx-auto mt-6">
                  <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    className="bg-background text-text px-4 py-2 rounded-lg "
                    disabled={isLoading || isUpdating}
                  >
                    {isLoading || isUpdating ? "Updating..." : "Update"}
                  </button>
                  </div>
                </div>
                )}
                
                <div className="grid gris-cols-1 md:grid-cols-2 gap-6 mt-6">
                {refUserData && (
                  <div className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg dark:bg-gray-700 dark:text-white">
                  <h1 className="text-center text-xl"><MdBookmarkAdded className="inline mr-1 text-primary"/>Added by</h1>
                   <p className="text-center text-md bg-background text-text p-2 mt-2"><FaUser className="inline mr-2 text-primary"/>{refUserData.cus_firstName} {refUserData.cus_lastName}
                  <br/>
                  <span className="text-center text-xs">{toCamelCase(refUserData.role)}</span>
                  </p>
                  <p className="text-center text-sm py-2"><FaEnvelopeCircleCheck className="inline mr-2 text-primary"/>{refUserData.cus_email}</p>
                  <p className="text-center text-sm"><FaPhone className="inline mr-2 text-primary"/>{refUserData.cus_phone}</p>
                  </div>
                )}

                {editedByUserData && isUserProfile !== true && (
                  <div className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg dark:bg-gray-700 dark:text-white">
                  <h1 className="text-center text-xl"><MdBookmarkAdded className="inline mr-1 text-primary"/>Edited by</h1>
                  <p className="text-center text-md bg-background text-text p-2 mt-2"><FaUser className="inline mr-2 text-primary"/>{editedByUserData.cus_firstName} {editedByUserData.cus_lastName}
                  <br/>
                  <span className="text-center text-xs">{toCamelCase(editedByUserData.role)}</span>
                  </p>
                  <p className="text-center text-sm py-2"><FaEnvelopeCircleCheck className="inline mr-2 text-primary"/>{editedByUserData.cus_email}</p>
                  <p className="text-center text-sm"><FaPhone className="inline mr-2 text-primary"/>{editedByUserData.cus_phone}</p>
                  </div>
                )}
                </div>
              </div>
              )}

      {!editMode && (
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-background text-text px-4 py-2 rounded-lg"
              disabled={isLoading || isUpdating}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {editMode && userRole === 'admin' && isUserProfile !== true && (
        <div className="w-full max-w-4xl mx-auto mt-8 border-t pt-8">
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Once you delete a user, there is no going back. Please be certain.
            </p>
            <button
              onClick={async () => {
                const isConfirmed = await deleteConfirm({
                  title: 'Delete User?',
                  text: `Are you sure you want to delete ${formData.cus_firstName} ${formData.cus_lastName}? This action cannot be undone.`,
                  confirmButtonText: 'Yes, delete user',
                  cancelButtonText: 'No, keep user'
                });
                
                if (isConfirmed) {
                  try {
                    const result = await deleteUser(id).unwrap();
                    if (result.status === true) {
                      toast.success('User deleted successfully');
                      router.push(`/dashboard/${userRole}/users`);
                    } else {
                      toast.error(result.message || 'Failed to delete user');
                    }
                  } catch (err) {
                    toast.error(err.data?.message || 'Failed to delete user');
                    console.error('Failed to delete user:', err);
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <FaTrashAlt className="h-5 w-5 text-white" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrashAlt className="h-5 w-5 text-white" />
                  <span>Delete User</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUserForm;