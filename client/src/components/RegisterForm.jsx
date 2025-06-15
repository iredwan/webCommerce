import React, { useState, useEffect } from "react";
import { useRegisterMutation } from "../features/user/userApiSlice";
import {
  useSendOTPMutation,
  useVerifyOTPMutation,
} from "../features/userOTP/userOTPApiSlice";
import ModernLocationSelector from "../components/LocationSelector";
import CustomDatePicker from "../components/DatePicker";
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
  FaUser,
} from "react-icons/fa";

const RegisterForm = () => {
  const router = useRouter();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [sendOTP, { isLoading: sendOTPLoading }] = useSendOTPMutation();
  const [verifyOTP, { isLoading: verifyOTPLoading }] = useVerifyOTPMutation();

  const [step, setStep] = useState(1);
  const [sameAsAddress, setSameAsAddress] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    cus_firstName: "",
    cus_lastName: "",
    cus_dob: "",
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
  });

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "cus_firstName":
      case "cus_lastName":
        error = validateUser.fullName(value);
        break;
      case "cus_dob":
        error = isDateOfBirth(value);
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
  };

  // Add a new handler for date changes
  const handleDateChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate date on change
    const error = validateField(name, value);

    // Clear validation error if the date is valid
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
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);

    let type = "";

    // Clear validation errors if input is empty
    if (!value.trim()) {
      setValidationErrors((prev) => ({ ...prev, contact: null }));
      setContactType("");
      return;
    }

    // Only detect type if there's a value
    if (value.trim() !== "") {
      // Check if input contains any letters (characters)
      if (/[a-zA-Z]/.test(value)) {
        // If contains letters, check if it's a valid email format
        if (value.includes("@") && value.includes(".")) {
          type = "email";
          // Clear validation error if email format is valid
          setValidationErrors((prev) => ({ ...prev, contact: null }));
        } else {
          type = "email"; // Still treat as email but will show format error on validation
        }
      }
      // Check if input contains only numbers and + (phone)
      else if (/^[0-9+]+$/.test(value)) {
        type = "phone";
        // Clear validation error if phone format is valid
        setValidationErrors((prev) => ({ ...prev, contact: null }));
      }
      // If it contains special characters but no letters
      else {
        type = "phone";
      }
    }

    setContactType(type);
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

  // Add a new effect to handle shipping address updates
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
      "cus_lastName",
      "cus_dob",
      "cus_phone",
      "cus_email",
      "password",
      "cus_division",
      "cus_district",
      "cus_police_station",
      "cus_village",
    ];

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
      } else {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
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

  const handleSendOTP = async () => {
    try {
      setVerificationError("");

      // Validate contact before sending OTP
      if (!contact) {
        setVerificationError("Please enter your email or phone number");
        setValidationErrors((prev) => ({
          ...prev,
          contact: "Please enter your email or phone number",
        }));
        return;
      }

      let error = null;

      // First check if input contains letters
      if (/[a-zA-Z]/.test(contact)) {
        // If contains letters, check email format
        if (!contact.includes("@") || !contact.includes(".")) {
          error = "Please enter a valid email address";
        } else {
          // If format is correct, validate as email
          error = isValidEmail(contact);
        }
        if (error) {
          setValidationErrors((prev) => ({ ...prev, contact: error }));
          toast.error(error);
          return;
        }
      } else {
        // If no letters, validate as phone
        error = isValidPhone(contact);
        if (error) {
          setValidationErrors((prev) => ({ ...prev, contact: error }));
          toast.error(error);
          return;
        }
      }

      // Clear any existing validation errors if we get here
      setValidationErrors((prev) => ({ ...prev, contact: null }));

      const response = await sendOTP(contact).unwrap();
      if (response.status === true) {
        toast.success(response.message);
        setOtpSent(true);
        // Pre-fill the contact information in formData
        if (contactType === "email") {
          setFormData((prev) => ({ ...prev, cus_email: contact }));
        } else if (contactType === "phone") {
          setFormData((prev) => ({ ...prev, cus_phone: contact }));
        }
        setStep(2);
      } else if (response.status === false) {
        toast.error(response.message);
      }
    } catch (err) {
      setVerificationError("Failed to send OTP. Please try again.");
      console.error("Failed to send OTP:", err);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setVerificationError("");
      const response = await verifyOTP({ contact, otp }).unwrap();
      if (response.status === true) {
        toast.success(response.message);
        setStep(3);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      setVerificationError("Invalid OTP. Please try again.");
      console.error("Failed to verify OTP:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      await handleSendOTP();
    } else if (step === 2) {
      await handleVerifyOTP();
    } else {
      if (!validateForm()) {
        toast.error("Please fix the validation errors before submitting");
        return;
      }
      try {
        const response = await register(formData).unwrap();
        if (response.status === true) {
          toast.success("Registration successful!");
          router.push("/login");
        } else {
          toast.error(response.message || "Registration failed");
        }
      } catch (err) {
        toast.error(err.data?.message || "Registration failed");
        console.error("Failed to register:", err);
      }
    }
  };

  const renderStep1 = () => (
      <div className=" bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl text-center font-bold mb-6 dark:text-white">
          Contact Verification
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter Email or Phone Number
            </label>
            <input
              type="text"
              value={contact}
              onChange={handleContactChange}
              className={`w-full px-4 py-2.5 border ${
                validationErrors.contact ? "border-red-500" : "border-neutral-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
              placeholder="Enter email or phone number"
              required
            />
            {validationErrors.contact && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.contact}
              </p>
            )}
            {contactType && !validationErrors.contact && (
              <p className="mt-1 text-sm text-gray-500">
                Detected as:{" "}
                {contactType === "email" ? "Email Address" : "Phone Number"}
              </p>
            )}
          </div>
        </div>
      </div>
  );
  

  const renderStep2 = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl">
      <h2 className="text-2xl text-center font-bold mb-6 dark:text-white">
        OTP Verification
      </h2>
      <div className="space-y-6">
        <p className="text-gray-600 text-center dark:text-gray-400">
          Please enter the OTP sent to: {contact}
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Enter OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            placeholder="Enter OTP"
            maxLength={6}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={sendOTPLoading}
            className="text-text text-sm bg-background px-4 py-2 rounded-lg"
          >
            Resend OTP
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-text text-sm bg-background px-4 py-2 rounded-lg"
          >
            Change Contact
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 dark:text-white text-center md:text-left flex flex-col items-center md:flex-row md:items-start">
          <FaUser className="text-primary mb-1 md:mb-0 md:mr-1" />
          <span>Personal Information</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="cus_firstName"
              placeholder="First Name"
              required
              value={formData.cus_firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border ${
                validationErrors.cus_firstName
                  ? "border-red-500"
                  : "border-neutral-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
            />
            {validationErrors.cus_firstName && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.cus_firstName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="cus_lastName"
              placeholder="Last Name"
              value={formData.cus_lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border ${
                validationErrors.cus_lastName
                  ? "border-red-500"
                  : "border-neutral-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
            />
            {validationErrors.cus_lastName && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.cus_lastName}
              </p>
            )}
          </div>
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
              placeholder="DD/MM/YYYY"
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
          {contactType === "email" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="cus_phone"
                required
                placeholder="Phone Number"
                value={formData.cus_phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  validationErrors.cus_phone
                    ? "border-red-500"
                    : "border-neutral-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
              />
              {validationErrors.cus_phone && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.cus_phone}
                </p>
              )}
            </div>
          )}
          {contactType === "phone" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="cus_email"
                required
                placeholder="Email"
                value={formData.cus_email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  validationErrors.cus_email
                    ? "border-red-500"
                    : "border-neutral-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
              />
              {validationErrors.cus_email && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.cus_email}
                </p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2.5 pr-10 border ${
                  validationErrors.password
                    ? "border-red-500"
                    : "border-neutral-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.password}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-4 py-2.5 pr-10 border ${
                  validationErrors.confirmPassword
                    ? "border-red-500"
                    : "border-neutral-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 dark:text-white text-center md:text-left flex flex-col items-center md:flex-row md:items-start">
          <FaMapMarkerAlt className="text-primary mb-1 md:mb-0 md:mr-1" />{" "}
          Address Information
        </h2>
        <ModernLocationSelector
          onChange={handleAddressLocationChange}
          required={true}
          className="mb-6"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Union/Ward/Sector
            </label>
            <input
              type="text"
              name="cus_union_ward"
              value={formData.cus_union_ward}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border ${
                validationErrors.cus_union_ward
                  ? "border-red-500"
                  : "border-neutral-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
            />
            {validationErrors.cus_union_ward && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.cus_union_ward}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Village/Road/House
            </label>
            <input
              type="text"
              name="cus_village"
              required
              value={formData.cus_village}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border ${
                validationErrors.cus_village
                  ? "border-red-500"
                  : "border-neutral-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white`}
            />
            {validationErrors.cus_village && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.cus_village}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Union/Ward/Sector
            </label>
            <input
              type="text"
              name="ship_union_ward"
              value={formData.ship_union_ward}
              onChange={handleInputChange}
              disabled={sameAsAddress}
              className={`w-full px-4 py-2.5 border ${
                validationErrors.ship_union_ward
                  ? "border-red-500"
                  : "border-neutral-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                sameAsAddress ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {validationErrors.ship_union_ward && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.ship_union_ward}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Village/Road/House
            </label>
            <input
              type="text"
              name="ship_village"
              required
              value={formData.ship_village}
              onChange={handleInputChange}
              disabled={sameAsAddress}
              className={`w-full px-4 py-2.5 border ${
                validationErrors.ship_village
                  ? "border-red-500"
                  : "border-neutral-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                sameAsAddress ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {validationErrors.ship_village && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.ship_village}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shipping Phone
            </label>
            <input
              type="tel"
              name="ship_phone"
              value={formData.ship_phone}
              onChange={handleInputChange}
              disabled={sameAsAddress}
              className={`w-full px-4 py-2.5 border ${
                validationErrors.ship_phone
                  ? "border-red-500"
                  : "border-neutral-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                sameAsAddress ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {validationErrors.ship_phone && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.ship_phone}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen flex flex-col items-center justify-center"
    >
      {verificationError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{verificationError}</span>
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      <div className="w-full flex justify-end">
        <button
          type="submit"
          disabled={
            step === 2
              ? verifyOTPLoading
              : step === 1
              ? sendOTPLoading
              : registerLoading
          }
          className="text-text bg-background px-4 py-2 rounded-lg"
        >
          {step === 1 && (sendOTPLoading ? "Sending OTP..." : "Send OTP")}
          {step === 2 && (verifyOTPLoading ? "Verifying..." : "Verify OTP")}
          {step === 3 && (registerLoading ? "Registering..." : "Register")}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
