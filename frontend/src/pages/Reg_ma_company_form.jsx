import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// Country and City options
const COUNTRIES = [
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'Oman', label: 'Oman' },
];

const KUWAIT_CITIES = [
  { value: 'Kuwait City', label: 'Kuwait City' },
  { value: 'Hawalli', label: 'Hawalli' },
  { value: 'Farwaniya', label: 'Farwaniya' },
  { value: 'Ahmadi', label: 'Ahmadi' },
  { value: 'Jahra', label: 'Jahra' },
  { value: 'Mubarak Al-Kabeer', label: 'Mubarak Al-Kabeer' },
  { value: 'Salmiya', label: 'Salmiya' },
  { value: 'Fahaheel', label: 'Fahaheel' },
  { value: 'Mangaf', label: 'Mangaf' },
  { value: 'Mahboula', label: 'Mahboula' },
];

const SAUDI_CITIES = [
  { value: 'Riyadh', label: 'Riyadh' },
  { value: 'Jeddah', label: 'Jeddah' },
  { value: 'Mecca', label: 'Mecca' },
  { value: 'Medina', label: 'Medina' },
  { value: 'Dammam', label: 'Dammam' },
  { value: 'Khobar', label: 'Khobar' },
  { value: 'Dhahran', label: 'Dhahran' },
  { value: 'Taif', label: 'Taif' },
  { value: 'Tabuk', label: 'Tabuk' },
  { value: 'Abha', label: 'Abha' },
];

const UAE_CITIES = [
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Sharjah', label: 'Sharjah' },
  { value: 'Ajman', label: 'Ajman' },
  { value: 'Fujairah', label: 'Fujairah' },
  { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
  { value: 'Umm Al Quwain', label: 'Umm Al Quwain' },
];

const getCitiesForCountry = (country) => {
  switch (country) {
    case 'Kuwait': return KUWAIT_CITIES;
    case 'Saudi Arabia': return SAUDI_CITIES;
    case 'UAE': return UAE_CITIES;
    default: return [];
  }
};

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
    {error && <p className="text-red-600 text-sm mt-1 flex items-center">{error}</p>}
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
    {error && <p className="text-red-600 text-sm mt-1 flex items-center">{error}</p>}
  </div>
);

const Select = ({ label, name, value, onChange, options, placeholder, required = false, error }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
      }`}
    >
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && <p className="text-red-600 text-sm mt-1 flex items-center">{error}</p>}
  </div>
);

const PhoneInput = ({ label, name, value, onChange, placeholder, required = false, error }) => {
  const handlePhoneChange = (e) => {
    let phoneValue = e.target.value;
    if (phoneValue && !phoneValue.startsWith('+965')) {
      phoneValue = '+965' + phoneValue.replace(/^\+?965?/, '');
    }
    onChange({ target: { name, value: phoneValue } });
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm font-medium">🇰🇼 +965</span>
        </div>
        <input
          type="tel"
          id={name}
          name={name}
          value={value || '+965'}
          onChange={handlePhoneChange}
          placeholder={placeholder || '+96512345678'}
          required={required}
          className={`w-full pl-20 pr-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="text-red-600 text-sm mt-1 flex items-center">{error}</p>}
    </div>
  );
};

