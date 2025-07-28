import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';

const EnhancedDriverFormWithCommission = ({ onSubmit, onCancel, editingDriver = null }) => {
  const [formData, setFormData] = useState({
    // Basic driver information
    driver_name: '',
    iqama: '',
    mobile: '',
    email: '',
    gender: '',
    dob: '',
    nationality: '',
    city: '',
    
    // Company and vehicle information
    assigned_company: '',
    vehicle_type: '',
    
    // Commission will be auto-filled based on company and vehicle type
    commission_data: {},
    
    // Accessories with quantities
    accessories: {}
  });

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [availableAccessories, setAvailableAccessories] = useState([]);
  const [commissionInfo, setCommissionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Vehicle type options
  const vehicleTypes = [
    { value: 'car', label: 'Car' },
    { value: 'bike', label: 'Bike/Motorcycle' }
  ];

  useEffect(() => {
    fetchCompanies();
    if (editingDriver) {
      setFormData(editingDriver);
      if (editingDriver.assigned_company) {
        handleCompanyChange(editingDriver.assigned_company);
      }
    }
  }, [editingDriver]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/companies-with-accessories/');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    }
  };

  const handleCompanyChange = async (companyId) => {
    if (!companyId) {
      setSelectedCompany(null);
      setAvailableAccessories([]);
      setCommissionInfo(null);
      setFormData(prev => ({
        ...prev,
        assigned_company: '',
        commission_data: {},
        accessories: {}
      }));
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/company-details/${companyId}/`);
      const companyData = response.data.company;
      
      setSelectedCompany(companyData);
      setAvailableAccessories(companyData.accessories);
      setCommissionInfo(companyData.commission);
      
      // Initialize accessories with zero quantities
      const initialAccessories = {};
      companyData.accessories.forEach(accessory => {
        initialAccessories[accessory.field_name] = 0;
      });
      
      setFormData(prev => ({
        ...prev,
        assigned_company: companyId,
        accessories: initialAccessories,
        commission_data: companyData.commission
      }));
      
      // Update commission display if vehicle type is already selected
      if (formData.vehicle_type) {
        updateCommissionDisplay(formData.vehicle_type, companyData.commission);
      }
      
    } catch (error) {
      console.error('Error fetching company details:', error);
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleTypeChange = (vehicleType) => {
    setFormData(prev => ({
      ...prev,
      vehicle_type: vehicleType
    }));
    
    if (commissionInfo) {
      updateCommissionDisplay(vehicleType, commissionInfo);
    }
  };

  const updateCommissionDisplay = (vehicleType, commission) => {
    const vehicleCommission = commission[vehicleType];
    if (vehicleCommission) {
      setFormData(prev => ({
        ...prev,
        current_commission: vehicleCommission
      }));
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAccessoryQuantityChange = (accessoryField, quantity) => {
    setFormData(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [accessoryField]: parseInt(quantity) || 0
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.driver_name.trim()) newErrors.driver_name = 'Driver name is required';
    if (!formData.iqama.trim()) newErrors.iqama = 'Iqama number is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.assigned_company) newErrors.assigned_company = 'Company selection is required';
    if (!formData.vehicle_type) newErrors.vehicle_type = 'Vehicle type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success('Driver saved successfully!');
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error('Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  const renderCommissionInfo = () => {
    if (!formData.current_commission) return null;
    
    const commission = formData.current_commission;
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Commission Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {commission.rate_per_km && (
            <div>
              <span className="text-gray-600">Rate per KM:</span>
              <span className="font-medium ml-2">${commission.rate_per_km}</span>
            </div>
          )}
          {commission.min_km && (
            <div>
              <span className="text-gray-600">Min KM:</span>
              <span className="font-medium ml-2">{commission.min_km}</span>
            </div>
          )}
          {commission.rate_per_order && (
            <div>
              <span className="text-gray-600">Rate per Order:</span>
              <span className="font-medium ml-2">${commission.rate_per_order}</span>
            </div>
          )}
          {commission.fixed_commission && (
            <div>
              <span className="text-gray-600">Fixed Commission:</span>
              <span className="font-medium ml-2">${commission.fixed_commission}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editingDriver ? 'Edit Driver' : 'Add New Driver'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driver Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.driver_name}
              onChange={(e) => handleInputChange('driver_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.driver_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter driver name"
            />
            {errors.driver_name && (
              <p className="text-red-500 text-sm mt-1">{errors.driver_name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Iqama Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.iqama}
              onChange={(e) => handleInputChange('iqama', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.iqama ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter Iqama number"
            />
            {errors.iqama && (
              <p className="text-red-500 text-sm mt-1">{errors.iqama}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mobile ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter mobile number"
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Company and Vehicle Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.assigned_company}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.assigned_company ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
            {errors.assigned_company && (
              <p className="text-red-500 text-sm mt-1">{errors.assigned_company}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.vehicle_type}
              onChange={(e) => handleVehicleTypeChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.vehicle_type ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!selectedCompany}
            >
              <option value="">Select Vehicle Type</option>
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.vehicle_type && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicle_type}</p>
            )}
          </div>
        </div>

        {/* Commission Information Display */}
        {renderCommissionInfo()}

        {/* Accessories Section */}
        {availableAccessories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAccessories.map(accessory => (
                <div key={accessory.field_name} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {accessory.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.accessories[accessory.field_name] || 0}
                    onChange={(e) => handleAccessoryQuantityChange(accessory.field_name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Add Driver')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedDriverFormWithCommission;
