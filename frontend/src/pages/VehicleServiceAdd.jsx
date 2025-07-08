import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Wrench,
  Save,
  X,
  Upload,
  Calendar,
  DollarSign,
  FileText,
  Car,
  Building,
  AlertTriangle,
  Info,
  ArrowLeft
} from 'lucide-react';

// Move InputField component outside to prevent re-creation on every render
const InputField = ({ label, name, type = 'text', required = false, options = null, placeholder = '', help = '', value, onChange, validationErrors = {} }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          validationErrors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select {label}</option>
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={4}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          validationErrors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    ) : type === 'file' ? (
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept={name.includes('image') ? 'image/*' : '.pdf,.doc,.docx'}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          validationErrors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          validationErrors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    )}
    {validationErrors[name] && (
      <p className="text-sm text-red-600">{validationErrors[name]}</p>
    )}
    {help && <p className="text-xs text-gray-500">{help}</p>}
  </div>
);

const VehicleServiceAdd = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');
  
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [service, setService] = useState({
    vehicle: vehicleId || '',
    service_type: 'ROUTINE',
    service_date: '',
    service_provider: '',
    service_description: '',
    cost: '',
    odometer_reading: '',
    status: 'SCHEDULED',
    parts_replaced: '',
    warranty_period_days: '',
    next_service_km: '',
    invoice_document: null,
    service_report: null
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setVehiclesLoading(true);
    try {
      console.log('🚗 Fetching vehicles for service form...');
      const response = await axiosInstance.get('/vehicles/');

      // Handle different response formats
      let vehiclesData = [];
      if (Array.isArray(response.data)) {
        vehiclesData = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        vehiclesData = response.data.results;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        vehiclesData = response.data.data;
      }

      console.log('✅ Fetched vehicles:', vehiclesData.length);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
      setVehicles([]); // Ensure vehicles is always an array
    } finally {
      setVehiclesLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!service.vehicle) errors.vehicle = 'Vehicle selection is required';
    if (!service.service_type) errors.service_type = 'Service type is required';
    if (!service.service_date) errors.service_date = 'Service date is required';
    if (!service.service_provider.trim()) errors.service_provider = 'Service provider is required';
    if (!service.service_description.trim()) errors.service_description = 'Service description is required';
    if (!service.cost) errors.cost = 'Cost is required';
    if (!service.odometer_reading) errors.odometer_reading = 'Odometer reading is required';
    if (!service.status) errors.status = 'Status is required';

    // Date validation
    if (service.service_date) {
      const serviceDate = new Date(service.service_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (serviceDate > today) {
        // Allow future dates for scheduled services
        if (service.status === 'COMPLETED' && serviceDate > today) {
          errors.service_date = 'Completed services cannot have future dates';
        }
      }
    }

    // Numeric validation
    if (service.cost && parseFloat(service.cost) < 0) {
      errors.cost = 'Cost cannot be negative';
    }
    if (service.odometer_reading && parseInt(service.odometer_reading) < 0) {
      errors.odometer_reading = 'Odometer reading cannot be negative';
    }
    if (service.warranty_period_days && parseInt(service.warranty_period_days) < 0) {
      errors.warranty_period_days = 'Warranty period cannot be negative';
    }
    if (service.next_service_km && parseInt(service.next_service_km) < 0) {
      errors.next_service_km = 'Next service km cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setService(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setService(prev => ({ ...prev, [name]: value }));

      // Clear validation error for this field
      if (validationErrors[name]) {
        setValidationErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append all service data
      Object.keys(service).forEach(key => {
        if (service[key] !== null && service[key] !== undefined && service[key] !== '') {
          if (service[key] instanceof File) {
            formData.append(key, service[key]);
          } else {
            formData.append(key, service[key]);
          }
        }
      });

      const response = await axiosInstance.post('/vehicle-services/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Service record added successfully!');
      navigate('/vehicle-service-management');
    } catch (error) {
      console.error('Error adding service record:', error);
      toast.error('Failed to add service record');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Schedule Vehicle Service</h1>
                <p className="text-gray-600">Add a new service record for a vehicle</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/vehicle-service-management')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Service Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicle"
                  value={service.vehicle}
                  onChange={handleChange}
                  required
                  disabled={vehiclesLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.vehicle ? 'border-red-500' : 'border-gray-300'
                  } ${vehiclesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {vehiclesLoading ? 'Loading vehicles...' : 'Select Vehicle'}
                  </option>
                  {Array.isArray(vehicles) && vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_name} ({vehicle.vehicle_number})
                    </option>
                  ))}
                </select>
                {validationErrors.vehicle && (
                  <p className="text-sm text-red-600">{validationErrors.vehicle}</p>
                )}
                {!vehiclesLoading && vehicles.length === 0 && (
                  <p className="text-sm text-yellow-600">No vehicles available</p>
                )}
              </div>
              
              <InputField
                label="Service Type"
                name="service_type"
                type="select"
                required
                value={service.service_type}
                onChange={handleChange}
                validationErrors={validationErrors}
                options={[
                  { value: 'ROUTINE', label: 'Routine Service' },
                  { value: 'REPAIR', label: 'Repair' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'INSPECTION', label: 'Inspection' },
                  { value: 'EMERGENCY', label: 'Emergency Repair' },
                  { value: 'ACCIDENT_REPAIR', label: 'Accident Repair' }
                ]}
              />

              <InputField
                label="Service Date"
                name="service_date"
                type="date"
                required
                value={service.service_date}
                onChange={handleChange}
                validationErrors={validationErrors}
              />

              <InputField
                label="Service Provider"
                name="service_provider"
                required
                placeholder="e.g., ABC Auto Service"
                value={service.service_provider}
                onChange={handleChange}
                validationErrors={validationErrors}
              />

              <InputField
                label="Cost"
                name="cost"
                type="number"
                step="0.01"
                required
                placeholder="Service cost"
                value={service.cost}
                onChange={handleChange}
                validationErrors={validationErrors}
              />

              <InputField
                label="Odometer Reading"
                name="odometer_reading"
                type="number"
                required
                placeholder="Current odometer reading"
                help="Odometer reading at the time of service"
                value={service.odometer_reading}
                onChange={handleChange}
                validationErrors={validationErrors}
              />

              <InputField
                label="Status"
                name="status"
                type="select"
                required
                value={service.status}
                onChange={handleChange}
                validationErrors={validationErrors}
                options={[
                  { value: 'SCHEDULED', label: 'Scheduled' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' }
                ]}
              />

              <InputField
                label="Warranty Period (Days)"
                name="warranty_period_days"
                type="number"
                placeholder="e.g., 90"
                help="Warranty period for the service"
                value={service.warranty_period_days}
                onChange={handleChange}
                validationErrors={validationErrors}
              />

              <InputField
                label="Next Service KM"
                name="next_service_km"
                type="number"
                placeholder="e.g., 15000"
                help="Odometer reading for next service"
                value={service.next_service_km}
                onChange={handleChange}
                validationErrors={validationErrors}
              />
            </div>
            
            <div className="mt-6">
              <InputField
                label="Service Description"
                name="service_description"
                type="textarea"
                required
                placeholder="Describe the service work performed..."
                value={service.service_description}
                onChange={handleChange}
                validationErrors={validationErrors}
              />
            </div>

            <div className="mt-6">
              <InputField
                label="Parts Replaced"
                name="parts_replaced"
                type="textarea"
                placeholder="List of parts replaced during service..."
                value={service.parts_replaced}
                onChange={handleChange}
                validationErrors={validationErrors}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField
                label="Invoice Document"
                name="invoice_document"
                type="file"
                help="Upload service invoice (PDF, DOC)"
                value=""
                onChange={handleChange}
                validationErrors={validationErrors}
              />

              <InputField
                label="Service Report"
                name="service_report"
                type="file"
                help="Upload service report (PDF, DOC)"
                value=""
                onChange={handleChange}
                validationErrors={validationErrors}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/vehicle-service-management')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Adding...' : 'Add Service Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleServiceAdd;
