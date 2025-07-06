import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown, CircleUserRound, Edit, Trash2, Download, Upload, Eye,
  Save, X, ArrowLeft, User, FileText, AlertTriangle, CheckCircle,
  Phone, Mail, MapPin, Calendar, Building, Car
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// --- Reusable Components (unchanged from last iteration, good to keep them separate) ---

// Reusable Input field for general text/number inputs
const Input = ({ label, name, type = "text", value, onChange, placeholder = "", readOnly = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full p-2 bg-gray-800 border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
    />
  </div>
);

// Reusable Textarea field
const Textarea = ({ label, name, value, onChange, placeholder = "", readOnly = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <textarea
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      rows="3" // Default rows for textarea
      className={`w-full p-2 bg-gray-800 border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
    ></textarea>
  </div>
);

// --- New Helper Function for File Type Determination ---

const getFileType = (fileData) => {
  if (!fileData) return 'none';

  let mimeType = '';
  if (fileData instanceof File) {
    mimeType = fileData.type;
  } else if (typeof fileData === 'string') {
    const fileName = fileData.split('/').pop();
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    } else if (extension === 'pdf') {
      mimeType = 'application/pdf';
    }
  }

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'other';
};

// --- New Component for Document Preview ---

const DocumentPreview = ({ fileUrl, fileType }) => {
  if (!fileUrl || fileType === 'none') return null;

  if (fileType === 'image') {
    return (
      <img
        src={fileUrl} // CORRECTED: Use fileUrl prop here
        alt="Document Preview"
        className="max-w-full h-auto max-h-64 object-contain rounded border border-gray-700 mt-2"
        onError={(e) => {
          e.target.style.display = 'none'; // Hide broken image icon
          e.target.nextSibling.style.display = 'block'; // Show fallback message
        }}
      />
    );
  } else if (fileType === 'pdf') {
    return (
      <embed
        src={fileUrl}
        type="application/pdf"
        width="100%"
        height="300px"
        className="rounded border border-gray-700 mt-2"
      />
    );
  }
  return null; // No preview for 'other' types
};

// --- Updated Document/File Upload, Download, and Preview Field ---

const DocumentField = ({ label, docKey, fileData, isEditing, onFileChange, onDownload }) => {
  const fileToPreview = fileData instanceof File ? URL.createObjectURL(fileData) : fileData;
  const type = getFileType(fileData);

  useEffect(() => {
    // Revoke object URL when component unmounts or fileToPreview changes
    // This is important to prevent memory leaks with createObjectURL
    return () => {
      if (fileData instanceof File && fileToPreview) {
        URL.revokeObjectURL(fileToPreview);
      }
    };
  }, [fileToPreview, fileData]);

  return (
    <div className="mb-6 p-4 border border-gray-800 rounded-lg bg-gray-850"> {/* Enhanced styling */}
      <label className="block font-medium mb-2 text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-3 mb-3">
        <p className="flex-grow p-2 bg-gray-800 rounded truncate text-gray-200">
          {fileData instanceof File ? fileData.name : (fileData ? fileData.split('/').pop() : 'No file chosen')}
        </p>
        {!isEditing ? (
          <div className="flex space-x-2">
            {type !== 'none' && ( // Show Eye icon if there's a file to preview/download
              <button
                onClick={() => onDownload(fileData)}
                className="bg-blue-700 hover:bg-blue-600 text-white p-2 rounded-full flex-shrink-0 transition-colors duration-200"
                title={type === 'other' ? "Download Document" : "View Document"}
              >
                {type === 'other' ? <Download size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        ) : (
          <label htmlFor={docKey} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full cursor-pointer flex items-center space-x-2 transition-colors duration-200">
            <Upload size={18} />
            <span>{fileData ? 'Change File' : 'Upload File'}</span> {/* Improved label */}
            <input type="file" name={docKey} id={docKey} className="hidden" onChange={onFileChange} />
          </label>
        )}
      </div>
      {/* Document Preview Area (only in display mode) */}
      {!isEditing && fileToPreview && type !== 'other' && (
        <div className="bg-gray-900 p-3 rounded mt-3 text-center">
          <DocumentPreview fileUrl={fileToPreview} fileType={type} />
          <div className="text-gray-400 text-sm mt-2" style={{ display: 'none' }}>
            Preview not available or failed to load.
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main DriverProfileEditDelete Component ---

function DriverProfileEditDelete() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [driverData, setDriverData] = useState(null);
  const [initialDriverData, setInitialDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Enhanced validation function for all fields
  const validateForm = () => {
    const errors = {};

    // Personal Information
    if (!driverData.driver_name?.trim()) {
      errors.driver_name = 'Driver name is required';
    }

    if (!driverData.iqama?.trim()) {
      errors.iqama = 'Iqama number is required';
    } else if (!/^\d{10}$/.test(driverData.iqama)) {
      errors.iqama = 'Iqama must be 10 digits';
    }

    if (!driverData.mobile?.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^(\+966|966|0)?[5][0-9]{8}$/.test(driverData.mobile.replace(/\s/g, ''))) {
      errors.mobile = 'Please enter a valid Saudi mobile number';
    }

    if (driverData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!driverData.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!driverData.nationality?.trim()) {
      errors.nationality = 'Nationality is required';
    }

    if (!driverData.gender?.trim()) {
      errors.gender = 'Gender is required';
    }

    if (!driverData.dob?.trim()) {
      errors.dob = 'Date of birth is required';
    }

    // Document expiry validations
    const today = new Date();

    if (driverData.iqama_expiry) {
      const expiryDate = new Date(driverData.iqama_expiry);
      if (expiryDate < today) {
        errors.iqama_expiry = 'Iqama expiry date cannot be in the past';
      }
    }

    if (driverData.passport_expiry) {
      const expiryDate = new Date(driverData.passport_expiry);
      if (expiryDate < today) {
        errors.passport_expiry = 'Passport expiry date cannot be in the past';
      }
    }

    if (driverData.license_expiry) {
      const expiryDate = new Date(driverData.license_expiry);
      if (expiryDate < today) {
        errors.license_expiry = 'License expiry date cannot be in the past';
      }
    }

    if (driverData.visa_expiry) {
      const expiryDate = new Date(driverData.visa_expiry);
      if (expiryDate < today) {
        errors.visa_expiry = 'Visa expiry date cannot be in the past';
      }
    }

    if (driverData.medical_expiry) {
      const expiryDate = new Date(driverData.medical_expiry);
      if (expiryDate < today) {
        errors.medical_expiry = 'Medical certificate expiry date cannot be in the past';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch driver data
        const driverRes = await axiosInstance.get(`/Register/drivers/${driverId}/`);
        setDriverData(driverRes.data);
        setInitialDriverData(driverRes.data);

        // Fetch companies and vehicles for dropdowns
        const [companiesRes, vehiclesRes] = await Promise.all([
          axiosInstance.get('/companies/'),
          axiosInstance.get('/vehicles/')
        ]);

        const companiesData = companiesRes.data.results || companiesRes.data || [];
        const vehiclesData = vehiclesRes.data.results || vehiclesRes.data || [];

        setCompanies(Array.isArray(companiesData) ? companiesData : []);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load driver data. Please try again.');
        toast.error('Failed to load driver data');
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchData();
    }
  }, [driverId]);

  // Enhanced change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData(prev => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDriverData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Enhanced edit handlers
  const handleEditClick = () => {
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDriverData(initialDriverData);
    setValidationErrors({});
    toast.info('Changes cancelled');
  };

  // Enhanced save function with validation
  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving');
      return;
    }

    setSaving(true);
    const formData = new FormData();

    // Append form fields
    Object.entries(driverData).forEach(([key, value]) => {
      if (key.endsWith('_document') || key === 'driver_profile_img') {
        if (value instanceof File) {
          formData.append(key, value);
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      const res = await axiosInstance.patch(`/Register/drivers/${driverId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDriverData(res.data);
      setInitialDriverData(res.data);
      setIsEditing(false);
      setValidationErrors({});

      toast.success('Driver profile updated successfully!');

    } catch (err) {
      console.error("Error saving driver data:", err);

      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          // Handle validation errors from backend
          const backendErrors = {};
          Object.entries(err.response.data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              backendErrors[key] = value[0];
            } else {
              backendErrors[key] = value;
            }
          });
          setValidationErrors(backendErrors);
          toast.error('Please fix the validation errors');
        } else {
          toast.error(err.response.data);
        }
      } else {
        toast.error('Failed to save driver profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handles deleting driver data (DELETE request)
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete driver ${driverData.driver_name}? This action cannot be undone.`)) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/Register/drivers/${driverId}/`);
        alert('Driver deleted successfully!');
        navigate('/driver-management'); // Redirect to driver list after deletion
      } catch (err) {
        console.error("Error deleting driver:", err.response?.data || err.message);
        const errorMessage = err.response?.data ? JSON.stringify(error.response.data) : err.message;
        alert(`Delete failed! ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to handle downloading/viewing documents by opening URL
  const handleDownload = (docUrl) => {
    window.open(docUrl, '_blank');
  };

  const getFileName = (fileData) => {
    if (!fileData) return 'No file';
    if (fileData instanceof File) return fileData.name;
    return fileData.split('/').pop();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading driver profile...</p>
        </div>
      </div>
    );
  }

  if (error || !driverData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-lg text-red-400 mb-4">{error || 'Driver not found.'}</p>
          <button
            onClick={() => navigate('/registration-management')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Driver List
          </button>
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
              onClick={() => navigate('/registration-management')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Driver List
            </button>
            <div className="text-gray-500">Driver Management / Edit Profile</div>
          </div>
          <div className="flex items-center space-x-4">
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
            <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Enhanced Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
                  {driverData.driver_profile_img ? (
                    <img
                      src={driverData.driver_profile_img}
                      alt="Driver Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-16 w-16 text-white/70" />
                  </div>
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      name="driver_profile_img"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                )}
              </div>

              {/* Driver Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {driverData.driver_name || 'Driver Name'}
                </h1>
                <p className="text-blue-100 text-lg mb-4">Driver ID: #{driverData.id}</p>

                {/* Status Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {driverData.status?.toUpperCase() || 'PENDING'}
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Driver Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="driver_name"
                      value={driverData.driver_name || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {driverData.driver_name || 'N/A'}
                    </div>
                  )}
                  {validationErrors.driver_name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationErrors.driver_name}
                    </p>
                  )}
                </div>

                {/* Iqama Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Iqama Number <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="iqama"
                      value={driverData.iqama || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter 10-digit Iqama number"
                      maxLength="10"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {driverData.iqama || 'N/A'}
                    </div>
                  )}
                  {validationErrors.iqama && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationErrors.iqama}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={driverData.email || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {driverData.email || 'N/A'}
                    </div>
                  )}
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="mobile"
                      value={driverData.mobile || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter Saudi mobile number"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {driverData.mobile || 'N/A'}
                    </div>
                  )}
                  {validationErrors.mobile && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationErrors.mobile}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={driverData.city || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter city"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {driverData.city || 'N/A'}
                    </div>
                  )}
                  {validationErrors.city && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationErrors.city}
                    </p>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nationality"
                      value={driverData.nationality || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter nationality"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {driverData.nationality || 'N/A'}
                    </div>
                  )}
                  {validationErrors.nationality && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationErrors.nationality}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={driverData.gender || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {driverData.gender ? driverData.gender.charAt(0).toUpperCase() + driverData.gender.slice(1) : 'N/A'}
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dob"
                      value={driverData.dob || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {driverData.dob ? formatDate(driverData.dob) : 'N/A'}
                    </div>
                  )}
                  {validationErrors.dob && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationErrors.dob}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Company and Vehicle Assignment Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Building className="h-6 w-6 mr-3 text-blue-600" />
                Company & Vehicle Assignment
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Company <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <select
                      name="company_id"
                      value={driverData.company_id || driverData.company?.id || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Company</option>
                      {Array.isArray(companies) && companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      {driverData.company?.company_name || 'No Company Assigned'}
                    </div>
                  )}
                  {validationErrors.company_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationErrors.company_id}
                    </p>
                  )}
                </div>

                {/* Vehicle Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Vehicle (Optional)
                  </label>
                  {isEditing ? (
                    <select
                      name="vehicle_id"
                      value={driverData.vehicle_id || driverData.vehicle?.id || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Vehicle (Optional)</option>
                      {Array.isArray(vehicles) && vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_name} - {vehicle.vehicle_number || 'No Number'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                      <Car className="h-4 w-4 mr-2 text-gray-500" />
                      {driverData.vehicle ?
                        `${driverData.vehicle.vehicle_name} - ${driverData.vehicle.vehicle_number || 'No Number'}` :
                        'No Vehicle Assigned'
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                Additional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      driverData.status === 'approved' ? 'bg-green-100 text-green-800' :
                      driverData.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {driverData.status === 'approved' && <CheckCircle className="h-4 w-4 mr-1" />}
                      {driverData.status === 'rejected' && <XCircle className="h-4 w-4 mr-1" />}
                      {driverData.status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                      {driverData.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Registration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Date
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {driverData.created_at ? formatDate(driverData.created_at) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Changes
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/driver-profile/${driverId}`}
              className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Link>
            <Link
              to="/registration-management"
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Print Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverProfileEditDelete;

