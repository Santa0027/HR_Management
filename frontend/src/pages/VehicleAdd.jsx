import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Car,
  Save,
  X,
  Upload,
  Calendar,
  DollarSign,
  FileText,
  User,
  Building,
  Fuel,
  Settings,
  Key,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';

const VehicleAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  const [vehicle, setVehicle] = useState({
    // Basic Information
    vehicle_name: '',
    vehicle_number: '',
    vehicle_type: 'CAR',
    make: '',
    model: '',
    year: '',
    color: '',
    
    // Vehicle Specifications
    engine_number: '',
    chassis_number: '',
    fuel_type: 'PETROL',
    seating_capacity: '',
    mileage_kmpl: '',
    
    // Ownership and Status
    ownership_type: 'OWN',
    vehicle_status: 'ACTIVE',
    purchase_date: '',
    purchase_price: '',
    
    // Lease/Rental Information
    lease_start_date: '',
    lease_end_date: '',
    monthly_lease_amount: '',
    lease_company: '',
    
    // Insurance Information
    insurance_number: '',
    insurance_company: '',
    insurance_expiry_date: '',
    insurance_premium: '',
    
    // Registration Information
    rc_book_number: '',
    rc_expiry_date: '',
    
    // Service and Maintenance
    last_service_date: '',
    next_service_date: '',
    service_interval_km: '10000',
    current_odometer: '0',
    
    // Driver Assignment
    assigned_driver: '',
    
    // Documents
    image: null,
    insurance_document: null,
    rc_document: null,
    
    // System Fields
    approval_status: 'PENDING'
  });

  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchDriversAndCompanies();
  }, []);

  const fetchDriversAndCompanies = async () => {
    try {
      // Fetch drivers and companies for dropdowns
      const [driversRes, companiesRes] = await Promise.all([
        axiosInstance.get('/drivers/'),
        axiosInstance.get('/companies/')
      ]);
      setDrivers(driversRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setVehicle(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setVehicle(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append all vehicle data
      Object.keys(vehicle).forEach(key => {
        if (vehicle[key] !== null && vehicle[key] !== undefined && vehicle[key] !== '') {
          if (vehicle[key] instanceof File) {
            formData.append(key, vehicle[key]);
          } else {
            formData.append(key, vehicle[key]);
          }
        }
      });

      const response = await axiosInstance.post('/vehicles/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Vehicle added successfully!');
      navigate(`/vehicle-profile/${response.data.id}`);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  const InputField = ({ label, name, type = 'text', required = false, options = null, placeholder = '', help = '' }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={vehicle[name]}
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
          value={vehicle[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          rows={3}
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
          value={vehicle[name]}
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
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
                <p className="text-gray-600">Register a new vehicle in the fleet</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/vehicle-management')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <TabButton
                id="basic"
                label="Basic Info"
                icon={Car}
                isActive={activeTab === 'basic'}
                onClick={setActiveTab}
              />
              <TabButton
                id="specifications"
                label="Specifications"
                icon={Settings}
                isActive={activeTab === 'specifications'}
                onClick={setActiveTab}
              />
              <TabButton
                id="ownership"
                label="Ownership"
                icon={Key}
                isActive={activeTab === 'ownership'}
                onClick={setActiveTab}
              />
              <TabButton
                id="insurance"
                label="Insurance"
                icon={Shield}
                isActive={activeTab === 'insurance'}
                onClick={setActiveTab}
              />
              <TabButton
                id="documents"
                label="Documents"
                icon={FileText}
                isActive={activeTab === 'documents'}
                onClick={setActiveTab}
              />
            </div>

            {/* Tab Content */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Vehicle Name"
                  name="vehicle_name"
                  required
                  placeholder="e.g., Toyota Camry 2023"
                />
                <InputField
                  label="Vehicle Number"
                  name="vehicle_number"
                  required
                  placeholder="e.g., ABC-123"
                />
                <InputField
                  label="Vehicle Type"
                  name="vehicle_type"
                  type="select"
                  required
                  options={[
                    { value: 'CAR', label: 'Car' },
                    { value: 'BIKE', label: 'Bike' },
                    { value: 'TRUCK', label: 'Truck' },
                    { value: 'BUS', label: 'Bus' },
                    { value: 'VAN', label: 'Van' },
                    { value: 'SUV', label: 'SUV' },
                    { value: 'PICKUP', label: 'Pickup' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                />
                <InputField
                  label="Make"
                  name="make"
                  placeholder="e.g., Toyota"
                />
                <InputField
                  label="Model"
                  name="model"
                  placeholder="e.g., Camry"
                />
                <InputField
                  label="Year"
                  name="year"
                  type="number"
                  placeholder="e.g., 2023"
                />
                <InputField
                  label="Color"
                  name="color"
                  placeholder="e.g., White"
                />
                <InputField
                  label="Assigned Driver"
                  name="assigned_driver"
                  type="select"
                  options={drivers.map(driver => ({
                    value: driver.id,
                    label: driver.driver_name
                  }))}
                />
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Engine Number"
                  name="engine_number"
                  placeholder="Engine identification number"
                />
                <InputField
                  label="Chassis Number"
                  name="chassis_number"
                  placeholder="Chassis identification number"
                />
                <InputField
                  label="Fuel Type"
                  name="fuel_type"
                  type="select"
                  required
                  options={[
                    { value: 'PETROL', label: 'Petrol' },
                    { value: 'DIESEL', label: 'Diesel' },
                    { value: 'ELECTRIC', label: 'Electric' },
                    { value: 'HYBRID', label: 'Hybrid' },
                    { value: 'CNG', label: 'CNG' },
                    { value: 'LPG', label: 'LPG' }
                  ]}
                />
                <InputField
                  label="Seating Capacity"
                  name="seating_capacity"
                  type="number"
                  placeholder="Number of seats"
                />
                <InputField
                  label="Mileage (km/L)"
                  name="mileage_kmpl"
                  type="number"
                  step="0.1"
                  placeholder="Fuel efficiency"
                />
                <InputField
                  label="Current Odometer (km)"
                  name="current_odometer"
                  type="number"
                  placeholder="Current reading"
                />
                <InputField
                  label="Service Interval (km)"
                  name="service_interval_km"
                  type="number"
                  placeholder="Service frequency"
                  help="Default: 10,000 km"
                />
              </div>
            )}

            {activeTab === 'ownership' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Ownership Type"
                  name="ownership_type"
                  type="select"
                  required
                  options={[
                    { value: 'OWN', label: 'Owned' },
                    { value: 'LEASE', label: 'Leased' },
                    { value: 'RENTAL', label: 'Rental' },
                    { value: 'FINANCE', label: 'Financed' }
                  ]}
                />
                <InputField
                  label="Vehicle Status"
                  name="vehicle_status"
                  type="select"
                  required
                  options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' },
                    { value: 'MAINTENANCE', label: 'Under Maintenance' },
                    { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
                    { value: 'RETIRED', label: 'Retired' }
                  ]}
                />
                <InputField
                  label="Purchase Date"
                  name="purchase_date"
                  type="date"
                />
                <InputField
                  label="Purchase Price"
                  name="purchase_price"
                  type="number"
                  step="0.01"
                  placeholder="Purchase amount"
                />
                {vehicle.ownership_type === 'LEASE' && (
                  <>
                    <InputField
                      label="Lease Start Date"
                      name="lease_start_date"
                      type="date"
                    />
                    <InputField
                      label="Lease End Date"
                      name="lease_end_date"
                      type="date"
                    />
                    <InputField
                      label="Monthly Lease Amount"
                      name="monthly_lease_amount"
                      type="number"
                      step="0.01"
                      placeholder="Monthly payment"
                    />
                    <InputField
                      label="Lease Company"
                      name="lease_company"
                      placeholder="Leasing company name"
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === 'insurance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Insurance Number"
                  name="insurance_number"
                  placeholder="Policy number"
                />
                <InputField
                  label="Insurance Company"
                  name="insurance_company"
                  placeholder="Insurance provider"
                />
                <InputField
                  label="Insurance Expiry Date"
                  name="insurance_expiry_date"
                  type="date"
                />
                <InputField
                  label="Insurance Premium"
                  name="insurance_premium"
                  type="number"
                  step="0.01"
                  placeholder="Annual premium"
                />
                <InputField
                  label="RC Book Number"
                  name="rc_book_number"
                  placeholder="Registration certificate number"
                />
                <InputField
                  label="RC Expiry Date"
                  name="rc_expiry_date"
                  type="date"
                />
                <InputField
                  label="Last Service Date"
                  name="last_service_date"
                  type="date"
                />
                <InputField
                  label="Next Service Date"
                  name="next_service_date"
                  type="date"
                />
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Vehicle Image"
                  name="image"
                  type="file"
                  help="Upload vehicle photo (JPG, PNG)"
                />
                <InputField
                  label="Insurance Document"
                  name="insurance_document"
                  type="file"
                  help="Upload insurance policy (PDF, DOC)"
                />
                <InputField
                  label="RC Document"
                  name="rc_document"
                  type="file"
                  help="Upload registration certificate (PDF, DOC)"
                />
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Document Upload Guidelines</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• Maximum file size: 10MB per document</li>
                          <li>• Accepted formats: PDF, DOC, DOCX for documents; JPG, PNG for images</li>
                          <li>• Ensure documents are clear and readable</li>
                          <li>• You can update documents later from the vehicle profile</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/vehicle-management')}
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
                {loading ? 'Adding...' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleAdd;
