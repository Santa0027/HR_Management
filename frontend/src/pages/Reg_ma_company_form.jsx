import React, { useState, useEffect } from 'react';
import {
  ChevronDown, CircleUserRound, Upload, Building,
  Save, X, AlertTriangle, CheckCircle, ArrowLeft,
  Mail, Phone, MapPin, FileText, User, Calendar,
  Globe, CreditCard
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// Enhanced Input field with light theme
const Input = ({ label, name, type = "text", value, onChange, placeholder, required = false, error }) => (
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
      className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
      }`}
    />
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

// Enhanced Textarea field
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
        <AlertTriangle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

// Enhanced File upload field with light theme
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
        <Upload size={18} />
      </label>
    </div>
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);


// Enhanced Company Registration Component
function CompanyRegistrationForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = Boolean(id);

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
    company_logo: null,
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    swift_code: '',
    iban_code: '',
    commission_type: 'FIXED',
    rate_per_km: '',
    min_km: '',
    rate_per_order: '',
    fixed_commission: '',
    website: '',
    description: '',
    established_date: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Load company data for edit mode
  useEffect(() => {
    if (isEditMode) {
      setLoadingData(true);
      axiosInstance.get(`/companies/${id}/`)
        .then(response => {
          const companyData = response.data;
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
            company_logo: null, // File inputs can't be pre-filled
            bank_name: companyData.bank_name || '',
            account_number: companyData.account_number || '',
            ifsc_code: companyData.ifsc_code || '',
            swift_code: companyData.swift_code || '',
            iban_code: companyData.iban_code || '',
            commission_type: companyData.commission_type || 'FIXED',
            rate_per_km: companyData.rate_per_km || '',
            min_km: companyData.min_km || '',
            rate_per_order: companyData.rate_per_order || '',
            fixed_commission: companyData.fixed_commission || '',
            website: companyData.website || '',
            description: companyData.description || '',
            established_date: companyData.established_date || '',
          });
        })
        .catch(error => {
          console.error('Error loading company data:', error);
          toast.error('Failed to load company data');
          navigate('/company-list');
        })
        .finally(() => setLoadingData(false));
    }
  }, [id, isEditMode, navigate]);

  // Enhanced change handler with validation
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.company_name.trim()) {
      errors.company_name = 'Company name is required';
    }

    if (!formData.registration_number.trim()) {
      errors.registration_number = 'Registration number is required';
    }

    if (!formData.contact_email.trim()) {
      errors.contact_email = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address';
    }

    if (!formData.contact_phone.trim()) {
      errors.contact_phone = 'Contact phone is required';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);

    const form = new FormData();

    // Append all form data
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== '' && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    }

    try {
      if (isEditMode) {
        await axiosInstance.put(`/companies/${id}/`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Company updated successfully!');
      } else {
        await axiosInstance.post('/companies/', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Company registered successfully!');
      }
      navigate('/company-list');
    } catch (error) {
      console.error('Submission Error:', error.response?.data);
      toast.error(`Error ${isEditMode ? 'updating' : 'registering'} company: ${error.response?.data?.detail || 'Unknown error'}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Light Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/company-list')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Company List
            </button>
            <div className="text-gray-500">Company Management / {isEditMode ? 'Edit Company' : 'Register Company'}</div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-blue-600" />
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
                <Building className="h-8 w-8 mr-3" />
                {isEditMode ? 'Edit Company' : 'Register New Company'}
              </h1>
              <p className="text-blue-100 mt-2">
                {isEditMode ? 'Update company information and details' : 'Add a new company to the management system'}
              </p>
            </div>

            {/* Enhanced Form Content */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Basic Company Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Building className="h-6 w-6 mr-3 text-blue-600" />
                  Basic Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="Company Name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                    error={validationErrors.company_name}
                  />
                  <Input
                    label="Registration Number"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    placeholder="Enter registration number"
                    required
                    error={validationErrors.registration_number}
                  />
                  <Input
                    label="GST Number"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                  />
                  <Input
                    label="Website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                  />
                  <Input
                    label="Established Date"
                    name="established_date"
                    type="date"
                    value={formData.established_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="mt-6">
                  <Textarea
                    label="Company Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the company"
                    rows={3}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <User className="h-6 w-6 mr-3 text-green-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Contact Person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    placeholder="Enter contact person name"
                  />
                  <Input
                    label="Contact Email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    required
                    error={validationErrors.contact_email}
                  />
                  <Input
                    label="Contact Phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    error={validationErrors.contact_phone}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-orange-600" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Textarea
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter complete address"
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
                    placeholder="Enter city"
                    required
                    error={validationErrors.city}
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                    required
                    error={validationErrors.country}
                  />
                </div>
              </div>

              {/* Banking Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <CreditCard className="h-6 w-6 mr-3 text-purple-600" />
                  Banking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="Bank Name"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                  />
                  <Input
                    label="Account Number"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="Enter account number"
                  />
                  <Input
                    label="IFSC Code"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    placeholder="Enter IFSC code"
                  />
                  <Input
                    label="SWIFT Code"
                    name="swift_code"
                    value={formData.swift_code}
                    onChange={handleChange}
                    placeholder="Enter SWIFT code"
                  />
                  <Input
                    label="IBAN Code"
                    name="iban_code"
                    value={formData.iban_code}
                    onChange={handleChange}
                    placeholder="Enter IBAN code"
                  />
                </div>
              </div>

              {/* Commission Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Globe className="h-6 w-6 mr-3 text-indigo-600" />
                  Commission Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="commission_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Type
                    </label>
                    <select
                      id="commission_type"
                      name="commission_type"
                      value={formData.commission_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="FIXED">Fixed Commission</option>
                      <option value="KM">KM Based</option>
                      <option value="ORDER">Order Based</option>
                    </select>
                  </div>

                  {formData.commission_type === 'KM' && (
                    <>
                      <Input
                        label="Rate per KM"
                        name="rate_per_km"
                        type="number"
                        value={formData.rate_per_km}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                      <Input
                        label="Minimum KM"
                        name="min_km"
                        type="number"
                        value={formData.min_km}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </>
                  )}

                  {formData.commission_type === 'ORDER' && (
                    <Input
                      label="Rate per Order"
                      name="rate_per_order"
                      type="number"
                      value={formData.rate_per_order}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  )}

                  {formData.commission_type === 'FIXED' && (
                    <Input
                      label="Fixed Commission Amount"
                      name="fixed_commission"
                      type="number"
                      value={formData.fixed_commission}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  )}
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-red-600" />
                  Company Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadField
                    label="Company Logo"
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
                  className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Registering...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
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