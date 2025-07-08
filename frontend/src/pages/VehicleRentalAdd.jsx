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

// Move InputField component outside to prevent re-creation on every render
const InputField = ({ label, name, type = 'text', required = false, options = null, placeholder = '', help = '', value, onChange, validationErrors = {}, readOnly = false }) => (
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
        disabled={readOnly} // Added for consistency, though select is rarely readOnly
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          validationErrors[name] ? 'border-red-500' : 'border-gray-300'
        } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
        rows={3}
        readOnly={readOnly}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          validationErrors[name] ? 'border-red-500' : 'border-gray-300'
        } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
    ) : type === 'file' ? (
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept=".pdf,.doc,.docx"
        readOnly={readOnly}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          validationErrors[name] ? 'border-red-500' : 'border-gray-300'
        } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={type === 'number' ? '0.01' : undefined}
        readOnly={readOnly} // Added readOnly prop
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          validationErrors[name] ? 'border-red-500' : 'border-gray-300'
        } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
    )}
    {validationErrors[name] && (
      <p className="text-sm text-red-600">{validationErrors[name]}</p>
    )}
    {help && <p className="text-xs text-gray-500">{help}</p>}
  </div>
);

const VehicleRentalAdd = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('lessee');
  const [validationErrors, setValidationErrors] = useState({});

  const [lease, setLease] = useState({
    // Vehicle and Lessee Info
    vehicle: vehicleId || '',
    lessee_name: '',
    lessee_contact: '',
    lessee_email: '',
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

    // Payment Terms
    payment_frequency: 'MONTHLY',
    payment_method: 'BANK_TRANSFER',
    late_fee_percentage: '5',

    // Vehicle Condition
    pickup_odometer: '',
    pickup_fuel_level: 'FULL',
    pickup_notes: '',

    // Lease Terms
    mileage_limit: '',
    maintenance_responsibility: 'LESSEE',
    insurance_responsibility: 'LESSEE',

    // Status
    lease_status: 'PENDING',
    payment_status: 'PENDING',
    lease_type: 'BUSINESS',

    // Documents
    lease_agreement: null,
    pickup_inspection_report: null,
    business_license_document: null,
    insurance_certificate: null
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    // Calculate total months when dates change
    if (lease.lease_start_date && lease.lease_end_date) {
      const startDate = new Date(lease.lease_start_date);
      const endDate = new Date(lease.lease_end_date);
      // Ensure endDate is strictly after startDate before calculating months
      if (endDate > startDate) {
        const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        setLease(prev => ({ ...prev, total_months: diffMonths.toString() })); // Store as string for consistency with other inputs
      } else {
        setLease(prev => ({ ...prev, total_months: '' })); // Clear if dates are invalid
      }
    } else {
      setLease(prev => ({ ...prev, total_months: '' })); // Clear if dates are incomplete
    }
  }, [lease.lease_start_date, lease.lease_end_date]);

  useEffect(() => {
    // Calculate amounts when relevant fields change
    const monthlyRate = parseFloat(lease.monthly_rate) || 0;
    const totalMonths = parseInt(lease.total_months) || 0;
    const additionalCharges = parseFloat(lease.additional_charges) || 0;
    const discount = parseFloat(lease.discount) || 0;
    const securityDeposit = parseFloat(lease.security_deposit) || 0;

    let baseAmount = (monthlyRate * totalMonths);
    if (isNaN(baseAmount) || !isFinite(baseAmount)) baseAmount = 0; // Handle NaN/Infinity

    let totalAmount = baseAmount + additionalCharges - discount + securityDeposit;
    if (isNaN(totalAmount) || !isFinite(totalAmount)) totalAmount = 0; // Handle NaN/Infinity


    setLease(prev => ({
      ...prev,
      base_amount: baseAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2)
    }));

  }, [lease.monthly_rate, lease.total_months, lease.additional_charges, lease.discount, lease.security_deposit]);

  const fetchVehicles = async () => {
    try {
      console.log('🚗 Fetching vehicles for lease form...');
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

      // Filter only available vehicles for lease
      const availableVehicles = vehiclesData.filter(vehicle =>
        vehicle.vehicle_status === 'ACTIVE' && !vehicle.assigned_driver // Assuming 'assigned_driver' implies it's not available for new lease
      );

      console.log('✅ Available vehicles for lease:', availableVehicles.length);
      setVehicles(availableVehicles);
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
      setVehicles([]); // Ensure vehicles is always an array
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!lease.vehicle) errors.vehicle = 'Vehicle selection is required';
    if (!lease.lessee_name.trim()) errors.lessee_name = 'Lessee name is required';
    if (!lease.lessee_contact.trim()) errors.lessee_contact = 'Contact number is required';
    if (!lease.lessee_email.trim()) errors.lessee_email = 'Email address is required';
    if (!lease.lessee_license.trim()) errors.lessee_license = 'License/ID is required';
    if (!lease.lessee_address.trim()) errors.lessee_address = 'Address is required';
    if (!lease.lease_start_date) errors.lease_start_date = 'Start date is required';
    if (!lease.lease_end_date) errors.lease_end_date = 'End date is required';
    if (!lease.monthly_rate) errors.monthly_rate = 'Monthly rate is required';
    if (!lease.security_deposit) errors.security_deposit = 'Security deposit is required';
    if (!lease.pickup_odometer) errors.pickup_odometer = 'Pickup odometer reading is required';
    if (!lease.lease_type) errors.lease_type = 'Lease type is required';
    if (!lease.payment_frequency) errors.payment_frequency = 'Payment frequency is required';
    if (!lease.payment_method) errors.payment_method = 'Payment method is required';
    if (!lease.maintenance_responsibility) errors.maintenance_responsibility = 'Maintenance responsibility is required';
    if (!lease.insurance_responsibility) errors.insurance_responsibility = 'Insurance responsibility is required';
    if (!lease.pickup_fuel_level) errors.pickup_fuel_level = 'Pickup fuel level is required';
    if (!lease.lease_status) errors.lease_status = 'Lease status is required';
    if (!lease.payment_status) errors.payment_status = 'Payment status is required';


    // Email validation
    if (lease.lessee_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lease.lessee_email)) {
      errors.lessee_email = 'Please enter a valid email address';
    }

    // Date validation
    if (lease.lease_start_date && lease.lease_end_date) {
      const startDate = new Date(lease.lease_start_date);
      const endDate = new Date(lease.lease_end_date);
      if (endDate <= startDate) {
        errors.lease_end_date = 'End date must be after start date';
      }
    }

    // Numeric validation
    if (lease.monthly_rate && (isNaN(parseFloat(lease.monthly_rate)) || parseFloat(lease.monthly_rate) <= 0)) {
      errors.monthly_rate = 'Monthly rate must be a positive number';
    }
    if (lease.security_deposit && (isNaN(parseFloat(lease.security_deposit)) || parseFloat(lease.security_deposit) < 0)) {
      errors.security_deposit = 'Security deposit cannot be negative';
    }
    if (lease.additional_charges && isNaN(parseFloat(lease.additional_charges))) {
      errors.additional_charges = 'Additional charges must be a number';
    }
    if (lease.discount && isNaN(parseFloat(lease.discount))) {
      errors.discount = 'Discount must be a number';
    }
    if (lease.late_fee_percentage && (isNaN(parseFloat(lease.late_fee_percentage)) || parseFloat(lease.late_fee_percentage) < 0)) {
        errors.late_fee_percentage = 'Late fee percentage must be a non-negative number';
    }
    if (lease.mileage_limit && (isNaN(parseFloat(lease.mileage_limit)) || parseFloat(lease.mileage_limit) < 0)) {
        errors.mileage_limit = 'Mileage limit must be a non-negative number';
    }
    if (lease.pickup_odometer && (isNaN(parseFloat(lease.pickup_odometer)) || parseFloat(lease.pickup_odometer) < 0)) {
      errors.pickup_odometer = 'Odometer reading must be a non-negative number';
    }


    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setLease(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setLease(prev => ({ ...prev, [name]: value }));

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
      // If validation fails, stay on the first tab with an error
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        // Map field names to tab IDs (you might need a more robust mapping for a large form)
        if (['lessee_name', 'lessee_contact', 'lessee_email', 'lessee_license', 'lessee_address', 'lease_type'].includes(firstErrorField)) {
          setActiveTab('lessee');
        } else if (['vehicle', 'monthly_rate', 'lease_start_date', 'lease_end_date', 'total_months', 'lease_status'].includes(firstErrorField)) {
          setActiveTab('lease');
        } else if (['base_amount', 'security_deposit', 'additional_charges', 'discount', 'payment_status', 'total_amount'].includes(firstErrorField)) {
          setActiveTab('pricing');
        } else if (['payment_frequency', 'payment_method', 'late_fee_percentage', 'mileage_limit', 'maintenance_responsibility', 'insurance_responsibility'].includes(firstErrorField)) {
          setActiveTab('terms');
        } else if (['pickup_odometer', 'pickup_fuel_level', 'pickup_notes'].includes(firstErrorField)) {
          setActiveTab('vehicle');
        } else if (['lease_agreement', 'pickup_inspection_report', 'business_license_document', 'insurance_certificate'].includes(firstErrorField)) {
            setActiveTab('documents');
        }
      }
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Append all lease data
      Object.keys(lease).forEach(key => {
        if (lease[key] !== null && lease[key] !== undefined && lease[key] !== '') {
          if (lease[key] instanceof File) {
            formData.append(key, lease[key]);
          } else {
            // Special handling for number fields that might be stored as strings but need to be sent as numbers
            if (['monthly_rate', 'base_amount', 'security_deposit', 'additional_charges', 'discount', 'total_amount', 'total_months', 'late_fee_percentage', 'mileage_limit', 'pickup_odometer'].includes(key)) {
                formData.append(key, parseFloat(lease[key]));
            } else {
                formData.append(key, lease[key]);
            }
          }
        }
      });

      // Convert dates to datetime format (ensure they are in ISO string format for Django DRF DateTimeField)
      if (lease.lease_start_date) {
        // Append a time part to ensure it's treated as a full datetime, e.g., 00:00:00 or 09:00:00
        const startDateTime = new Date(lease.lease_start_date + 'T00:00:00'); // Assuming start of day
        formData.set('lease_start_date', startDateTime.toISOString());
      }
      if (lease.lease_end_date) {
        // Append a time part, e.g., 23:59:59 or 18:00:00
        const endDateTime = new Date(lease.lease_end_date + 'T23:59:59'); // Assuming end of day
        formData.set('lease_end_date', endDateTime.toISOString());
      }


      const response = await axiosInstance.post('/vehicle-rentals/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Lease record created successfully!');
      navigate('/vehicle-rental-management');
    } catch (error) {
      console.error('Error creating lease:', error);
      // More detailed error handling for API response
      if (error.response && error.response.data) {
        // Assuming backend returns validation errors in a structured way
        const apiErrors = error.response.data;
        let errorMessages = [];
        for (const key in apiErrors) {
          if (Array.isArray(apiErrors[key])) {
            errorMessages.push(`${key}: ${apiErrors[key].join(', ')}`);
          } else if (typeof apiErrors[key] === 'string') {
            errorMessages.push(`${key}: ${apiErrors[key]}`);
          }
        }
        if (errorMessages.length > 0) {
            toast.error(`Failed to create lease record: ${errorMessages.join('; ')}`);
        } else {
            toast.error('Failed to create lease record. Please check your input and try again.');
        }
        setValidationErrors(apiErrors); // Update validation errors with backend response
      } else {
        toast.error('Failed to create lease record. Network error or unknown issue.');
      }
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
                id="terms"
                label="Lease Terms"
                icon={FileText}
                isActive={activeTab === 'terms'}
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
                icon={Upload}
                isActive={activeTab === 'documents'}
                onClick={setActiveTab}
              />
            </div>

            {/* Tab Content */}
            {activeTab === 'lessee' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Company/Lessee Name"
                  name="lessee_name"
                  required
                  placeholder="Company or individual name"
                  value={lease.lessee_name}
                  onChange={handleChange}
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Contact Number"
                  name="lessee_contact"
                  type="tel"
                  required
                  placeholder="+1-555-0123"
                  value={lease.lessee_contact}
                  onChange={handleChange}
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Email Address"
                  name="lessee_email"
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={lease.lessee_email}
                  onChange={handleChange}
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Business License/ID"
                  name="lessee_license"
                  required
                  placeholder="Business license or ID number"
                  value={lease.lessee_license}
                  onChange={handleChange}
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Lease Type"
                  name="lease_type"
                  type="select"
                  required
                  value={lease.lease_type} // Added value
                  onChange={handleChange}  // Added onChange
                  validationErrors={validationErrors}
                  options={[
                    { value: 'BUSINESS', label: 'Business Lease' },
                    { value: 'COMMERCIAL', label: 'Commercial Lease' },
                    { value: 'PERSONAL', label: 'Personal Lease' },
                    { value: 'CORPORATE', label: 'Corporate Lease' }
                  ]}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    name="lessee_address"
                    type="textarea"
                    required
                    placeholder="Complete business/residential address"
                    value={lease.lessee_address} // Added value
                    onChange={handleChange}    // Added onChange
                    validationErrors={validationErrors}
                  />
                </div>
              </div>
            )}

            {activeTab === 'lease' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Vehicle"
                  name="vehicle"
                  type="select"
                  required
                  value={lease.vehicle}
                  onChange={handleChange}
                  validationErrors={validationErrors}
                  options={Array.isArray(vehicles) ? vehicles.map(vehicle => ({
                    value: vehicle.id,
                    label: `${vehicle.vehicle_name} (${vehicle.vehicle_number})`
                  })) : []}
                />
                <InputField
                  label="Monthly Rate"
                  name="monthly_rate"
                  type="number"
                  required
                  placeholder="Monthly lease amount"
                  help="Amount charged per month"
                  value={lease.monthly_rate} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Lease Start Date"
                  name="lease_start_date"
                  type="date"
                  required
                  value={lease.lease_start_date} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Lease End Date"
                  name="lease_end_date"
                  type="date"
                  required
                  value={lease.lease_end_date} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Total Months"
                  name="total_months"
                  type="number"
                  placeholder="Auto-calculated"
                  help="Automatically calculated from dates"
                  value={lease.total_months} // Added value
                  readOnly // Made readOnly
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Lease Status"
                  name="lease_status"
                  type="select"
                  required
                  value={lease.lease_status} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                  options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                    { value: 'PENDING', label: 'Pending Approval' }
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
                    help="Monthly rate × Total months" // Corrected help text
                    value={lease.base_amount} // Added value
                    readOnly // Made readOnly
                    validationErrors={validationErrors}
                  />
                  <InputField
                    label="Security Deposit"
                    name="security_deposit"
                    type="number"
                    required
                    placeholder="Security deposit amount"
                    value={lease.security_deposit} // Added value
                    onChange={handleChange}    // Added onChange
                    validationErrors={validationErrors}
                  />
                  <InputField
                    label="Additional Charges"
                    name="additional_charges"
                    type="number"
                    placeholder="0.00"
                    help="Extra charges (fuel, cleaning, etc.)"
                    value={lease.additional_charges} // Added value
                    onChange={handleChange}    // Added onChange
                    validationErrors={validationErrors}
                  />
                  <InputField
                    label="Discount"
                    name="discount"
                    type="number"
                    placeholder="0.00"
                    help="Discount amount"
                    value={lease.discount} // Added value
                    onChange={handleChange}    // Added onChange
                    validationErrors={validationErrors}
                  />
                  <InputField
                    label="Payment Status"
                    name="payment_status"
                    type="select"
                    required
                    value={lease.payment_status} // Added value
                    onChange={handleChange}    // Added onChange
                    validationErrors={validationErrors}
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
                    value={lease.total_amount} // Added value
                    readOnly // Made readOnly
                    validationErrors={validationErrors}
                  />
                </div>

                {/* Pricing Summary */}
                {lease.base_amount && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Calculator className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-green-900">Lease Pricing Summary</h4>
                        <div className="mt-2 text-sm text-green-700 space-y-1">
                          <div className="flex justify-between">
                            <span>Base Amount ({lease.total_months || 0} months × ${parseFloat(lease.monthly_rate) || 0}/month):</span>
                            <span>${lease.base_amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Security Deposit:</span>
                            <span>${parseFloat(lease.security_deposit || '0').toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Additional Charges:</span>
                            <span>${parseFloat(lease.additional_charges || '0').toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-${parseFloat(lease.discount || '0').toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t border-green-300 pt-1">
                            <span>Total Lease Amount:</span>
                            <span>${lease.total_amount}</span>
                          </div>
                          <div className="flex justify-between text-xs text-green-600 mt-2">
                            <span>Monthly Payment:</span>
                            <span>${parseFloat(lease.monthly_rate || '0').toFixed(2)}/month</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Payment Frequency"
                  name="payment_frequency"
                  type="select"
                  required
                  value={lease.payment_frequency} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                  options={[
                    { value: 'MONTHLY', label: 'Monthly' },
                    { value: 'QUARTERLY', label: 'Quarterly' },
                    { value: 'SEMI_ANNUAL', label: 'Semi-Annual' },
                    { value: 'ANNUAL', label: 'Annual' }
                  ]}
                />

                <InputField
                  label="Payment Method"
                  name="payment_method"
                  type="select"
                  required
                  value={lease.payment_method} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                  options={[
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                    { value: 'CHECK', label: 'Check' },
                    { value: 'CREDIT_CARD', label: 'Credit Card' },
                    { value: 'CASH', label: 'Cash' }
                  ]}
                />

                <InputField
                  label="Late Fee Percentage"
                  name="late_fee_percentage"
                  type="number"
                  placeholder="5"
                  help="Percentage charged for late payments"
                  value={lease.late_fee_percentage} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                />

                <InputField
                  label="Monthly Mileage Limit"
                  name="mileage_limit"
                  type="number"
                  placeholder="2000"
                  help="Maximum kilometers per month (optional)"
                  value={lease.mileage_limit} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                />

                <InputField
                  label="Maintenance Responsibility"
                  name="maintenance_responsibility"
                  type="select"
                  required
                  value={lease.maintenance_responsibility} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                  options={[
                    { value: 'LESSEE', label: 'Lessee (Customer)' },
                    { value: 'LESSOR', label: 'Lessor (Company)' },
                    { value: 'SHARED', label: 'Shared Responsibility' }
                  ]}
                />

                <InputField
                  label="Insurance Responsibility"
                  name="insurance_responsibility"
                  type="select"
                  required
                  value={lease.insurance_responsibility} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                  options={[
                    { value: 'LESSEE', label: 'Lessee (Customer)' },
                    { value: 'LESSOR', label: 'Lessor (Company)' },
                    { value: 'SHARED', label: 'Shared Responsibility' }
                  ]}
                />

                <div className="md:col-span-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-900">Lease Terms Information</h4>
                        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                          <li>• Payment frequency determines billing schedule</li>
                          <li>• Late fees apply after grace period (typically 5-10 days)</li>
                          <li>• Mileage limits help determine wear and tear charges</li>
                          <li>• Maintenance responsibility affects monthly rates</li>
                          <li>• Insurance requirements must meet minimum coverage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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
                  value={lease.pickup_odometer} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Pickup Fuel Level"
                  name="pickup_fuel_level"
                  type="select"
                  required
                  value={lease.pickup_fuel_level} // Added value
                  onChange={handleChange}    // Added onChange
                  validationErrors={validationErrors}
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
                    value={lease.pickup_notes} // Added value
                    onChange={handleChange}    // Added onChange
                    validationErrors={validationErrors}
                  />
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Lease Agreement"
                  name="lease_agreement"
                  type="file"
                  help="Upload signed lease agreement (PDF, DOC)"
                  onChange={handleChange} // onChange for file input
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Vehicle Handover Report"
                  name="pickup_inspection_report"
                  type="file"
                  help="Upload vehicle handover inspection report (PDF, DOC)"
                  onChange={handleChange} // onChange for file input
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Business License (if applicable)"
                  name="business_license_document"
                  type="file"
                  help="Upload business license for corporate leases (PDF, DOC)"
                  onChange={handleChange} // onChange for file input
                  validationErrors={validationErrors}
                />
                <InputField
                  label="Insurance Certificate"
                  name="insurance_certificate"
                  type="file"
                  help="Upload insurance certificate (PDF, DOC)"
                  onChange={handleChange} // onChange for file input
                  validationErrors={validationErrors}
                />
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Lease Document Guidelines</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• All lease agreements must be signed by both parties</li>
                          <li>• Include detailed vehicle condition documentation</li>
                          <li>• Business leases require valid business license</li>
                          <li>• Insurance certificate must cover lease period</li>
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
                {loading ? 'Creating...' : 'Create Lease'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRentalAdd;