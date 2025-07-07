import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Car,
  Save,
  X,
  Upload,
  Calendar,
  DollarSign,
  User,
  Phone,
  MapPin,
  Key,
  FileText,
  CreditCard,
  ArrowLeft,
  Info,
  Calculator
} from 'lucide-react';

const VehicleRentalAdd = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('lessee');

  const [lease, setLease] = useState({
    // Vehicle and Lessee Info
    vehicle: vehicleId || '',
    lessee_name: '',
    lessee_contact: '',
    lessee_license: '',
    lessee_address: '',

    // Lease Period
    lease_start_date: '',
    lease_end_date: '',
    total_months: '',

    // Pricing
    monthly_rate: '',
    base_amount: '',
    security_deposit: '',
    additional_charges: '0',
    discount: '0',
    total_amount: '',

    // Vehicle Condition
    pickup_odometer: '',
    pickup_fuel_level: 'FULL',
    pickup_notes: '',

    // Status
    lease_status: 'ACTIVE',
    payment_status: 'PENDING',
    lease_type: 'BUSINESS',

    // Documents
    lease_agreement: null,
    pickup_inspection_report: null
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    // Calculate total months when dates change
    if (lease.lease_start_date && lease.lease_end_date) {
      const startDate = new Date(lease.lease_start_date);
      const endDate = new Date(lease.lease_end_date);
      const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      setLease(prev => ({ ...prev, total_months: diffMonths }));
    }
  }, [lease.lease_start_date, lease.lease_end_date]);

  useEffect(() => {
    // Calculate amounts when relevant fields change
    if (lease.monthly_rate && lease.total_months) {
      const baseAmount = parseFloat(lease.monthly_rate) * parseInt(lease.total_months);
      const additionalCharges = parseFloat(lease.additional_charges) || 0;
      const discount = parseFloat(lease.discount) || 0;
      const securityDeposit = parseFloat(lease.security_deposit) || 0;
      const totalAmount = baseAmount + additionalCharges - discount + securityDeposit;

      setLease(prev => ({
        ...prev,
        base_amount: baseAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2)
      }));
    }
  }, [lease.monthly_rate, lease.total_months, lease.additional_charges, lease.discount, lease.security_deposit]);

  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance.get('/vehicles/');
      // Filter only available vehicles
      const availableVehicles = (response.data || []).filter(vehicle => 
        vehicle.vehicle_status === 'ACTIVE' && !vehicle.assigned_driver
      );
      setVehicles(availableVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setLease(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setLease(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // Append all lease data
      Object.keys(lease).forEach(key => {
        if (lease[key] !== null && lease[key] !== undefined && lease[key] !== '') {
          if (lease[key] instanceof File) {
            formData.append(key, lease[key]);
          } else {
            formData.append(key, lease[key]);
          }
        }
      });

      // Convert dates to datetime format
      if (lease.lease_start_date) {
        const startDateTime = new Date(lease.lease_start_date + 'T09:00:00');
        formData.set('lease_start_date', startDateTime.toISOString());
      }
      if (lease.lease_end_date) {
        const endDateTime = new Date(lease.lease_end_date + 'T18:00:00');
        formData.set('lease_end_date', endDateTime.toISOString());
      }

      const response = await axiosInstance.post('/vehicle-rentals/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Lease record created successfully!');
      navigate('/vehicle-rental-management');
    } catch (error) {
      console.error('Error creating lease:', error);
      toast.error('Failed to create lease record');
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
          value={rental[name]}
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
          value={rental[name]}
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
          accept=".pdf,.doc,.docx"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={rental[name]}
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
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Vehicle Lease</h1>
                <p className="text-gray-600">Set up a new vehicle lease agreement</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/vehicle-rental-management')}
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
                id="lessee"
                label="Lessee Info"
                icon={User}
                isActive={activeTab === 'lessee'}
                onClick={setActiveTab}
              />
              <TabButton
                id="lease"
                label="Lease Details"
                icon={Calendar}
                isActive={activeTab === 'lease'}
                onClick={setActiveTab}
              />
              <TabButton
                id="pricing"
                label="Pricing"
                icon={DollarSign}
                isActive={activeTab === 'pricing'}
                onClick={setActiveTab}
              />
              <TabButton
                id="vehicle"
                label="Vehicle Condition"
                icon={Car}
                isActive={activeTab === 'vehicle'}
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
            {activeTab === 'renter' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Renter Name"
                  name="renter_name"
                  required
                  placeholder="Full name of the renter"
                />
                <InputField
                  label="Contact Number"
                  name="renter_contact"
                  type="tel"
                  required
                  placeholder="+1-555-0123"
                />
                <InputField
                  label="Driver's License"
                  name="renter_license"
                  required
                  placeholder="License number"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    name="renter_address"
                    type="textarea"
                    required
                    placeholder="Complete address of the renter"
                  />
                </div>
              </div>
            )}

            {activeTab === 'rental' && (
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
                  label="Daily Rate"
                  name="daily_rate"
                  type="number"
                  required
                  placeholder="Rate per day"
                />
                <InputField
                  label="Start Date"
                  name="rental_start_date"
                  type="date"
                  required
                />
                <InputField
                  label="End Date"
                  name="rental_end_date"
                  type="date"
                  required
                />
                <InputField
                  label="Total Days"
                  name="total_days"
                  type="number"
                  placeholder="Auto-calculated"
                  help="Automatically calculated from dates"
                />
                <InputField
                  label="Rental Status"
                  name="rental_status"
                  type="select"
                  required
                  options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'CANCELLED', label: 'Cancelled' }
                  ]}
                />
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Base Amount"
                    name="base_amount"
                    type="number"
                    placeholder="Auto-calculated"
                    help="Daily rate × Total days"
                  />
                  <InputField
                    label="Security Deposit"
                    name="security_deposit"
                    type="number"
                    required
                    placeholder="Security deposit amount"
                  />
                  <InputField
                    label="Additional Charges"
                    name="additional_charges"
                    type="number"
                    placeholder="0.00"
                    help="Extra charges (fuel, cleaning, etc.)"
                  />
                  <InputField
                    label="Discount"
                    name="discount"
                    type="number"
                    placeholder="0.00"
                    help="Discount amount"
                  />
                  <InputField
                    label="Payment Status"
                    name="payment_status"
                    type="select"
                    required
                    options={[
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'PARTIAL', label: 'Partial' },
                      { value: 'PAID', label: 'Paid' }
                    ]}
                  />
                  <InputField
                    label="Total Amount"
                    name="total_amount"
                    type="number"
                    placeholder="Auto-calculated"
                    help="Base + Security + Additional - Discount"
                  />
                </div>
                
                {/* Pricing Summary */}
                {rental.base_amount && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Calculator className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-green-900">Pricing Summary</h4>
                        <div className="mt-2 text-sm text-green-700 space-y-1">
                          <div className="flex justify-between">
                            <span>Base Amount ({rental.total_days} days × ${rental.daily_rate}):</span>
                            <span>${rental.base_amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Security Deposit:</span>
                            <span>${rental.security_deposit || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Additional Charges:</span>
                            <span>${rental.additional_charges || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-${rental.discount || '0.00'}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t border-green-300 pt-1">
                            <span>Total Amount:</span>
                            <span>${rental.total_amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vehicle' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Pickup Odometer"
                  name="pickup_odometer"
                  type="number"
                  required
                  placeholder="Current odometer reading"
                />
                <InputField
                  label="Pickup Fuel Level"
                  name="pickup_fuel_level"
                  type="select"
                  required
                  options={[
                    { value: 'FULL', label: 'Full' },
                    { value: 'THREE_QUARTER', label: '3/4' },
                    { value: 'HALF', label: '1/2' },
                    { value: 'QUARTER', label: '1/4' },
                    { value: 'EMPTY', label: 'Empty' }
                  ]}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Pickup Notes"
                    name="pickup_notes"
                    type="textarea"
                    placeholder="Vehicle condition notes at pickup..."
                    help="Document any existing damage or issues"
                  />
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Rental Agreement"
                  name="rental_agreement"
                  type="file"
                  help="Upload signed rental agreement (PDF, DOC)"
                />
                <InputField
                  label="Pickup Inspection Report"
                  name="pickup_inspection_report"
                  type="file"
                  help="Upload vehicle inspection report (PDF, DOC)"
                />
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Document Guidelines</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• Ensure all documents are signed and dated</li>
                          <li>• Include detailed vehicle condition photos</li>
                          <li>• Maximum file size: 10MB per document</li>
                          <li>• Accepted formats: PDF, DOC, DOCX</li>
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
                onClick={() => navigate('/vehicle-rental-management')}
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
                {loading ? 'Creating...' : 'Create Rental'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRentalAdd;
