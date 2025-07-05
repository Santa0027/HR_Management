import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  ChevronDown, CircleUserRound, Upload, Car, FileText,
  Save, X, AlertTriangle, CheckCircle, ArrowLeft, Calendar,
  User, Building, CreditCard, Image, Eye, Download
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// Enhanced Input field with light theme
const InputField = memo(({ label, type = "text", name, value, onChange, placeholder, required = false, error }) => (
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
      autoComplete="off"
    />
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
));

// Enhanced Select field with light theme
const SelectField = memo(({ label, name, value, onChange, options, required = false, error }) => (
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
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
));

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

// Enhanced Vehicle Registration Component
const Reg_ma_vehicle_registration = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    vehicle_name: '',
    vehicle_number: '',
    vehicle_type: 'CAR',
    image: null,
    Chassis_Number: '',
    insurance_number: '',
    insurance_document: null,
    insurance_expiry_date: '',
    service_date: '',
    rc_book_number: '',
    rc_document: null,
    is_leased: false,
    approval_status: 'PENDING',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Load vehicle data for edit mode
  useEffect(() => {
    if (isEditMode) {
      setLoadingData(true);
      axiosInstance.get(`/vehicles/${id}/`)
        .then(response => {
          const vehicleData = response.data;
          setFormData({
            vehicle_name: vehicleData.vehicle_name || '',
            vehicle_number: vehicleData.vehicle_number || '',
            vehicle_type: vehicleData.vehicle_type || 'CAR',
            image: null, // File inputs can't be pre-filled
            Chassis_Number: vehicleData.Chassis_Number || '',
            insurance_number: vehicleData.insurance_number || '',
            insurance_document: null,
            insurance_expiry_date: vehicleData.insurance_expiry_date || '',
            service_date: vehicleData.service_date || '',
            rc_book_number: vehicleData.rc_book_number || '',
            rc_document: null,
            is_leased: vehicleData.is_leased || false,
            approval_status: vehicleData.approval_status || 'PENDING',
          });
        })
        .catch(error => {
          console.error('Error loading vehicle data:', error);
          toast.error('Failed to load vehicle data');
          navigate('/vehicle-list');
        })
        .finally(() => setLoadingData(false));
    }
  }, [id, isEditMode, navigate]);

  // Enhanced change handler with validation
  const handleChange = useCallback((e) => {
    const { name, type, value, checked, files } = e.target;

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    }));
  }, [validationErrors]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.vehicle_name.trim()) {
      errors.vehicle_name = 'Vehicle name is required';
    }

    if (!formData.vehicle_number.trim()) {
      errors.vehicle_number = 'Vehicle number is required';
    }

    if (!formData.vehicle_type) {
      errors.vehicle_type = 'Vehicle type is required';
    }

    if (!formData.Chassis_Number.trim()) {
      errors.Chassis_Number = 'Chassis number is required';
    }

    if (formData.insurance_expiry_date) {
      const expiryDate = new Date(formData.insurance_expiry_date);
      const today = new Date();
      if (expiryDate < today) {
        errors.insurance_expiry_date = 'Insurance expiry date cannot be in the past';
      }
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

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key.includes('_date') && value) {
        const date = new Date(value);
        if (!isNaN(date)) {
          submitData.append(key, date.toISOString().split('T')[0]);
        }
      } else if (value !== null && value !== '') {
        submitData.append(key, value);
      }
    });

    try {
      if (isEditMode) {
        await axiosInstance.put(`/vehicles/${id}/`, submitData);
        toast.success('Vehicle updated successfully!');
      } else {
        await axiosInstance.post('/vehicles/', submitData);
        toast.success('Vehicle registered successfully!');
      }
      navigate('/vehicle-list');
    } catch (error) {
      console.error("Submission Error:", error.response?.data);
      toast.error(`Error ${isEditMode ? 'updating' : 'registering'} vehicle: ${error.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading vehicle data...</p>
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
              onClick={() => navigate('/vehicle-list')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Vehicle List
            </button>
            <div className="text-gray-500">Vehicle Management / {isEditMode ? 'Edit Vehicle' : 'Register Vehicle'}</div>
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
                <Car className="h-8 w-8 mr-3" />
                {isEditMode ? 'Edit Vehicle' : 'Register New Vehicle'}
              </h1>
              <p className="text-blue-100 mt-2">
                {isEditMode ? 'Update vehicle information and documents' : 'Add a new vehicle to the fleet management system'}
              </p>
            </div>

            {/* Enhanced Form Content */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Basic Vehicle Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Car className="h-6 w-6 mr-3 text-blue-600" />
                  Basic Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    label="Vehicle Name"
                    name="vehicle_name"
                    value={formData.vehicle_name}
                    onChange={handleChange}
                    placeholder="Enter vehicle name"
                    required
                    error={validationErrors.vehicle_name}
                  />
                  <InputField
                    label="Vehicle Number"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    placeholder="Enter vehicle number"
                    required
                    error={validationErrors.vehicle_number}
                  />
                  <SelectField
                    label="Vehicle Type"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    required
                    error={validationErrors.vehicle_type}
                    options={[
                      { value: '', label: 'Select Vehicle Type' },
                      { value: 'CAR', label: 'Car' },
                      { value: 'BIKE', label: 'Bike' },
                      { value: 'TRUCK', label: 'Truck' },
                      { value: 'BUS', label: 'Bus' },
                      { value: 'OTHER', label: 'Other' }
                    ]}
                  />
                  <InputField
                    label="Chassis Number"
                    name="Chassis_Number"
                    value={formData.Chassis_Number}
                    onChange={handleChange}
                    placeholder="Enter chassis number"
                    required
                    error={validationErrors.Chassis_Number}
                  />
                  <InputField
                    label="RC Book Number"
                    name="rc_book_number"
                    value={formData.rc_book_number}
                    onChange={handleChange}
                    placeholder="Enter RC book number"
                  />
                  <InputField
                    label="Service Date"
                    type="date"
                    name="service_date"
                    value={formData.service_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Insurance Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <CreditCard className="h-6 w-6 mr-3 text-green-600" />
                  Insurance Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Insurance Number"
                    name="insurance_number"
                    value={formData.insurance_number}
                    onChange={handleChange}
                    placeholder="Enter insurance number"
                  />
                  <InputField
                    label="Insurance Expiry Date"
                    type="date"
                    name="insurance_expiry_date"
                    value={formData.insurance_expiry_date}
                    onChange={handleChange}
                    error={validationErrors.insurance_expiry_date}
                  />
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-purple-600" />
                  Vehicle Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FileUploadField
                    label="Vehicle Image"
                    name="image"
                    file={formData.image}
                    onChange={handleChange}
                    accept="image/*"
                  />
                  <FileUploadField
                    label="Insurance Document"
                    name="insurance_document"
                    file={formData.insurance_document}
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <FileUploadField
                    label="RC Document"
                    name="rc_document"
                    file={formData.rc_document}
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </div>
              </div>

              {/* Additional Options */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Building className="h-6 w-6 mr-3 text-orange-600" />
                  Additional Information
                </h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_leased"
                    name="is_leased"
                    checked={formData.is_leased}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_leased" className="text-gray-700 font-medium">
                    Is this vehicle leased?
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/vehicle-list')}
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
                      {isEditMode ? 'Update Vehicle' : 'Register Vehicle'}
                    </>
                  )}
                </button>
                 </div> {/* This was the missing closing div */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reg_ma_vehicle_registration;