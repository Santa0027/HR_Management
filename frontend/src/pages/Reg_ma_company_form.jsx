import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; // Assuming this path is correct for your axios setup
import { toast } from 'react-toastify'; // For displaying notifications

// --- Reusable Input Components ---
// These components are defined within the same file for a single, complete code block.

const Input = ({ label, name, type = "text", value, onChange, placeholder, required = false, error, min, max }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
      }`}
    />
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        {error}
      </p>
    )}
  </div>
);

const Textarea = ({ label, name, value, onChange, placeholder, required = false, error, rows = 4 }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
      }`}
    />
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        {error}
      </p>
    )}
  </div>
);

const FileUploadField = ({ label, name, file, onChange, required = false, error, accept = "*/*" }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
    <label className="block text-sm font-medium text-gray-700 mb-3">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center">
      <input
        type="text"
        readOnly
        value={file ? file.name : 'No file chosen'}
        className={`flex-1 bg-gray-50 px-4 py-3 text-gray-700 rounded-l-lg border text-sm overflow-hidden text-ellipsis whitespace-nowrap ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
        title={file ? file.name : 'No file chosen'}
      />
      <input
        type="file"
        id={name}
        name={name}
        onChange={onChange}
        className="hidden"
        accept={accept}
        required={required}
      />
      <label
        htmlFor={name}
        className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-lg flex items-center justify-center transition-colors ${
          error ? 'border-red-300' : ''
        }`}
      >
        Upload File
      </label>
    </div>
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        {error}
      </p>
    )}
  </div>
);