const FileUploadField = ({ label, name, file, onChange, required = false, error, accept = "*/*", previewUrl }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
    <label className="block text-sm font-medium text-gray-700 mb-3">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    
    {previewUrl && !file && (
      <div className="mb-4">
        <img 
          src={previewUrl} 
          alt="Current logo" 
          className="h-24 w-24 object-contain border rounded"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/96x96/E2E8F0/4A5568?text=Logo';
          }}
        />
      </div>
    )}
    
    <div className="flex items-center">
      <input
        type="text"
        readOnly
        value={file ? file.name : previewUrl ? 'Current logo' : 'No file chosen'} 
        className={`flex-1 bg-gray-50 px-4 py-3 text-gray-700 rounded-l-lg border text-sm overflow-hidden text-ellipsis whitespace-nowrap ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
        title={file ? file.name : previewUrl ? 'Current logo' : 'No file chosen'}
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
        {previewUrl ? 'Change Logo' : 'Upload Logo'}
      </label>
    </div>
    {error && <p className="text-red-600 text-sm mt-1 flex items-center">{error}</p>}
  </div>
);

function CompanyRegistrationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const isEditMode = Boolean(id);
  const existingCompanyData = state?.companyData || null;

  const initialCommissionState = {
    id: null,
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
    contact_phone: '+965',
    company_logo: null,
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    swift_code: '',
    iban_code: '',
    car_commission_details: { ...initialCommissionState },
    bike_commission_details: { ...initialCommissionState },
    website: '',
    description: '',
    established_date: '',
    accessories: {
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

  // Initialize form with existing data
  useEffect(() => {
    if (isEditMode) {
      if (existingCompanyData) {
        // Use the passed data if available (from navigation state)
        initializeFormWithData(existingCompanyData);
      } else {
        // Fallback to API fetch if no data was passed
        setLoadingData(true);
        axiosInstance.get(`/companies/${id}/`)
          .then(response => {
            initializeFormWithData(response.data);
          })
          .catch(error => {
            console.error('Error loading company data:', error);
            toast.error('Failed to load company data');
            navigate('/company-list');
          })
          .finally(() => setLoadingData(false));
      }
    }
  }, [id, isEditMode, existingCompanyData, navigate]);

  const initializeFormWithData = (companyData) => {
    const getCommissionOrDefault = (dataKey) => {
      const commission = companyData[dataKey];
      return {
        id: commission?.id || null,
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
      contact_phone: companyData.contact_phone || '+965',
      company_logo: null,
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
  };

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prev => {
      if (name.startsWith('accessories.')) {
        const accessoryName = name.split('.')[1];
        return {
          ...prev,
          accessories: { ...prev.accessories, [accessoryName]: checked },
        };
      }

      const nameParts = name.split('.');
      if (nameParts.length > 1) {
        const [parent, child] = nameParts;
        return {
          ...prev,
          [parent]: { ...prev[parent], [child]: value },
        };
      } else {
        return {
          ...prev,
          [name]: type === 'file' ? files[0] : value,
        };
      }
    });
  };

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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the highlighted errors before submitting.');
      return;
    }

    setLoading(true);

    const formPayload = new FormData();

    // Append form data
    for (const key in formData) {
      if (key === 'company_logo' && formData[key] instanceof File) {
        formPayload.append(key, formData[key]);
      } else if (key === 'car_commission_details' || key === 'bike_commission_details') {
        const commissionData = formData[key];
        if (commissionData.commission_type) {
          for (const commKey in commissionData) {
            if (commissionData[commKey] !== null && commissionData[commKey] !== '') {
              formPayload.append(`${key}.${commKey}`, commissionData[commKey]);
            }
          }
        }
      } else if (key === 'accessories') {
        formPayload.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null && formData[key] !== '' && formData[key] !== undefined) {
        formPayload.append(key, formData[key]);
      }
    }

    try {
      if (isEditMode) {
        await axiosInstance.patch(`/companies/${id}/`, formPayload, {
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
      console.error('Submission Error:', error);
      const backendErrors = error.response?.data;
      let errorMessage = 'An error occurred during submission.';
      
      if (backendErrors) {
        if (backendErrors.detail) {
          errorMessage = backendErrors.detail;
        } else if (backendErrors.non_field_errors) {
          errorMessage = backendErrors.non_field_errors.join(', ');
        } else {
          const fieldErrors = Object.keys(backendErrors).map(key => {
            if (Array.isArray(backendErrors[key])) {
              return `${key}: ${backendErrors[key].join('; ')}`;
            }
            if (typeof backendErrors[key] === 'object') {
              const nested = Object.keys(backendErrors[key]).map(nk => 
                `${nk}: ${backendErrors[key][nk].join('; ')}`
              ).join(' | ');
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

  const CommissionSection = () => (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">💰 Commission Configuration</h3>
      
      <div className="space-y-8">
        {/* Bike Commission */}
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-xl font-semibold text-blue-800 mb-4">🏍️ Bike Commission Rates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Fixed Commission"
              name="bike_commission_details.fixed_commission"
              type="number"
              value={formData.bike_commission_details.fixed_commission}
              onChange={handleChange}
              placeholder="150.00"
              min="0"
              step="0.01"
            />
            <Input
              label="Rate per KM"
              name="bike_commission_details.rate_per_km"
              type="number"
              value={formData.bike_commission_details.rate_per_km}
              onChange={handleChange}
              placeholder="2.50"
              min="0"
              step="0.01"
            />
            <Input
              label="Minimum KM"
              name="bike_commission_details.min_km"
              type="number"
              value={formData.bike_commission_details.min_km}
              onChange={handleChange}
              placeholder="50"
              min="0"
            />
            <Input
              label="Rate per Order"
              name="bike_commission_details.rate_per_order"
              type="number"
              value={formData.bike_commission_details.rate_per_order}
              onChange={handleChange}
              placeholder="25.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Car Commission */}
        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-xl font-semibold text-green-800 mb-4">🚗 Car Commission Rates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Fixed Commission"
              name="car_commission_details.fixed_commission"
              type="number"
              value={formData.car_commission_details.fixed_commission}
              onChange={handleChange}
              placeholder="200.00"
              min="0"
              step="0.01"
            />
            <Input
              label="Rate per KM"
              name="car_commission_details.rate_per_km"
              type="number"
              value={formData.car_commission_details.rate_per_km}
              onChange={handleChange}
              placeholder="3.00"
              min="0"
              step="0.01"
            />
            <Input
              label="Minimum KM"
              name="car_commission_details.min_km"
              type="number"
              value={formData.car_commission_details.min_km}
              onChange={handleChange}
              placeholder="30"
              min="0"
            />
            <Input
              label="Rate per Order"
              name="car_commission_details.rate_per_order"
              type="number"
              value={formData.car_commission_details.rate_per_order}
              onChange={handleChange}
              placeholder="35.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/company-list')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors py-2 px-3 rounded-md hover:bg-gray-100"
            >
              Back to Company List
            </button>
            <div className="text-gray-500 text-sm">
              Company Management / <span className="font-semibold">{isEditMode ? 'Edit Company' : 'Register Company'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
              <h1 className="text-3xl font-bold">
                {isEditMode ? 'Edit Company' : 'Register New Company'}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {/* Basic Information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Basic Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="Company Name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    error={validationErrors.company_name}
                  />
                  <Input
                    label="Registration Number"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    required
                    error={validationErrors.registration_number}
                  />
                  <Input
                    label="GST Number"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleChange}
                  />
                  <Input
                    label="Website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                  />
                  <Input
                    label="Established Date"
                    name="established_date"
                    type="date"
                    value={formData.established_date}
                    onChange={handleChange}
                  />
                </div>
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Contact Information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Contact Person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    required
                    error={validationErrors.contact_person}
                  />
                  <Input
                    label="Contact Email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                    error={validationErrors.contact_email}
                  />
                  <PhoneInput
                    label="Contact Phone"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    required
                    error={validationErrors.contact_phone}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Textarea
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    error={validationErrors.address}
                    rows={3}
                  />
                  <Select
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    options={COUNTRIES}
                    required
                    error={validationErrors.country}
                  />
                  <Select
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    options={getCitiesForCountry(formData.country)}
                    required
                    error={validationErrors.city}
                  />
                </div>
              </div>

              {/* Banking Information */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Banking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="Bank Name"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                  />
                  <Input
                    label="Account Number"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                  />
                  <Input
                    label="IFSC Code"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                  />
                  <Input
                    label="SWIFT Code"
                    name="swift_code"
                    value={formData.swift_code}
                    onChange={handleChange}
                  />
                  <Input
                    label="IBAN Code"
                    name="iban_code"
                    value={formData.iban_code}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Commission Section */}
              <CommissionSection />

              {/* Accessories */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Accessories Provided</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(formData.accessories).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`accessories_${key}`}
                        name={`accessories.${key}`}
                        checked={value}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`accessories_${key}`} className="ml-3 text-lg text-gray-700 capitalize">
                        {key.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Company Documents</h3>
                <FileUploadField
                  label="Company Logo"
                  name="company_logo"
                  file={formData.company_logo}
                  onChange={handleChange}
                  accept="image/*"
                  previewUrl={existingCompanyData?.company_logo}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/company-list')}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg shadow-md transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Registering...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Company' : 'Register Company'
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