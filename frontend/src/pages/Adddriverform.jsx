import React, { useState, useCallback, useEffect } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  UserIcon,
  TruckIcon,
  PaperClipIcon,
  CalendarDaysIcon,
  CubeTransparentIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Placeholder FormInput component
const FormInput = ({
  type = "text",
  id,
  name,
  value,
  onChange,
  className,
  required,
  autoComplete,
  min,
  max,
  readOnly = false, // Added readOnly prop
}) => (
  <input
    type={type}
    id={id}
    name={name}
    value={value ?? ""} // Ensure value is never undefined
    onChange={onChange}
    className={className}
    required={required}
    autoComplete={autoComplete}
    min={min}
    max={max}
    readOnly={readOnly} // Apply readOnly prop
  />
);

// Placeholder FormSelect component
const FormSelect = ({
  id,
  name,
  value,
  onChange,
  className,
  required,
  children,
}) => (
  <select
    id={id}
    name={name}
    value={value ?? ""} // Ensure value is never undefined
    onChange={onChange}
    className={className}
    required={required}
  >
    {children}
  </select>
);

// Stepper component
const Stepper = ({ currentStep, totalSteps, stepNames, stepIcons }) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center justify-center space-x-5">
        {stepNames.map((name, index) => (
          <li key={name} className="relative">
            {index < currentStep ? (
              <div className="group flex items-center">
                <span className="flex h-9 items-center justify-center">
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 group-hover:bg-blue-800">
                    {React.createElement(stepIcons[index], {
                      className: "h-5 w-5 text-white",
                    })}
                  </span>
                </span>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {name}
                </span>
              </div>
            ) : index === currentStep ? (
              <div className="flex items-center" aria-current="step">
                <span
                  className="flex h-9 items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                    {React.createElement(stepIcons[index], {
                      className: "h-5 w-5 text-blue-600",
                    })}
                  </span>
                </span>
                <span className="ml-3 text-sm font-medium text-blue-600">
                  {name}
                </span>
              </div>
            ) : (
              <div className="group flex items-center">
                <span
                  className="flex h-9 items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                    {React.createElement(stepIcons[index], {
                      className:
                        "h-5 w-5 text-gray-400 group-hover:text-gray-900",
                    })}
                  </span>
                </span>
                <span className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                  {name}
                </span>
              </div>
            )}
            {index !== totalSteps - 1 && (
              <div className="absolute top-4 left-full w-5 h-0.5 bg-gray-300 transform -translate-x-1/2 -translate-y-1/2" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Custom Alert/Message Box Component
const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const icon =
    type === "success" ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
    );

  return (
    <div
      className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4`}
    >
      <div
        className={`${bgColor} ${textColor} p-6 rounded-lg shadow-xl max-w-sm w-full border border-gray-200`}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <p className="font-medium text-lg">{message}</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoized InputField component to prevent re-rendering
const MemoizedInputField = React.memo(({ id, label, type = "text", required = true, formData, handleChange, errors }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <FormInput
      type={type}
      id={id}
      name={id}
      value={formData[id] ?? ""}
      onChange={handleChange}
      className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
        errors[id] ? "border-red-500" : "border-gray-300"
      }`}
      required={required}
      aria-describedby={errors[id] ? `${id}-error` : undefined}
    />
    {errors[id] && (
      <p
        id={`${id}-error`}
        className="text-sm text-red-600 mt-1"
        role="alert"
      >
        {errors[id]}
      </p>
    )}
  </div>
));

MemoizedInputField.displayName = 'MemoizedInputField';