// --- Main Company Registration Component ---
function CompanyRegistrationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Initial state for a single commission block (reusable structure)
  const initialCommissionState = {
    id: null, // Add ID for existing commission details when in edit mode
    commission_type: 'FIXED',
    rate_per_km: '',
    min_km: '',
    rate_per_order: '',
    fixed_commission: '',
  };

  const [formData, setFormData] = useState({
    company_name: '',
    registration_number: '',
    gst_number: '',
    address: '',
    city: '',
    country: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    company_logo: null, // Will hold File object
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    swift_code: '',
    iban_code: '',
    // Vehicle-specific commission details, each being a distinct object
    car_commission_details: { ...initialCommissionState },
    bike_commission_details: { ...initialCommissionState },
    website: '',
    description: '',
    established_date: '',
    accessories: { // This will correspond to EmployeeAccessory in the backend, for this form it's a simple checklist
      t_shirt: false,
      cap: false,
      bag: false,
      wristbands: false,
      safety_gear: false,
      helmet: false,
      jackets: false,
      water_bottle: false,
    }
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Helper to validate a single commission block
  const validateCommissionBlock = (commissionData, prefix, errors) => {
    // Only validate if a commission type is explicitly selected
    if (commissionData.commission_type) {
      if (commissionData.commission_type === 'KM') {
        const rateKm = parseFloat(commissionData.rate_per_km);
        const minKm = parseInt(commissionData.min_km);
        if (isNaN(rateKm) || rateKm <= 0) {
          errors[`${prefix}_rate_per_km`] = 'Rate per KM must be a positive number.';
        }
        if (isNaN(minKm) || minKm < 0) {
          errors[`${prefix}_min_km`] = 'Minimum KM must be a non-negative integer.';
        }
      } else if (commissionData.commission_type === 'ORDER') {
        const rateOrder = parseFloat(commissionData.rate_per_order);
        if (isNaN(rateOrder) || rateOrder <= 0) {
          errors[`${prefix}_rate_per_order`] = 'Rate per Order must be a positive number.';
        }
      } else if (commissionData.commission_type === 'FIXED') {
        const fixedComm = parseFloat(commissionData.fixed_commission);
        if (isNaN(fixedComm) || fixedComm <= 0) {
          errors[`${prefix}_fixed_commission`] = 'Fixed commission must be a positive number.';
        }
      }
    }
  };

  // Load company data for edit mode
  useEffect(() => {
    if (isEditMode) {
      setLoadingData(true);
      axiosInstance.get(`/companies/${id}/`)
        .then(response => {
          const companyData = response.data;

          // Helper to safely get commission data or default, including the ID
          const getCommissionOrDefault = (dataKey) => {
            const commission = companyData[dataKey];
            return {
              id: commission?.id || null, // Include ID if present
              commission_type: commission?.commission_type || 'FIXED',
              rate_per_km: commission?.rate_per_km ? String(commission.rate_per_km) : '',
              min_km: commission?.min_km ? String(commission.min_km) : '',
              rate_per_order: commission?.rate_per_order ? String(commission.rate_per_order) : '',
              fixed_commission: commission?.fixed_commission ? String(commission.fixed_commission) : '',
            };
          };

          setFormData({
            company_name: companyData.company_name || '',
            registration_number: companyData.registration_number || '',
            gst_number: companyData.gst_number || '',
            address: companyData.address || '',
            city: companyData.city || '',
            country: companyData.country || '',
            contact_person: companyData.contact_person || '',
            contact_email: companyData.contact_email || '',
            contact_phone: companyData.contact_phone || '',
            company_logo: null, // File input requires null for default, not URL string.
                                // If you want to show existing logo, you'd fetch its URL
                                // and perhaps display it separately, but not in the file input.
            bank_name: companyData.bank_name || '',
            account_number: companyData.account_number || '',
            ifsc_code: companyData.ifsc_code || '',
            swift_code: companyData.swift_code || '',
            iban_code: companyData.iban_code || '',
            car_commission_details: getCommissionOrDefault('car_commission_details'),
            bike_commission_details: getCommissionOrDefault('bike_commission_details'),
            website: companyData.website || '',
            description: companyData.description || '',
            established_date: companyData.established_date || '',
            // Ensure all accessories are loaded, with defaults if missing
            accessories: {
              t_shirt: companyData.accessories?.t_shirt || false,
              cap: companyData.accessories?.cap || false,
              bag: companyData.accessories?.bag || false,
              wristbands: companyData.accessories?.wristbands || false,
              safety_gear: companyData.accessories?.safety_gear || false,
              helmet: companyData.accessories?.helmet || false,
              jackets: companyData.accessories?.jackets || false,
              water_bottle: companyData.accessories?.water_bottle || false,
            },
          });
        })
        .catch(error => {
          console.error('Error loading company data:', error.response?.data || error.message);
          toast.error('Failed to load company data. Please try again.');
          navigate('/company-list'); // Redirect or handle error gracefully
        })
        .finally(() => setLoadingData(false));
    }
  }, [id, isEditMode, navigate]);

  // Enhanced change handler for nested state and checkboxes
  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prev => {
      // Handle accessories checkboxes
      if (name.startsWith('accessories.')) {
        const accessoryName = name.split('.')[1];
        return {
          ...prev,
          accessories: {
            ...prev.accessories,
            [accessoryName]: checked,
          },
        };
      }

      // Handle nested commission details (car_commission_details, bike_commission_details)
      const nameParts = name.split('.');
      if (nameParts.length > 1) {
        const [parent, child] = nameParts;
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      } else {
        // Handle top-level state updates
        return {
          ...prev,
          [name]: type === 'file' ? files[0] : value,
        };
      }
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.company_name.trim()) errors.company_name = 'Company name is required.';
    if (!formData.registration_number.trim()) errors.registration_number = 'Registration number is required.';
    if (!formData.contact_person.trim()) errors.contact_person = 'Contact person is required.';
    if (!formData.contact_email.trim()) {
      errors.contact_email = 'Contact email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address.';
    }
    if (!formData.contact_phone.trim()) errors.contact_phone = 'Contact phone is required.';
    if (!formData.address.trim()) errors.address = 'Address is required.';
    if (!formData.city.trim()) errors.city = 'City is required.';
    if (!formData.country.trim()) errors.country = 'Country is required.';

    // Validate Car Commission Details (only if a type is selected, otherwise it's optional)
    if (formData.car_commission_details.commission_type) {
        validateCommissionBlock(formData.car_commission_details, 'car_commission_details', errors);
    }

    // Validate Bike Commission Details (only if a type is selected)
    if (formData.bike_commission_details.commission_type) {
        validateCommissionBlock(formData.bike_commission_details, 'bike_commission_details', errors);
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the highlighted errors before submitting.');
      return;
    }

    setLoading(true);

    const formPayload = new FormData();

    // Append top-level form data
    for (const key in formData) {
      if (key === 'company_logo' && formData[key] instanceof File) {
        formPayload.append(key, formData[key]);
      } else if (
        key === 'car_commission_details' ||
        key === 'bike_commission_details'
      ) {
        // Only append commission details if a commission type is selected
        // Backend expects the object for related fields, not stringified JSON for FormData
        // If updating, include the 'id' of the existing commission detail object
        const commissionData = formData[key];
        if (commissionData.commission_type) { // Only send if user has selected a commission type
            // Append each field of the commission detail object
            // Use specific field names as expected by Django REST Framework's nested serializers
            // e.g., 'car_commission_details.commission_type'
            for (const commKey in commissionData) {
                if (commissionData[commKey] !== null && commissionData[commKey] !== '') {
                    formPayload.append(`${key}.${commKey}`, commissionData[commKey]);
                }
            }
        }
      } else if (key === 'accessories') {
        // Accessories will be sent as a JSON string to match the JSONField in Django
        formPayload.append(key, JSON.stringify(formData[key]));
      }
      else if (formData[key] !== null && formData[key] !== '' && formData[key] !== undefined) {
        formPayload.append(key, formData[key]);
      }
    }


    try {
      if (isEditMode) {
        await axiosInstance.patch(`/companies/${id}/`, formPayload, { // Use PATCH for partial updates
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Company updated successfully!');
      } else {
        await axiosInstance.post('/companies/', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Company registered successfully!');
      }
      navigate('/company-list');
    } catch (error) {
      console.error('Submission Error:', error.response?.data || error);
      const backendErrors = error.response?.data;
      let errorMessage = 'An error occurred during submission. Please check your input.';

      if (backendErrors) {
        // General errors from backend
        if (backendErrors.detail) {
            errorMessage = backendErrors.detail;
        } else if (backendErrors.non_field_errors) {
            errorMessage = backendErrors.non_field_errors.join(', ');
        } else {
            // Detailed field errors
            const fieldErrors = Object.keys(backendErrors).map(key => {
                if (Array.isArray(backendErrors[key])) {
                    return `${key}: ${backendErrors[key].join('; ')}`;
                }
                // Handle nested errors for commissions
                if (typeof backendErrors[key] === 'object' && backendErrors[key] !== null) {
                    const nested = Object.keys(backendErrors[key]).map(nk => `${nk}: ${backendErrors[key][nk].join('; ')}`).join(' | ');
                    return `${key}: { ${nested} }`;
                }
                return `${key}: ${backendErrors[key]}`;
            }).join(' | ');
            errorMessage = `Validation Errors: ${fieldErrors}`;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state for fetching existing data
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading company data...</p>
        </div>
      </div>
    );
  }

  // Component to render commission fields for a specific vehicle type
  const CommissionSection = ({ title, commissionDetails, validationErrors, onChange, prefix }) => (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        {title} Commission
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${prefix}_commission_type`} className="block text-sm font-medium text-gray-700 mb-2">
            Commission Type
          </label>
          <select
            id={`${prefix}_commission_type`}
            name={`${prefix}.commission_type`} // Nested name for handleChange
            value={commissionDetails.commission_type}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="FIXED">Fixed Commission</option>
            <option value="KM">KM Based</option>
            <option value="ORDER">Order Based</option>
          </select>
        </div>

        {commissionDetails.commission_type === 'KM' && (
          <>
            <Input
              label="Rate per KM"
              name={`${prefix}.rate_per_km`}
              type="number"
              value={commissionDetails.rate_per_km}
              onChange={onChange}
              placeholder="0.00"
              min="0"
              error={validationErrors[`${prefix}_rate_per_km`]}
            />
            <Input
              label="Minimum KM"
              name={`${prefix}.min_km`}
              type="number"
              value={commissionDetails.min_km}
              onChange={onChange}
              placeholder="0"
              min="0"
              error={validationErrors[`${prefix}_min_km`]}
            />
          </>
        )}

        {commissionDetails.commission_type === 'ORDER' && (
          <Input
            label="Rate per Order"
            name={`${prefix}.rate_per_order`}
            type="number"
            value={commissionDetails.rate_per_order}
            onChange={onChange}
            placeholder="0.00"
            min="0"
            error={validationErrors[`${prefix}_rate_per_order`]}
          />
        )}

        {commissionDetails.commission_type === 'FIXED' && (
          <Input
            label="Fixed Commission Amount"
            name={`${prefix}.fixed_commission`}
            type="number"
            value={commissionDetails.fixed_commission}
            onChange={onChange}
            placeholder="0.00"
            min="0"
            error={validationErrors[`${prefix}_fixed_commission`]}
          />
        )}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Light Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/company-list')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors py-2 px-3 rounded-md hover:bg-gray-100"
              aria-label="Back to Company List"
            >
              Back to Company List
            </button>
            <div className="text-gray-500 text-sm">Company Management / <span className="font-semibold">{isEditMode ? 'Edit Company' : 'Register Company'}</span></div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors" aria-label="Select Language">
              English
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Form Container */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
              <h1 className="text-3xl font-bold flex items-center">
                {isEditMode ? 'Edit Company' : 'Register New Company'}
              </h1>
              <p className="text-blue-100 mt-2 text-lg">
                {isEditMode ? 'Update company information and details in our system.' : 'Add a new company to the management system to expand your network.'}
              </p>
            </div>

            {/* Enhanced Form Content */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Basic Company Information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  Basic Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="Company Name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="e.g., Global Logistics Corp"
                    required
                    error={validationErrors.company_name}
                  />
                  <Input
                    label="Registration Number"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    placeholder="e.g., REG123456789"
                    required
                    error={validationErrors.registration_number}
                  />
                  <Input
                    label="GST Number (Optional)"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleChange}
                    placeholder="e.g., 22AAAAA0000A1Z5"
                  />
                  <Input
                    label="Company Website (Optional)"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.example.com"
                  />
                  <Input
                    label="Established Date (Optional)"
                    name="established_date"
                    type="date"
                    value={formData.established_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="mt-6">
                  <Textarea
                    label="Company Description (Optional)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a brief overview of the company's services and mission."
                    rows={3}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Contact Person Name"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    placeholder="e.g., Jane Doe"
                    required
                    error={validationErrors.contact_person}
                  />
                  <Input
                    label="Contact Email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="e.g., info@company.com"
                    required
                    error={validationErrors.contact_email}
                  />
                  <Input
                    label="Contact Phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="e.g., +91 98765 43210"
                    required
                    error={validationErrors.contact_phone}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Textarea
                      label="Full Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g., 123, Main Street, Business Park"
                      required
                      error={validationErrors.address}
                      rows={3}
                    />
                  </div>
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Chennai"
                    required
                    error={validationErrors.city}
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g., India"
                    required
                    error={validationErrors.country}
                  />
                </div>
              </div>

              {/* Banking Information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  Banking Information (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="Bank Name"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    placeholder="e.g., State Bank of India"
                  />
                  <Input
                    label="Account Number"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="e.g., 123456789012"
                  />
                  <Input
                    label="IFSC Code"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    placeholder="e.g., SBIN0001234"
                  />
                  <Input
                    label="SWIFT Code (Optional)"
                    name="swift_code"
                    value={formData.swift_code}
                    onChange={handleChange}
                    placeholder="e.g., SBININBBXXX"
                  />
                  <Input
                    label="IBAN Code (Optional)"
                    name="iban_code"
                    value={formData.iban_code}
                    onChange={handleChange}
                    placeholder="e.g., DE89370400440532013000"
                  />
                </div>
              </div>

              {/* Vehicle Specific Commission Sections */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  Vehicle-Specific Commissions
                </h3>

                <CommissionSection
                  title="Car"
                  commissionDetails={formData.car_commission_details}
                  validationErrors={validationErrors}
                  onChange={handleChange}
                  prefix="car_commission_details"
                />

                <CommissionSection
                  title="Bike"
                  commissionDetails={formData.bike_commission_details}
                  validationErrors={validationErrors}
                  onChange={handleChange}
                  prefix="bike_commission_details"
                />
              </div>

              {/* Accessories Checklist (This will inform EmployeeAccessory instances in the backend) */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  Accessories Provided
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* T-shirt */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessories_t_shirt"
                      name="accessories.t_shirt"
                      checked={formData.accessories.t_shirt}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="accessories_t_shirt" className="ml-3 text-lg text-gray-700 flex items-center">
                      T-shirt
                    </label>
                  </div>
                  {/* Cap */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessories_cap"
                      name="accessories.cap"
                      checked={formData.accessories.cap}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="accessories_cap" className="ml-3 text-lg text-gray-700 flex items-center">
                      Cap
                    </label>
                  </div>
                  {/* Bag */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessories_bag"
                      name="accessories.bag"
                      checked={formData.accessories.bag}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="accessories_bag" className="ml-3 text-lg text-gray-700 flex items-center">
                      Bag
                    </label>
                  </div>
                  {/* Wristbands */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessories_wristbands"
                      name="accessories.wristbands"
                      checked={formData.accessories.wristbands}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="accessories_wristbands" className="ml-3 text-lg text-gray-700 flex items-center">
                      Wristbands
                    </label>
                  </div>
                  {/* Safety Gear */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessories_safety_gear"
                      name="accessories.safety_gear"
                      checked={formData.accessories.safety_gear}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="accessories_safety_gear" className="ml-3 text-lg text-gray-700 flex items-center">
                      Safety Gear
                    </label>
                  </div>
                  {/* Helmet */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessories_helmet"
                      name="accessories.helmet"
                      checked={formData.accessories.helmet}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="accessories_helmet" className="ml-3 text-lg text-gray-700 flex items-center">
                      Helmet
                    </label>
                  </div>
                  {/* Jackets */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessories_jackets"
                      name="accessories.jackets"
                      checked={formData.accessories.jackets}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="accessories_jackets" className="ml-3 text-lg text-gray-700 flex items-center">
                      Jackets
                    </label>
                  </div>
                  {/* Water Bottle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessories_water_bottle"
                      name="accessories.water_bottle"
                      checked={formData.accessories.water_bottle}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="accessories_water_bottle" className="ml-3 text-lg text-gray-700 flex items-center">
                      Water Bottle
                    </label>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  Company Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadField
                    label="Company Logo (Optional)"
                    name="company_logo"
                    file={formData.company_logo}
                    onChange={handleChange}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/company-list')}
                  className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-label={isEditMode ? "Update Company" : "Register Company"}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Registering...'}
                    </>
                  ) : (
                    <>
                      {isEditMode ? 'Update Company' : 'Register Company'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyRegistrationForm;