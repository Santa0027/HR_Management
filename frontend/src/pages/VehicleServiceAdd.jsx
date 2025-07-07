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

const VehicleServiceAdd = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');
  
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  
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
    try {
      const response = await axiosInstance.get('/vehicles/');
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setService(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setService(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const InputField = ({ label, name, type = 'text', required = false, options = null, placeholder = '', help = '' }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={service[name]}
          onChange={handleChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          value={service[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : type === 'file' ? (
        <input
          type="file"
          name={name}
          onChange={handleChange}
          accept={name.includes('image') ? 'image/*' : '.pdf,.doc,.docx'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={service[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  );

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
              <InputField
                label="Vehicle"
                name="vehicle"
                type="select"
                required
                options={vehicles.map(vehicle => ({
                  value: vehicle.id,
                  label: `${vehicle.vehicle_name} (${vehicle.vehicle_number})`
                }))}
              />
              
              <InputField
                label="Service Type"
                name="service_type"
                type="select"
                required
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
              />
              
              <InputField
                label="Service Provider"
                name="service_provider"
                required
                placeholder="e.g., ABC Auto Service"
              />
              
              <InputField
                label="Cost"
                name="cost"
                type="number"
                step="0.01"
                required
                placeholder="Service cost"
              />
              
              <InputField
                label="Odometer Reading"
                name="odometer_reading"
                type="number"
                required
                placeholder="Current odometer reading"
                help="Odometer reading at the time of service"
              />
              
              <InputField
                label="Status"
                name="status"
                type="select"
                required
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
              />
              
              <InputField
                label="Next Service KM"
                name="next_service_km"
                type="number"
                placeholder="e.g., 15000"
                help="Odometer reading for next service"
              />
            </div>
            
            <div className="mt-6">
              <InputField
                label="Service Description"
                name="service_description"
                type="textarea"
                required
                placeholder="Describe the service work performed..."
              />
            </div>
            
            <div className="mt-6">
              <InputField
                label="Parts Replaced"
                name="parts_replaced"
                type="textarea"
                placeholder="List of parts replaced during service..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField
                label="Invoice Document"
                name="invoice_document"
                type="file"
                help="Upload service invoice (PDF, DOC)"
              />
              
              <InputField
                label="Service Report"
                name="service_report"
                type="file"
                help="Upload service report (PDF, DOC)"
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
