import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Fuel,
  Save,
  X,
  Upload,
  Calendar,
  DollarSign,
  Car,
  User,
  MapPin,
  Receipt,
  ArrowLeft,
  Info
} from 'lucide-react';

const VehicleFuelAdd = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');
  
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const [fuelRecord, setFuelRecord] = useState({
    vehicle: vehicleId || '',
    driver: '',
    fuel_date: new Date().toISOString().split('T')[0],
    fuel_type: 'PETROL',
    quantity_liters: '',
    cost_per_liter: '',
    total_cost: '',
    odometer_reading: '',
    fuel_station: '',
    receipt_number: '',
    receipt_image: null,
    trip_purpose: '',
    distance_covered: ''
  });

  useEffect(() => {
    fetchVehiclesAndDrivers();
  }, []);

  useEffect(() => {
    // Calculate total cost when quantity or cost per liter changes
    if (fuelRecord.quantity_liters && fuelRecord.cost_per_liter) {
      const total = parseFloat(fuelRecord.quantity_liters) * parseFloat(fuelRecord.cost_per_liter);
      setFuelRecord(prev => ({ ...prev, total_cost: total.toFixed(2) }));
    }
  }, [fuelRecord.quantity_liters, fuelRecord.cost_per_liter]);

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        axiosInstance.get('/vehicles/'),
        axiosInstance.get('/drivers/')
      ]);
      setVehicles(vehiclesRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFuelRecord(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFuelRecord(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append all fuel record data
      Object.keys(fuelRecord).forEach(key => {
        if (fuelRecord[key] !== null && fuelRecord[key] !== undefined && fuelRecord[key] !== '') {
          if (fuelRecord[key] instanceof File) {
            formData.append(key, fuelRecord[key]);
          } else {
            formData.append(key, fuelRecord[key]);
          }
        }
      });

      // Convert date to datetime format
      if (fuelRecord.fuel_date) {
        const dateTime = new Date(fuelRecord.fuel_date + 'T' + new Date().toTimeString().split(' ')[0]);
        formData.set('fuel_date', dateTime.toISOString());
      }

      const response = await axiosInstance.post('/vehicle-fuel/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Fuel record added successfully!');
      navigate('/vehicle-fuel-management');
    } catch (error) {
      console.error('Error adding fuel record:', error);
      toast.error('Failed to add fuel record');
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
          value={fuelRecord[name]}
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
      ) : type === 'file' ? (
        <input
          type="file"
          name={name}
          onChange={handleChange}
          accept="image/*"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={fuelRecord[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          step={type === 'number' ? '0.01' : undefined}
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
                <Fuel className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Fuel Record</h1>
                <p className="text-gray-600">Record fuel purchase for a vehicle</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/vehicle-fuel-management')}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Fuel Purchase Details</h2>
            
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
                label="Driver"
                name="driver"
                type="select"
                options={drivers.map(driver => ({
                  value: driver.id,
                  label: driver.driver_name
                }))}
              />
              
              <InputField
                label="Fuel Date"
                name="fuel_date"
                type="date"
                required
              />
              
              <InputField
                label="Fuel Type"
                name="fuel_type"
                type="select"
                required
                options={[
                  { value: 'PETROL', label: 'Petrol' },
                  { value: 'DIESEL', label: 'Diesel' },
                  { value: 'CNG', label: 'CNG' },
                  { value: 'LPG', label: 'LPG' }
                ]}
              />
              
              <InputField
                label="Quantity (Liters)"
                name="quantity_liters"
                type="number"
                required
                placeholder="e.g., 45.5"
                help="Amount of fuel purchased"
              />
              
              <InputField
                label="Cost per Liter"
                name="cost_per_liter"
                type="number"
                required
                placeholder="e.g., 1.25"
                help="Price per liter"
              />
              
              <InputField
                label="Total Cost"
                name="total_cost"
                type="number"
                required
                placeholder="Auto-calculated"
                help="Total amount paid (auto-calculated)"
              />
              
              <InputField
                label="Odometer Reading"
                name="odometer_reading"
                type="number"
                required
                placeholder="Current odometer reading"
                help="Vehicle odometer at time of fuel purchase"
              />
              
              <InputField
                label="Fuel Station"
                name="fuel_station"
                placeholder="e.g., Shell Downtown"
                help="Name/location of fuel station"
              />
              
              <InputField
                label="Receipt Number"
                name="receipt_number"
                placeholder="e.g., SH-001234"
                help="Receipt or transaction number"
              />
              
              <InputField
                label="Trip Purpose"
                name="trip_purpose"
                placeholder="e.g., Client visit, Delivery"
                help="Purpose of the trip"
              />
              
              <InputField
                label="Distance Covered (km)"
                name="distance_covered"
                type="number"
                placeholder="e.g., 520"
                help="Distance since last fuel (for efficiency calculation)"
              />
            </div>
            
            <div className="mt-6">
              <InputField
                label="Receipt Image"
                name="receipt_image"
                type="file"
                help="Upload fuel receipt image (JPG, PNG)"
              />
            </div>
            
            {/* Fuel Efficiency Info */}
            {fuelRecord.distance_covered && fuelRecord.quantity_liters && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Fuel Efficiency</h4>
                    <p className="mt-1 text-sm text-blue-700">
                      Calculated efficiency: {(parseFloat(fuelRecord.distance_covered) / parseFloat(fuelRecord.quantity_liters)).toFixed(2)} km/L
                    </p>
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
                onClick={() => navigate('/vehicle-fuel-management')}
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
                {loading ? 'Adding...' : 'Add Fuel Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFuelAdd;