// Step 1: Personal Details (NewDriverForm)
const Step1NewDriverPersonal = ({
  formData,
  handleChange,
  handleNext,
  errors,
  dropdownOptions = { countries: [], cities: {}, vehicle_types: [] },
  loading = false,
}) => {

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MemoizedInputField
          id="fullName"
          label="Full Name"
          type="text"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
        <MemoizedInputField
          id="emp_Id"
          label="Employee ID"
          type="text"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <FormSelect
            id="gender"
            name="gender"
            value={formData.gender ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={errors.gender ? `gender-error` : undefined}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </FormSelect>
          {errors.gender && (
            <p
              id="gender-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.gender}
            </p>
          )}
        </div>
        <MemoizedInputField
          id="dob"
          label="Date of Birth"
          type="date"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />

        {/* Nationality Dropdown */}
        <div>
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
            Nationality
          </label>
          <FormSelect
            id="nationality"
            name="nationality"
            value={formData.nationality ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.nationality ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">Select Nationality</option>
            {dropdownOptions.countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </FormSelect>
          {errors.nationality && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {errors.nationality}
            </p>
          )}
        </div>

        {/* City Dropdown */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <FormSelect
            id="city"
            name="city"
            value={formData.city ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">Select City</option>
            {(dropdownOptions.cities.Kuwait || []).map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </FormSelect>
          {errors.city && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {errors.city}
            </p>
          )}
        </div>
        <MemoizedInputField
          id="apartmentArea"
          label="Apartment/Area"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
        <MemoizedInputField
          id="phoneNumber"
          label="Phone Number"
          type="tel"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
        <MemoizedInputField
          id="age"
          label="Age"
          type="number"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
        <div>
          <label
            htmlFor="maritalStatus"
            className="block text-sm font-medium text-gray-700"
          >
            Marital Status
          </label>
          <FormSelect
            id="maritalStatus"
            name="maritalStatus"
            value={formData.maritalStatus ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.maritalStatus ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.maritalStatus ? `maritalStatus-error` : undefined
            }
          >
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </FormSelect>
          {errors.maritalStatus && (
            <p
              id="maritalStatus-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.maritalStatus}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="bloodGroup"
            className="block text-sm font-medium text-gray-700"
          >
            Blood Group
          </label>
          <FormSelect
            id="bloodGroup"
            name="bloodGroup"
            value={formData.bloodGroup ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.bloodGroup ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.bloodGroup ? `bloodGroup-error` : undefined
            }
          >
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </FormSelect>
          {errors.bloodGroup && (
            <p
              id="bloodGroup-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.bloodGroup}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="homeCountryAddress"
          className="block text-sm font-medium text-gray-700"
        >
          Home Country Address
        </label>
        <textarea
          id="homeCountryAddress"
          name="homeCountryAddress"
          value={formData.homeCountryAddress ?? ""}
          onChange={handleChange}
          rows="3"
          className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.homeCountryAddress ? "border-red-500" : "border-gray-300"
          }`}
          required
          aria-describedby={
            errors.homeCountryAddress ? `homeCountryAddress-error` : undefined
          }
        ></textarea>
        {errors.homeCountryAddress && (
          <p
            id="homeCountryAddress-error"
            className="text-sm text-red-600 mt-1"
            role="alert"
          >
            {errors.homeCountryAddress}
          </p>
        )}
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Nominee Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MemoizedInputField
            id="nomineeWife"
            label="Nominee (Wife, Father, Mother, etc.)"
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
          <MemoizedInputField
            id="nomineePhone"
            label="Nominee Phone Number"
            type="tel"
            required={false}
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          Next <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </>
  );
};

// Step 2: Vehicle & Other Details (NewDriverForm)
const Step2NewDriverVehicle = ({
  formData,
  handleChange,
  handleNext,
  handlePrevious,
  errors,
  companies = [],
  dropdownOptions = { countries: [], cities: {}, vehicle_types: [] },
  selectedCompanyCommissionRules = null, // Re-added this prop
  loading = false,
}) => {
  const currentVehicleType = formData.vehicleType;
  const commissionTypeFieldName = `${currentVehicleType}CommissionType`;

  // Determine the commission type to display based on fetched rules
  const displayedCommissionType = selectedCompanyCommissionRules?.[currentVehicleType]?.commission_type || '';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Company Dropdown - Moved here */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <FormSelect
            id="company"
            name="company"
            value={formData.company ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.company ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.company_name}>
                {company.company_name}
              </option>
            ))}
          </FormSelect>
          {errors.company && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {errors.company}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vehicleType"
            className="block text-sm font-medium text-gray-700"
          >
            Vehicle Type
          </label>
          <FormSelect
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.vehicleType ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.vehicleType ? `vehicleType-error` : undefined
            }
          >
            <option value="">Select Vehicle Type</option>
            {dropdownOptions.vehicle_types.map((vehicleType) => (
              <option key={vehicleType.value} value={vehicleType.value}>
                {vehicleType.label}
              </option>
            ))}
          </FormSelect>
          {errors.vehicleType && (
            <p
              id="vehicleType-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.vehicleType}
            </p>
          )}
        </div>
        <MemoizedInputField
          id="vehicleDestination"
          label="Vehicle Destination"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
        <div>
          <label
            htmlFor="tShirtSize"
            className="block text-sm font-medium text-gray-700"
          >
            T-shirt Size
          </label>
          <FormSelect
            id="tShirtSize"
            name="tShirtSize"
            value={formData.tShirtSize ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.tShirtSize ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.tShirtSize ? `tShirtSize-error` : undefined
            }
          >
            <option value="">Select Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="XXXL">XXXL</option>
          </FormSelect>
          {errors.tShirtSize && (
            <p
              id="tShirtSize-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.tShirtSize}
            </p>
          )}
        </div>
        <MemoizedInputField
          id="weight"
          label="Weight (kg)"
          type="number"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
        <MemoizedInputField
          id="height"
          label="Height (cm)"
          type="number"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
        <MemoizedInputField
          id="kuwaitEntryDate"
          label="Kuwait Entry Date"
          type="date"
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />
      </div>

      {/* Commission Details Section */}
      {currentVehicleType && displayedCommissionType && (
        <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Commission Details ({currentVehicleType.toUpperCase()})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor={commissionTypeFieldName} className="block text-sm font-medium text-gray-700">
                Commission Type
              </label>
              <FormInput
                type="text"
                id={commissionTypeFieldName}
                name={commissionTypeFieldName}
                value={displayedCommissionType} // Display fetched value
                readOnly // Make it read-only
                className="mt-1 block w-full rounded-md border p-2 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
              />
            </div>

            {displayedCommissionType === "PER_KM" && (
              <>
                <MemoizedInputField
                  id={`${currentVehicleType}RatePerKm`}
                  label="Rate per KM"
                  type="number"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
                <MemoizedInputField
                  id={`${currentVehicleType}MinKm`}
                  label="Minimum KM"
                  type="number"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
              </>
            )}
            {displayedCommissionType === "PER_ORDER" && (
              <MemoizedInputField
                id={`${currentVehicleType}RatePerOrder`}
                label="Rate per Order"
                type="number"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}
            {displayedCommissionType === "FIXED" && (
              <MemoizedInputField
                id={`${currentVehicleType}FixedCommission`}
                label="Fixed Commission"
                type="number"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}
          </div>
        </div>
      )}
      {currentVehicleType && formData.company && !displayedCommissionType && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              No commission rules found for the selected vehicle type ({currentVehicleType}) and company ({formData.company}).
            </p>
          </div>
        )
      }


      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          Next <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </>
  );
};

// Step 3: Document Uploads (NewDriverForm)
const Step3NewDriverDocuments = ({
  formData,
  handleChange,
  handlePrevious,
  handleSubmit,
  errors,
  isSubmitting,
}) => {
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    handleChange({ target: { name, value: files[0] } });
  };

  const FileInput = ({ id, label, isRequired = true }) => (
    <div className="flex flex-col items-start p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-150 relative cursor-pointer">
      <input
        type="file"
        id={id}
        name={id}
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
        required={isRequired}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
      />
      <div className="flex items-center space-x-3">
        <ArrowUpTrayIcon className="h-6 w-6 text-blue-500" />
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      {formData[id]?.name ? (
        <span className="text-xs text-green-600 mt-2 flex items-center">
          <CheckCircleIcon className="h-4 w-4 mr-1" /> {formData[id].name}{" "}
          uploaded.
        </span>
      ) : (
        <span className="text-xs text-gray-500 mt-1 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-1" /> Upload file (PDF,
          JPG, PNG)
        </span>
      )}
      {errors[id] && (
        <p
          id={`${id}-error`}
          className="text-xs text-red-600 mt-1"
          role="alert"
        >
          {errors[id]}
        </p>
      )}
    </div>
  );

  const fileFields = [
    { id: "passport", label: "Passport" },
    { id: "visa", label: "Visa" },
    { id: "policeCer", label: "Police Clearance Certificate" },
    { id: "pasPhot", label: "Passport Photo" },
    { id: "medicalCer", label: "Medical Certificate" },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fileFields.map((file) => (
          <FileInput key={file.id} id={file.id} label={file.label} />
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <CheckCircleIcon className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </>
  );
};

// Main New Driver Form Component
const NewDriverForm = ({ onSubmit, onReset }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({
    countries: [],
    cities: {},
    vehicle_types: []
  });
  const [selectedCompanyCommissionRules, setSelectedCompanyCommissionRules] = useState(null); // Re-added state
  const [loading, setLoading] = useState(true);
  const [messageBox, setMessageBox] = useState(null); // State for message box
  const totalSteps = 3;

  // Fetch companies and dropdown options on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch companies with accessories
        const companiesResponse = await fetch('http://127.0.0.1:8000/companies-with-accessories/');
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData);
        } else {
            console.error('Failed to fetch companies:', companiesResponse.statusText);
            setMessageBox({ message: `Failed to load companies: ${companiesResponse.statusText}`, type: "error" });
        }

        // Fetch dropdown options
        const dropdownResponse = await fetch('http://127.0.0.1:8000/dropdown-options/');
        if (dropdownResponse.ok) {
          const dropdownData = await dropdownResponse.json();
          setDropdownOptions(dropdownData);
        } else {
            console.error('Failed to fetch dropdown options:', dropdownResponse.statusText);
            setMessageBox({ message: `Failed to load dropdown options: ${dropdownResponse.statusText}`, type: "error" });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessageBox({ message: `An error occurred while fetching initial data: ${error.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effect to update selected company's commission rules when company or vehicle type selection changes
  useEffect(() => {
    if (formData.company && formData.vehicleType) {
      const company = companies.find(c => c.company_name === formData.company);
      if (company) {
        // Construct commission rules object based on vehicle type
        const commissionRules = {
          car: {
            commission_type: company.car_commission_type,
            rate_per_km: company.car_rate_per_km,
            min_km: company.car_min_km,
            rate_per_order: company.car_rate_per_order,
            fixed_commission: company.car_fixed_commission,
          },
          bike: {
            commission_type: company.bike_commission_type,
            rate_per_km: company.bike_rate_per_km,
            min_km: company.bike_min_km,
            rate_per_order: company.bike_rate_per_order,
            fixed_commission: company.bike_fixed_commission,
          },
        };

        setSelectedCompanyCommissionRules(commissionRules);

        setFormData(prev => {
          const newFormData = { ...prev };
          const vehicleTypePrefix = prev.vehicleType;
          const vehicleTypeRules = commissionRules[vehicleTypePrefix];

          // Set the commission type from fetched rules, make it read-only for the user
          newFormData[`${vehicleTypePrefix}CommissionType`] = vehicleTypeRules?.commission_type || '';

          // Initialize other commission fields based on fetched values or 0 if not present
          newFormData[`${vehicleTypePrefix}RatePerKm`] = vehicleTypeRules?.rate_per_km || 0;
          newFormData[`${vehicleTypePrefix}MinKm`] = vehicleTypeRules?.min_km || 0;
          newFormData[`${vehicleTypePrefix}RatePerOrder`] = vehicleTypeRules?.rate_per_order || 0;
          newFormData[`${vehicleTypePrefix}FixedCommission`] = vehicleTypeRules?.fixed_commission || 0;

          return newFormData;
        });
      } else {
        setSelectedCompanyCommissionRules(null);
        // Clear all commission fields if no rules or no company selected
        setFormData(prev => ({
          ...prev,
          carCommissionType: '',
          carRatePerKm: 0,
          carMinKm: 0,
          carRatePerOrder: 0,
          carFixedCommission: 0,
          bikeCommissionType: '',
          bikeRatePerKm: 0,
          bikeMinKm: 0,
          bikeRatePerOrder: 0,
          bikeFixedCommission: 0,
        }));
      }
    } else {
      setSelectedCompanyCommissionRules(null);
      // Clear all commission fields if no company or vehicle type selected
      setFormData(prev => ({
        ...prev,
        carCommissionType: '',
        carRatePerKm: 0,
        carMinKm: 0,
        carRatePerOrder: 0,
        carFixedCommission: 0,
        bikeCommissionType: '',
        bikeRatePerKm: 0,
        bikeMinKm: 0,
        bikeRatePerOrder: 0,
        bikeFixedCommission: 0,
      }));
    }
  }, [formData.company, formData.vehicleType, companies]); // Added formData.vehicleType as a dependency

  const steps = [
    {
      name: "Personal Details",
      icon: UserIcon,
      component: Step1NewDriverPersonal,
      requiredFields: [
        "fullName",
        "emp_Id",
        "gender",
        "dob",
        "nationality",
        "city",
        "apartmentArea",
        "phoneNumber",
        "age",
        "maritalStatus",
        "bloodGroup",
        "homeCountryAddress",
        "nomineeWife",
      ],
    },
    {
      name: "Vehicle & Other Details",
      icon: TruckIcon,
      component: Step2NewDriverVehicle,
      requiredFields: [
        "company", // Moved company here
        "vehicleType",
        "vehicleDestination",
        "tShirtSize",
        "weight",
        "height",
        "kuwaitEntryDate",
      ],
      // Dynamic required fields for commission will be handled in validateStep
    },
    {
      name: "Document Uploads",
      icon: PaperClipIcon,
      component: Step3NewDriverDocuments,
      requiredFields: [
        "passport",
        "visa",
        "policeCer",
        "pasPhot",
        "medicalCer",
      ],
    },
  ];

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, files, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "file" ? files[0] : type === "checkbox" ? checked : value,
      }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  const validateStep = useCallback(
    (stepIndex) => {
      let currentErrors = {};
      let isValid = true;
      let requiredFieldsForStep = [...steps[stepIndex].requiredFields];

      // Add dynamic required fields for commission in Step 2
      if (stepIndex === 1 && formData.vehicleType) {
        const vehicleTypePrefix = formData.vehicleType; // 'car' or 'bike'
        // Commission type is now derived from selectedCompanyCommissionRules
        const commissionRule = selectedCompanyCommissionRules?.[vehicleTypePrefix];
        const commissionType = commissionRule?.commission_type; // Get the fetched commission type

        if (commissionType) {
          // The commission type field itself is now read-only and filled from fetched data,
          // so we only need to validate if the specific rate fields are present.
          if (commissionType === "PER_KM") {
            requiredFieldsForStep.push(`${vehicleTypePrefix}RatePerKm`);
            requiredFieldsForStep.push(`${vehicleTypePrefix}MinKm`);
          } else if (commissionType === "PER_ORDER") {
            requiredFieldsForStep.push(`${vehicleTypePrefix}RatePerOrder`);
          } else if (commissionType === "FIXED") {
            requiredFieldsForStep.push(`${vehicleTypePrefix}FixedCommission`);
          }
        } else if (formData.company) { // If company selected but no rules for vehicle type
           // This case is now handled by displaying an info message in the UI,
           // but we still need to ensure the form is valid if no commission fields appear.
           // If no commission type is found, then no commission fields are required.
           // No explicit error needs to be added here for missing commission type if it's not found.
        }
      }

      requiredFieldsForStep.forEach((field) => {
        if (
          !formData[field] ||
          (typeof formData[field] === "string" &&
            formData[field].trim() === "") ||
          (formData[field] instanceof File && !formData[field].name) ||
          (typeof formData[field] === 'number' && isNaN(formData[field])) // Check for NaN for number inputs
        ) {
          currentErrors[field] = "This field is required";
          isValid = false;
        }
      });

      setErrors(currentErrors);
      return isValid;
    },
    [formData, steps, selectedCompanyCommissionRules] // Added selectedCompanyCommissionRules to dependencies
  );

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, totalSteps, validateStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      setSubmitTrigger(true); // Trigger submission via useEffect
    }
  };

  // useEffect to handle form submission
  useEffect(() => {
    if (submitTrigger) {
      const submitForm = async () => {
        setIsSubmitting(true);
        try {
          // Construct FormData for backend submission
          const dataToSubmit = new FormData();

          // Mapping New Driver Form fields to module.py backend fields
          dataToSubmit.append('driver_type', 'new'); // Add driver_type as a form field
          dataToSubmit.append('driver_name', formData.fullName || '');
          dataToSubmit.append('emp_id', formData.emp_Id || '');
          dataToSubmit.append('gender', formData.gender || '');
          dataToSubmit.append('dob', formData.dob || '');
          dataToSubmit.append('nationality', formData.nationality || '');
          dataToSubmit.append('city', formData.city || '');
          dataToSubmit.append('company', formData.company || ''); // Company field
          dataToSubmit.append('apartment_area', formData.apartmentArea || '');
          dataToSubmit.append('phone_number', formData.phoneNumber || '');
          dataToSubmit.append('age', formData.age || '');
          dataToSubmit.append('marital_status', formData.maritalStatus || '');
          dataToSubmit.append('blood_group', formData.bloodGroup || '');
          dataToSubmit.append('home_country_address', formData.homeCountryAddress || '');
          dataToSubmit.append('nominee', formData.nomineeWife || '');
          dataToSubmit.append('nominee_phone', formData.nomineePhone || ''); // Nominee phone
          dataToSubmit.append('vehicle_type', formData.vehicleType || '');
          dataToSubmit.append('vehicle_destination', formData.vehicleDestination || '');
          dataToSubmit.append('t_shirt_size', formData.tShirtSize || '');
          dataToSubmit.append('weight', formData.weight || '');
          dataToSubmit.append('height', formData.height || '');
          dataToSubmit.append('kuwait_entry_date', formData.kuwaitEntryDate || '');

          // Append commission details based on vehicle type from formData
          if (formData.vehicleType && selectedCompanyCommissionRules) {
            const vehicleTypePrefix = formData.vehicleType;
            const commissionRule = selectedCompanyCommissionRules[vehicleTypePrefix];

            if (commissionRule) {
                // Use the commission_type from the fetched rule, not from formData directly
                dataToSubmit.append(`${vehicleTypePrefix}_commission_type`, commissionRule.commission_type || '');
                // Ensure numerical values are sent, default to 0 if not present or invalid
                dataToSubmit.append(`${vehicleTypePrefix}_rate_per_km`, parseFloat(formData[`${vehicleTypePrefix}RatePerKm`]) || 0);
                dataToSubmit.append(`${vehicleTypePrefix}_min_km`, parseFloat(formData[`${vehicleTypePrefix}MinKm`]) || 0);
                dataToSubmit.append(`${vehicleTypePrefix}_rate_per_order`, parseFloat(formData[`${vehicleTypePrefix}RatePerOrder`]) || 0);
                dataToSubmit.append(`${vehicleTypePrefix}_fixed_commission`, parseFloat(formData[`${vehicleTypePrefix}FixedCommission`]) || 0);
            }
          }

          // Append file fields if they exist
          if (formData.passport) dataToSubmit.append('passport', formData.passport);
          if (formData.visa) dataToSubmit.append('visa', formData.visa);
          if (formData.policeCer) dataToSubmit.append('police_cer', formData.policeCer);
          if (formData.pasPhot) dataToSubmit.append('passport_photo', formData.pasPhot);
          if (formData.medicalCer) dataToSubmit.append('medical_cer', formData.medicalCer);

          // Log FormData entries for debugging
          for (let pair of dataToSubmit.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
          }

          const response = await fetch('http://127.0.0.1:8000/Register/drivers/', {
            method: 'POST',
            // Do NOT set Content-Type header manually when sending FormData
            body: dataToSubmit,
          });

          if (response.ok) {
            const result = await response.json();
            console.log("Submission successful:", result);
            // Call the parent onSubmit prop
            if (onSubmit) onSubmit(formData);
            // Show success message
            setMessageBox({ message: "Driver registered successfully!", type: "success" });
            // Reset form
            setFormData({});
            setErrors({});
            setCurrentStep(0);
            if (onReset) onReset('success', 'New Driver Application submitted successfully!'); // Call parent onReset if provided
          } else {
            const errorData = await response.json();
            console.error("Submission failed:", errorData);
            // Show error message
            setMessageBox({ message: `Submission failed: ${errorData.detail || JSON.stringify(errorData) || 'Unknown error'}`, type: "error" });
          }
        } catch (error) {
          console.error("Error during submission:", error);
          // Show error message
          setMessageBox({ message: `An unexpected error occurred: ${error.message}`, type: "error" });
        } finally {
          setIsSubmitting(false);
          setSubmitTrigger(false); // Reset trigger
        }
      };

      submitForm();
    }
  }, [submitTrigger, formData, onSubmit, onReset, selectedCompanyCommissionRules]);


  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          New Driver Registration
        </h2>

        <Stepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepNames={steps.map((step) => step.name)}
          stepIcons={steps.map((step) => step.icon)}
        />

        {loading ? (
          <div className="flex items-center justify-center py-10 text-blue-600">
            <svg className="animate-spin h-8 w-8 text-blue-500 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-medium">Loading form data...</span>
          </div>
        ) : (
          <CurrentStepComponent
            formData={formData}
            handleChange={handleChange}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            handleSubmit={handleSubmit}
            errors={errors}
            isSubmitting={isSubmitting}
            companies={companies}
            dropdownOptions={dropdownOptions}
            loading={loading}
            selectedCompanyCommissionRules={selectedCompanyCommissionRules} // Pass commission rules
          />
        )}
      </div>

      <MessageBox
        message={messageBox?.message}
        type={messageBox?.type}
        onClose={() => setMessageBox(null)}
      />
    </div>
  );
};

// Step 1: Personal & Vehicle Info (WorkingDriverForm)
const Step1WorkingPersonalInfo = ({
  formData,
  handleChange,
  handleNext,
  errors,
  companies = [],
  dropdownOptions = { countries: [], cities: {}, vehicle_types: [] },
  newDrivers = [],
  loading = false,
  onDriverSelect,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Driver Selection Dropdown */}
        <div className="md:col-span-2">
          <label
            htmlFor="selectedNewDriver"
            className="block text-sm font-medium text-gray-700"
          >
            Select New Driver Application
          </label>
          <FormSelect
            id="selectedNewDriver"
            name="selectedNewDriver"
            value={formData.selectedNewDriver ?? ""}
            onChange={(e) => {
              handleChange(e);
              if (e.target.value) {
                onDriverSelect(e.target.value);
              }
            }}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.selectedNewDriver ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">Select a new driver application</option>
            {newDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name} - {driver.application_number} ({driver.company_name})
              </option>
            ))}
          </FormSelect>
          {errors.selectedNewDriver && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {errors.selectedNewDriver}
            </p>
          )}
        </div>

        {/* Employee ID Field */}
        <div>
          <label
            htmlFor="emp_Id"
            className="block text-sm font-medium text-gray-700"
          >
            Employee ID
          </label>
          <FormInput
            type="text"
            id="emp_Id"
            name="emp_Id"
            value={formData.emp_Id ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.emp_Id ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={errors.emp_Id ? `emp_Id-error` : undefined}
          />
          {errors.emp_Id && (
            <p
              id="emp_Id-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.emp__Id}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <FormSelect
            id="gender"
            name="gender"
            value={formData.gender ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={errors.gender ? `gender-error` : undefined}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </FormSelect>
          {errors.gender && (
            <p
              id="gender-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.gender}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="dob"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth
          </label>
          <FormInput
            type="date"
            id="dob"
            name="dob"
            value={formData.dob ?? ""}
            onChange={handleChange}
            autoComplete="bday"
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.dob ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={errors.dob ? `dob-error` : undefined}
          />
          {errors.dob && (
            <p
              id="dob-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.dob}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="nationality"
            className="block text-sm font-medium text-gray-700"
          >
            Nationality
          </label>
          <FormInput
            type="text"
            id="nationality"
            name="nationality"
            value={formData.nationality ?? ""}
            onChange={handleChange}
            autoComplete="country"
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.nationality ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.nationality ? `nationality-error` : undefined
            }
          />
          {errors.nationality && (
            <p
              id="nationality-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.nationality}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <FormInput
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber ?? ""}
            onChange={handleChange}
            autoComplete="tel"
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.phoneNumber ? `phoneNumber-error` : undefined
            }
          />
          {errors.phoneNumber && (
            <p
              id="phoneNumber-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.phoneNumber}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vehicleType"
            className="block text-sm font-medium text-gray-700"
          >
            Vehicle Type
          </label>
          <FormSelect
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.vehicleType ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.vehicleType ? `vehicleType-error` : undefined
            }
          >
            <option value="">Select Vehicle Type</option>
            {dropdownOptions.vehicle_types.map((vehicleType) => (
              <option key={vehicleType.value} value={vehicleType.value}>
                {vehicleType.label}
              </option>
            ))}
          </FormSelect>
          {errors.vehicleType && (
            <p
              id="vehicleType-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.vehicleType}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vehicleModel"
            className="block text-sm font-medium text-gray-700"
          >
            Vehicle Model
          </label>
          <FormInput
            type="text"
            id="vehicleModel"
            name="vehicleModel"
            value={formData.vehicleModel ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.vehicleModel ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.vehicleModel ? `vehicleModel-error` : undefined
            }
          />
          {errors.vehicleModel && (
            <p
              id="vehicleModel-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.vehicleModel}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          Next <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </>
  );
};

// Step 2: Documents (WorkingDriverForm)
const Step2WorkingDocuments = ({
  formData,
  handleChange,
  handleNext,
  handlePrevious,
  errors,
}) => {
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    handleChange({ target: { name, value: files[0] } });
  };

  const FileInput = ({ id, label, isRequired = true }) => (
    <div className="flex flex-col items-start p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-150 relative cursor-pointer">
      <input
        type="file"
        id={id}
        name={id}
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
        required={isRequired}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
      />
      <div className="flex items-center space-x-3">
        <ArrowUpTrayIcon className="h-6 w-6 text-blue-500" />
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      {formData[id]?.name ? (
        <span className="text-xs text-green-600 mt-2 flex items-center">
          <CheckCircleIcon className="h-4 w-4 mr-1" /> {formData[id].name}{" "}
          uploaded.
        </span>
      ) : (
        <span className="text-xs text-gray-500 mt-1 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-1" /> Upload file (PDF,
          JPG, PNG)
        </span>
      )}
      {errors[id] && (
        <p
          id={`${id}-error`}
          className="text-xs text-red-600 mt-1"
          role="alert"
        >
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label
            htmlFor="emp_Id"
            className="block text-sm font-medium text-gray-700"
          >
            Employee ID
          </label>
          <FormInput
            type="text"
            id="emp_Id"
            name="emp_Id"
            value={formData.emp_Id ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.emp_Id ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.emp_Id ? `emp_Id-error` : undefined
            }
          />
          {errors.emp_Id && (
            <p
              id="emp_Id-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.emp_Id}
            </p>
          )}
        </div>

        <FileInput id="civilIdDoc" label="Upload Civil ID" />
        <FileInput
          id="fnbDocs"
          label="Upload F&B Documents"
          isRequired={false}
        />
        <FileInput id="licenseDocs" label="Upload License Documents" />
        <FileInput id="vehicleDocs" label="Upload Vehicle Documents" />
        <FileInput id="photo" label="Upload Photo" />
        <FileInput id="healthCardDoc" label="Upload Health Card" />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Vehicle Photos (4 Sides)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FileInput id="vehiclePhotoFront" label="Front" />
          <FileInput id="vehiclePhotoBack" label="Back" />
          <FileInput id="vehiclePhotoLeft" label="Left" />
          <FileInput id="vehiclePhotoRight" label="Right" />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          Next <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </>
  );
};

// Step 3: Expiry Dates (WorkingDriverForm)
const Step3WorkingExpiryDates = ({
  formData,
  handleChange,
  handleNext,
  handlePrevious,
  errors,
}) => {
  const InputGroup = ({ label, id, isDate = false }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <FormInput
        type={isDate ? "date" : "text"}
        id={id}
        name={id}
        value={formData[id] ?? ""}
        onChange={handleChange}
        className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          errors[id] ? "border-red-500" : "border-gray-300"
        }`}
        required
        aria-describedby={errors[id] ? `${id}-error` : undefined}
      />
      {errors[id] && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-600 mt-1"
          role="alert"
        >
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup id="civilIdNumber" label="Civil ID Number" />
        <InputGroup
          id="civilIdExpiryDate"
          label="Civil ID Expiry Date"
          isDate={true}
        />
        <InputGroup id="licenseNumber" label="License Number" />
        <InputGroup
          id="licenseExpiryDate"
          label="License Expiry Date"
          isDate={true}
        />
        <InputGroup id="vehicleNumber" label="Vehicle Number" />
        <InputGroup
          id="vehicleExpiryDate"
          label="Vehicle Expiry Date"
          isDate={true}
        />
        <InputGroup id="healthCardNumber" label="Health Card Number" />
        <InputGroup
          id="healthCardExpiryDate"
          label="Health Card Expiry Date"
          isDate={true}
        />
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          Next <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </>
  );
};

// Step 4: Equipment & Department (WorkingDriverForm)
const Step4WorkingEquipment = ({
  formData,
  handleChange,
  handlePrevious,
  handleSubmit,
  errors,
  isSubmitting,
}) => {
  const equipmentOptions = [
    "cap",
    "bag",
    "vest",
    "safeties",
    "helmet",
    "coolJackets",
    "waterBottle",
  ];
  const tShirtSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="workingDepartment"
            className="block text-sm font-medium text-gray-700"
          >
            Working Department
          </label>
          <FormSelect
            id="workingDepartment"
            name="workingDepartment"
            value={formData.workingDepartment ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.workingDepartment ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.workingDepartment ? `workingDepartment-error` : undefined
            }
          >
            <option value="">Select Department</option>
            <option value="delivery">Delivery</option>
            <option value="transport">Transport</option>
            <option value="logistics">Logistics</option>
            <option value="maintenance">Maintenance</option>
          </FormSelect>
          {errors.workingDepartment && (
            <p
              id="workingDepartment-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.workingDepartment}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="tShirtSize"
            className="block text-sm font-medium text-gray-700"
          >
            T-shirt Size
          </label>
          <FormSelect
            id="tShirtSize"
            name="tShirtSize"
            value={formData.tShirtSize ?? ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.tShirtSize ? "border-red-500" : "border-gray-300"
            }`}
            required
            aria-describedby={
              errors.tShirtSize ? `tShirtSize-error` : undefined
            }
          >
            <option value="">Select Size</option>
            {tShirtSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </FormSelect>
          {errors.tShirtSize && (
            <p
              id="tShirtSize-error"
              className="text-sm text-red-600 mt-1"
              role="alert"
            >
              {errors.tShirtSize}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Equipment Provided
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {equipmentOptions.map((option) => (
            <div
              key={option}
              className="flex items-center p-3 border rounded-lg bg-white shadow-sm"
            >
              <input
                type="checkbox"
                id={option}
                name={option}
                checked={formData[option] ?? false}
                onChange={(e) =>
                  handleChange({
                    target: { name: option, value: e.target.checked },
                  })
                }
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={option}
                className="ml-3 text-sm font-medium text-gray-700 capitalize"
              >
                {option.replace(/([A-Z])/g, " $1").toLowerCase()}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <CheckCircleIcon className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? "Completing..." : "Complete Form"}
        </button>
      </div>
    </>
  );
};

// Main Working Driver Form Component
const WorkingDriverForm = ({ onSubmit, onReset }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({
    countries: [],
    cities: {},
    vehicle_types: []
  });
  const [newDrivers, setNewDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoFilling, setAutoFilling] = useState(false);
  const [messageBox, setMessageBox] = useState(null); // State for message box
  const totalSteps = 4;

  // Fetch companies and dropdown options on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch companies with accessories
        const companiesResponse = await fetch('http://127.0.0.1:8000/companies-with-accessories/');
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData);
        } else {
            console.error('Failed to fetch companies:', companiesResponse.statusText);
            setMessageBox({ message: `Failed to load companies: ${companiesResponse.statusText}`, type: "error" });
        }

        // Fetch dropdown options
        const dropdownResponse = await fetch('http://127.0.0.1:8000/dropdown-options/');
        if (dropdownResponse.ok) {
          const dropdownData = await dropdownResponse.json();
          setDropdownOptions(dropdownData);
        } else {
            console.error('Failed to fetch dropdown options:', dropdownResponse.statusText);
            setMessageBox({ message: `Failed to load dropdown options: ${dropdownResponse.statusText}`, type: "error" });
        }

        // Fetch new driver applications
        const newDriversResponse = await fetch('http://127.0.0.1:8000/Register/new-driver-applications/');
        if (newDriversResponse.ok) {
          const newDriversData = await newDriversResponse.json();
          setNewDrivers(newDriversData.results || []);
        } else {
            console.error('Failed to fetch new driver applications:', newDriversResponse.statusText);
            setMessageBox({ message: `Failed to load new driver applications: ${newDriversResponse.statusText}`, type: "error" });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessageBox({ message: `An error occurred while fetching initial data: ${error.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const steps = [
    {
      name: "Personal & Vehicle Info",
      icon: UserIcon,
      component: Step1WorkingPersonalInfo,
      requiredFields: [
        "selectedNewDriver",
        "emp_Id",
        "vehicleType",
        "vehicleModel",
      ],
    },
    {
      name: "Documents",
      icon: PaperClipIcon,
      component: Step2WorkingDocuments,
      requiredFields: [
        "emp_Id",
        "civilIdDoc",
        "licenseDocs",
        "vehicleDocs",
        "photo",
        "healthCardDoc",
        "vehiclePhotoFront",
        "vehiclePhotoBack",
        "vehiclePhotoLeft",
        "vehiclePhotoRight",
      ],
    },
    {
      name: "Expiry Dates",
      icon: CalendarDaysIcon,
      component: Step3WorkingExpiryDates,
      requiredFields: [
        "civilIdNumber",
        "civilIdExpiryDate",
        "licenseNumber",
        "licenseExpiryDate",
        "vehicleNumber",
        "vehicleExpiryDate",
        "healthCardNumber", // This field is in the form but not directly in module.py
        "healthCardExpiryDate",
      ],
    },
    {
      name: "Equipment & Department",
      icon: CubeTransparentIcon,
      component: Step4WorkingEquipment,
      requiredFields: ["workingDepartment", "tShirtSize"],
    },
  ];

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, files, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "file" ? files[0] : type === "checkbox" ? checked : value,
      }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  const validateStep = useCallback(
    (stepIndex) => {
      let currentErrors = {};
      let isValid = true;
      const requiredFields = steps[stepIndex].requiredFields;

      requiredFields.forEach((field) => {
        if (
          !formData[field] ||
          (typeof formData[field] === "string" &&
            formData[field].trim() === "") ||
          (formData[field] instanceof File && !formData[field].name)
        ) {
          currentErrors[field] = "This field is required";
          isValid = false;
        }
      });

      setErrors(currentErrors);
      return isValid;
    },
    [formData, steps]
  );

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, totalSteps, validateStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      setSubmitTrigger(true); // Trigger submission via useEffect
    }
  };

  // Function to handle driver selection and auto-fill form
  const handleDriverSelect = useCallback(async (driverId) => {
    try {
      setAutoFilling(true);
      console.log('Fetching driver details for ID:', driverId);
      
      const response = await fetch(`http://127.0.0.1:8000/new-driver-application/${driverId}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Driver details fetched:', result);
      
      if (result.success && result.data) {
        const driverData = result.data;
        
        // Auto-fill the form with existing driver data
        setFormData(prevData => ({
          ...prevData,
          selectedNewDriver: driverId, // Keep the selected driver ID
          // Personal details
          fullName: driverData.driver_name || '',
          emp_Id: driverData.emp_id || '',
          gender: driverData.gender || '',
          dob: driverData.date_of_birth || '', // Assuming backend sends 'date_of_birth'
          nationality: driverData.nationality || '',
          phoneNumber: driverData.phone_number || '',
          company: driverData.company_name || '',
          city: driverData.city || '', // Added city from new_driver_application
          apartmentArea: driverData.apartment_area || '', // Added apartmentArea
          age: driverData.age || '', // Added age
          maritalStatus: driverData.marital_status || '', // Added maritalStatus
          bloodGroup: driverData.blood_group || '', // Added bloodGroup
          homeCountryAddress: driverData.home_country_address || '', // Added homeCountryAddress
          nomineeWife: driverData.nominee_name || '', // Assuming nominee_name maps to nomineeWife
          nomineePhone: driverData.nominee_phone || '', // Assuming nominee_phone maps to nomineePhone
          nomineeAddress: driverData.nominee_address || '', // Added nomineeAddress
          
          // Vehicle details
          vehicleType: driverData.vehicle_type || '',
          vehicleDestination: driverData.vehicle_destination || '',
          
          // Physical details (these might not be in new-driver-application, but included for completeness)
          tShirtSize: driverData.t_shirt_size || '',
          weight: driverData.weight || '',
          height: driverData.height || '',
          kuwaitEntryDate: driverData.kuwait_entry_date || '', // Added kuwaitEntryDate
          
          // Files are not auto-filled as they need to be re-uploaded for security/freshness
          civilIdDoc: null,
          fnbDocs: null,
          licenseDocs: null,
          vehicleDocs: null,
          photo: null,
          healthCardDoc: null,
          vehiclePhotoFront: null,
          vehiclePhotoBack: null,
          vehiclePhotoLeft: null,
          vehiclePhotoRight: null,
        }));
        
        console.log('Form auto-filled with driver data');
        setMessageBox({ message: 'Driver details loaded successfully! Please review and complete the remaining fields.', type: "success" });
      } else {
        setMessageBox({ message: 'Failed to load driver details: No data found.', type: "error" });
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
      setMessageBox({ message: `Failed to load driver details: ${error.message}`, type: "error" });
    } finally {
      setAutoFilling(false);
    }
  }, [newDrivers, setFormData, setMessageBox]);


  // useEffect to handle form submission for WorkingDriverForm
  useEffect(() => {
    if (submitTrigger) {
      const submitForm = async () => {
        setIsSubmitting(true);
        try {
          const dataToSubmit = new FormData();

          // Add driver_type
          dataToSubmit.append('driver_type', 'working');
          dataToSubmit.append('new_driver_application_id', formData.selectedNewDriver || '');

          // Personal & Vehicle Info (from Step 1)
          dataToSubmit.append("emp_id", formData.emp_id || "");
          dataToSubmit.append('driver_name', formData.driver_name || '');
          dataToSubmit.append('gender', formData.gender || '');
          dataToSubmit.append('date_of_birth', formData.dob || ''); // Mapped to date_of_birth
          dataToSubmit.append('nationality', formData.nationality || '');
          dataToSubmit.append('phone_number', formData.phoneNumber || '');
          dataToSubmit.append('vehicle_type', formData.vehicleType || '');
          dataToSubmit.append('vehicle_model', formData.vehicleModel || '');
          dataToSubmit.append('city', formData.city || ''); // Added city
          dataToSubmit.append('company', formData.company || ''); // Added company
          dataToSubmit.append('apartment_area', formData.apartmentArea || ''); // Added apartment_area
          dataToSubmit.append('age', formData.age || ''); // Added age
          dataToSubmit.append('marital_status', formData.maritalStatus || ''); // Added marital_status
          dataToSubmit.append('blood_group', formData.bloodGroup || ''); // Added blood_group
          dataToSubmit.append('home_country_address', formData.homeCountryAddress || ''); // Added home_country_address
          dataToSubmit.append('nominee_name', formData.nomineeWife || ''); // Mapped nomineeWife to nominee_name
          dataToSubmit.append('nominee_phone', formData.nomineePhone || ''); // Mapped nomineePhone to nominee_phone
          dataToSubmit.append('nominee_address', formData.nomineeAddress || ''); // Added nominee_address

          // Vehicle details from new driver form (if applicable)
          dataToSubmit.append('vehicle_destination', formData.vehicleDestination || '');
          dataToSubmit.append('kuwait_entry_date', formData.kuwaitEntryDate || '');


          // Documents (from Step 2)
          if (formData.civilIdDoc) dataToSubmit.append('civil_id_doc', formData.civilIdDoc);
          if (formData.fnbDocs) dataToSubmit.append('fnb_docs', formData.fnbDocs);
          if (formData.licenseDocs) dataToSubmit.append('licence_doc', formData.licenseDocs); // Corrected mapping
          if (formData.vehicleDocs) dataToSubmit.append('vehicle_doc', formData.vehicleDocs);
          if (formData.photo) dataToSubmit.append('driver_photo', formData.photo); // Corrected mapping
          if (formData.healthCardDoc) dataToSubmit.append('health_card_doc', formData.healthCardDoc);
          if (formData.vehiclePhotoFront) dataToSubmit.append('vehicle_photo_front', formData.vehiclePhotoFront);
          if (formData.vehiclePhotoBack) dataToSubmit.append('vehicle_photo_back', formData.vehiclePhotoBack);
          if (formData.vehiclePhotoLeft) dataToSubmit.append('vehicle_photo_left', formData.vehiclePhotoLeft);
          if (formData.vehiclePhotoRight) dataToSubmit.append('vehicle_photo_right', formData.vehiclePhotoRight);

          // Expiry Dates (from Step 3)
          dataToSubmit.append('civil_id_number', formData.civilIdNumber || '');
          dataToSubmit.append('civil_id_expiry', formData.civilIdExpiryDate || '');
          dataToSubmit.append('licence_number', formData.licenseNumber || ''); // Corrected mapping
          dataToSubmit.append('licence_expiry', formData.licenseExpiryDate || ''); // Corrected mapping
          dataToSubmit.append('vehicle_number', formData.vehicleNumber || '');
          dataToSubmit.append('vehicle_expiry', formData.vehicleExpiryDate || '');
          dataToSubmit.append('health_card_number', formData.healthCardNumber || ''); // Added health_card_number
          dataToSubmit.append('health_card_expiry', formData.healthCardExpiryDate || '');

          // Equipment & Department (from Step 4)
          dataToSubmit.append('working_department', formData.workingDepartment || '');
          dataToSubmit.append('t_shirt_size', formData.tShirtSize || '');

          // Append checkbox values for equipment (convert boolean to string 'true'/'false' or 1/0 as backend expects)
          dataToSubmit.append('cap', formData.cap ? 'true' : 'false');
          dataToSubmit.append('bag', formData.bag ? 'true' : 'false');
          dataToSubmit.append('vest', formData.vest ? 'true' : 'false'); // Assuming 'vest' maps to 'vest'
          dataToSubmit.append('safeties', formData.safeties ? 'true' : 'false');
          dataToSubmit.append('helmet', formData.helmet ? 'true' : 'false');
          dataToSubmit.append('cool_jackets', formData.coolJackets ? 'true' : 'false'); // Corrected mapping
          dataToSubmit.append('water_bottle', formData.waterBottle ? 'true' : 'false'); // Corrected mapping

          // Log FormData entries for debugging
          for (let pair of dataToSubmit.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
          }

          const response = await fetch('http://127.0.0.1:8000/Register/drivers/', { // Changed endpoint to /Register/drivers/
            method: 'POST',
            body: dataToSubmit, // Use FormData directly
          });

          if (response.ok) {
            const result = await response.json();
            console.log("Working Driver Submission successful:", result);
            setMessageBox({ message: "Working Driver registered successfully!", type: "success" });
            setFormData({});
            setErrors({});
            setCurrentStep(0);
            if (onReset) onReset('success', 'Working Driver Application submitted successfully!');
          } else {
            const errorData = await response.json();
            console.error("Working Driver Submission failed:", errorData);
            setMessageBox({ message: `Submission failed: ${errorData.detail || JSON.stringify(errorData) || 'Unknown error'}`, type: "error" });
          }
        } catch (error) {
          console.error("Error during Working Driver submission:", error);
          setMessageBox({ message: `An unexpected error occurred: ${error.message}`, type: "error" });
        } finally {
          setIsSubmitting(false);
          setSubmitTrigger(false);
        }
      };
      submitForm();
    }
  }, [submitTrigger, formData, onReset]); // Dependencies for useEffect

  const CurrentFormComponent = steps[currentStep].component;

  return (
    <div className="min-h-full p-6 bg-gray-100 min-w-[700px] rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Working Driver Registration
      </h2>

      <Stepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepNames={steps.map((s) => s.name)}
        stepIcons={steps.map((s) => s.icon)}
      />

      <div className="min-h-[500px] bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
          {steps[currentStep].name}
        </h3>
        {autoFilling && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-800 font-medium">Auto-filling form with driver details...</span>
            </div>
          </div>
        )}
        <CurrentFormComponent
          formData={formData}
          handleChange={handleChange}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          handleSubmit={handleSubmit}
          errors={errors}
          isSubmitting={isSubmitting}
          companies={companies}
          dropdownOptions={dropdownOptions}
          newDrivers={newDrivers}
          loading={loading}
          onDriverSelect={handleDriverSelect}
        />
      </div>
    </div>
  );
};

// Main DriverFormContainer component
const DriverFormContainer = () => {
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [showNewDriverForm, setShowNewDriverForm] = useState(true);

  const handleFormSubmit = useCallback(async (data) => {
    console.log("Form data received by DriverFormContainer for submission:", data);
    return { success: true };
  }, []);

  const handleResetFormAndShowMessage = useCallback((type, message) => {
    setMessageContent(message);
    setMessageType(type);
  }, []);

  const closeMessage = useCallback(() => {
    setMessageContent("");
    setMessageType("success");
  }, []);

  return (
    <div className="font-sans antialiased text-gray-900 bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setShowNewDriverForm(true)}
            className={`px-6 py-3 rounded-md text-lg font-semibold transition-all duration-300 ${
              showNewDriverForm
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
            }`}
          >
            New Driver Form
          </button>
          <button
            onClick={() => setShowNewDriverForm(false)}
            className={`px-6 py-3 rounded-md text-lg font-semibold transition-all duration-300 ${
              !showNewDriverForm
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
            }`}
          >
            Working Driver Form
          </button>
        </div>

        {showNewDriverForm ? (
          <NewDriverForm
            onSubmit={handleFormSubmit}
            onReset={handleResetFormAndShowMessage}
          />
        ) : (
          <WorkingDriverForm
            onSubmit={handleFormSubmit}
            onReset={handleResetFormAndShowMessage}
          />
        )}
      </div>
      <MessageBox
        message={messageContent}
        type={messageType}
        onClose={closeMessage}
      />
    </div>
  );
};

export default DriverFormContainer;
