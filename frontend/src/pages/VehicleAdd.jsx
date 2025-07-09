import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Car, Save, X, FileText,
  Settings, Key, Shield, Info
} from 'lucide-react';

const VehicleAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [vehicle, setVehicle] = useState({
    vehicle_name: '',
    vehicle_number: '',
    vehicle_type: 'CAR',
    make: '',
    model: '',
    year: '',
    color: '',
    engine_number: '',
    chassis_number: '',
    fuel_type: 'PETROL',
    seating_capacity: '',
    mileage_kmpl: '',
    ownership_type: 'OWN',
    vehicle_status: 'ACTIVE',
    purchase_date: '',
    purchase_price: '',
    lease_start_date: '',
    lease_end_date: '',
    monthly_lease_amount: '',
    lease_company: '',
    insurance_number: '',
    insurance_company: '',
    insurance_expiry_date: '',
    insurance_premium: '',
    rc_book_number: '',
    rc_expiry_date: '',
    last_service_date: '',
    next_service_date: '',
    service_interval_km: '10000',
    current_odometer: '0',
    assigned_driver: '',
    image: null,
    insurance_document: null,
    rc_document: null,
    approval_status: 'PENDING',
  });

  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchDriversAndCompanies();
  }, []);

  const fetchDriversAndCompanies = async () => {
    try {
      const [driversRes, companiesRes] = await Promise.all([
        axiosInstance.get('/Register/drivers/'),
        axiosInstance.get('/companies/')
      ]);
      console.log('Drivers API response:', driversRes.data);
      console.log('Companies API response:', companiesRes.data);

      setDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
      setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setVehicle(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(vehicle).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '')
          formData.append(key, val);
      });

      const res = await axiosInstance.post('/vehicles/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Vehicle added successfully!');
      navigate(`/vehicle-profile/${res.data.id}`);
    } catch (err) {
      console.error('Error adding vehicle:', err);
      toast.error('Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  const InputField = ({
    label, name, type = 'text', required = false,
    options = null, placeholder = '', help = ''
  }) => (
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
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select {label}</option>
          {Array.isArray(options) &&
            options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
      ) : type === 'file' ? (
        <input
          type="file"
          name={name}
          onChange={handleChange}
          accept={name.includes('image') ? 'image/*' : '.pdf,.doc,.docx'}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={vehicle[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      )}
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  );

  const driverOptions = drivers.map(d => ({
    value: d.id, label: d.driver_name
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
              <p className="text-gray-600">Register a new vehicle in the fleet</p>
            </div>
          </div>
          <button onClick={() => navigate('/vehicle-management')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-2" /> Cancel
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <TabButton id="basic" label="Basic Info" icon={Car} />
              <TabButton id="specifications" label="Specifications" icon={Settings} />
              <TabButton id="ownership" label="Ownership" icon={Key} />
              <TabButton id="insurance" label="Insurance" icon={Shield} />
              <TabButton id="documents" label="Documents" icon={FileText} />
            </div>

            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Vehicle Name" name="vehicle_name" required placeholder="e.g., Toyota Camry 2023" />
                <InputField label="Vehicle Number" name="vehicle_number" required placeholder="e.g., ABC-123" />
                <InputField label="Vehicle Type" name="vehicle_type" type="select" required options={[
                  { value: 'CAR', label: 'Car' },
                  { value: 'BIKE', label: 'Bike' },
                  { value: 'TRUCK', label: 'Truck' },
                  { value: 'BUS', label: 'Bus' },
                  { value: 'VAN', label: 'Van' },
                  { value: 'SUV', label: 'SUV' },
                  { value: 'PICKUP', label: 'Pickup' },
                  { value: 'OTHER', label: 'Other' }
                ]} />
                <InputField label="Make" name="make" placeholder="e.g., Toyota" />
                <InputField label="Model" name="model" placeholder="e.g., Camry" />
                <InputField label="Year" name="year" type="number" placeholder="e.g., 2023" />
                <InputField label="Color" name="color" placeholder="e.g., White" />
                <InputField label="Assigned Driver" name="assigned_driver" type="select" options={driverOptions} />
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Engine Number" name="engine_number" placeholder="Engine identification number" />
                <InputField label="Chassis Number" name="chassis_number" placeholder="Chassis identification number" />
                <InputField label="Fuel Type" name="fuel_type" type="select" required options={[
                  { value: 'PETROL', label: 'Petrol' },
                  { value: 'DIESEL', label: 'Diesel' },
                  { value: 'ELECTRIC', label: 'Electric' },
                  { value: 'HYBRID', label: 'Hybrid' },
                  { value: 'CNG', label: 'CNG' },
                  { value: 'LPG', label: 'LPG' }
                ]} />
                <InputField label="Seating Capacity" name="seating_capacity" type="number" placeholder="Number of seats" />
                <InputField label="Mileage (km/L)" name="mileage_kmpl" type="number" step="0.1" placeholder="Fuel efficiency" />
                <InputField label="Current Odometer (km)" name="current_odometer" type="number" placeholder="Current reading" />
                <InputField label="Service Interval (km)" name="service_interval_km" type="number" placeholder="Service frequency" help="Default: 10,000 km" />
              </div>
            )}

            {activeTab === 'ownership' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Ownership Type" name="ownership_type" type="select" required options={[
                  { value: 'OWN', label: 'Owned' },
                  { value: 'LEASE', label: 'Leased' },
                  { value: 'RENTAL', label: 'Rental' },
                  { value: 'FINANCE', label: 'Financed' }
                ]} />
                <InputField label="Vehicle Status" name="vehicle_status" type="select" required options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                  { value: 'MAINTENANCE', label: 'Under Maintenance' },
                  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
                  { value: 'RETIRED', label: 'Retired' }
                ]} />
                <InputField label="Purchase Date" name="purchase_date" type="date" />
                <InputField label="Purchase Price" name="purchase_price" type="number" step="0.01" placeholder="Purchase amount" />
                {vehicle.ownership_type === 'LEASE' && (
                  <>
                    <InputField label="Lease Start Date" name="lease_start_date" type="date" />
                    <InputField label="Lease End Date" name="lease_end_date" type="date" />
                    <InputField label="Monthly Lease Amount" name="monthly_lease_amount" type="number" step="0.01" placeholder="Monthly payment" />
                    <InputField label="Lease Company" name="lease_company" placeholder="Leasing company name" />
                  </>
                )}
              </div>
            )}

            {activeTab === 'insurance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Insurance Number" name="insurance_number" placeholder="Policy number" />
                <InputField label="Insurance Company" name="insurance_company" placeholder="Provider name" />
                <InputField label="Insurance Expiry Date" name="insurance_expiry_date" type="date" />
                <InputField label="Insurance Premium" name="insurance_premium" type="number" step="0.01" placeholder="Annual premium" />
                <InputField label="RC Book Number" name="rc_book_number" placeholder="Registration cert number" />
                <InputField label="RC Expiry Date" name="rc_expiry_date" type="date" />
                <InputField label="Last Service Date" name="last_service_date" type="date" />
                <InputField label="Next Service Date" name="next_service_date" type="date" />
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Vehicle Image" name="image" type="file" help="Upload photo (JPG, PNG)" />
                <InputField label="Insurance Document" name="insurance_document" type="file" help="Upload insurance (PDF/DOC)" />
                <InputField label="RC Document" name="rc_document" type="file" help="Upload RC (PDF/DOC)" />
                <div className="md:col-span-2 bg-blue-50 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Document Upload Guidelines</h4>
                      <ul className="mt-2 text-sm text-blue-700 space-y-1">
                        <li>• Max file size: 10MB</li>
                        <li>• Formats: JPG/PNG for images, PDF/DOC/DOCX for docs</li>
                        <li>• Ensure clarity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/vehicle-management')}
              className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleAdd;
