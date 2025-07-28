import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Car, 
  Building2, 
  Save, 
  ArrowLeft,
  AlertTriangle,
  X
} from 'lucide-react';

const NewDriverApplicationEdit = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/new-driver-applications/${applicationId}/`);
      if (response.data.success) {
        const data = response.data.data;
        // Format dates for input fields
        const processedData = {
          ...data,
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          kuwait_entry_date: data.kuwait_entry_date ? data.kuwait_entry_date.split('T')[0] : '',
        };
        setFormData(processedData);
        setOriginalData(processedData);
      } else {
        throw new Error(response.data.error || 'Failed to fetch application');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      setError('Failed to load application details. Please try again.');
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name?.trim()) errors.full_name = 'Full name is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!formData.nationality?.trim()) errors.nationality = 'Nationality is required';
    if (!formData.phone_number?.trim()) errors.phone_number = 'Phone number is required';
    if (!formData.vehicle_type) errors.vehicle_type = 'Vehicle type is required';
    if (!formData.city?.trim()) errors.city = 'City is required';
    if (!formData.apartment_area?.trim()) errors.apartment_area = 'Apartment/Area is required';
    if (!formData.nominee_name?.trim()) errors.nominee_name = 'Nominee name is required';
    if (!formData.nominee_phone?.trim()) errors.nominee_phone = 'Nominee phone is required';
    if (!formData.kuwait_entry_date) errors.kuwait_entry_date = 'Kuwait entry date is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.put(`/new-driver-applications/${applicationId}/`, formData);
      if (response.data.success) {
        toast.success('Application updated successfully!');
        navigate(`/new-driver-applications/${applicationId}`);
      } else {
        throw new Error(response.data.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error('Failed to update application');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/new-driver-applications/${applicationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Application</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => navigate('/new-driver-applications')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Applications
            </button>
            <button
              onClick={fetchApplication}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Driver Application</h1>
                <p className="text-gray-600 mt-1">Application #{formData.application_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="h-5 w-5 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-6 w-6 mr-3 text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {validationErrors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {validationErrors.gender && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.date_of_birth && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.date_of_birth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nationality || ''}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.nationality ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter nationality"
                />
                {validationErrors.nationality && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.nationality}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {validationErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter age"
                  min="18"
                  max="70"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Phone className="h-6 w-6 mr-3 text-green-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.phone_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {validationErrors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Country Phone</label>
                <input
                  type="tel"
                  value={formData.home_country_phone || ''}
                  onChange={(e) => handleInputChange('home_country_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter home country phone"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment/Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.apartment_area || ''}
                  onChange={(e) => handleInputChange('apartment_area', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.apartment_area ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter apartment/area"
                />
                {validationErrors.apartment_area && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.apartment_area}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Country Address</label>
                <textarea
                  value={formData.home_country_address || ''}
                  onChange={(e) => handleInputChange('home_country_address', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter home country address"
                />
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Building2 className="h-6 w-6 mr-3 text-blue-600" />
              Work Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vehicle_type || ''}
                  onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.vehicle_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike/Motorcycle</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
                {validationErrors.vehicle_type && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.vehicle_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Destination</label>
                <input
                  type="text"
                  value={formData.vehicle_destination || ''}
                  onChange={(e) => handleInputChange('vehicle_destination', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter vehicle destination"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kuwait Entry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.kuwait_entry_date || ''}
                  onChange={(e) => handleInputChange('kuwait_entry_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.kuwait_entry_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.kuwait_entry_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.kuwait_entry_date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Physical Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-6 w-6 mr-3 text-red-600" />
              Physical Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                <select
                  value={formData.marital_status || ''}
                  onChange={(e) => handleInputChange('marital_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  value={formData.blood_group || ''}
                  onChange={(e) => handleInputChange('blood_group', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">T-Shirt Size</label>
                <select
                  value={formData.t_shirt_size || ''}
                  onChange={(e) => handleInputChange('t_shirt_size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="XXXL">XXXL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter weight"
                  min="40"
                  max="200"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter height"
                  min="140"
                  max="220"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Nominee Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-6 w-6 mr-3 text-purple-600" />
              Nominee Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nominee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nominee_name || ''}
                  onChange={(e) => handleInputChange('nominee_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.nominee_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter nominee name"
                />
                {validationErrors.nominee_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.nominee_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <select
                  value={formData.nominee_relationship || ''}
                  onChange={(e) => handleInputChange('nominee_relationship', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nominee Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.nominee_phone || ''}
                  onChange={(e) => handleInputChange('nominee_phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.nominee_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter nominee phone"
                />
                {validationErrors.nominee_phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.nominee_phone}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nominee Address</label>
                <textarea
                  value={formData.nominee_address || ''}
                  onChange={(e) => handleInputChange('nominee_address', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter nominee address"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDriverApplicationEdit;
