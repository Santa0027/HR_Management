import React, { useState, useCallback, memo } from 'react';
import { ChevronDown, CircleUserRound, Upload } from 'lucide-react';
import axiosInstance from '../api/axiosInstance'; // Your axios wrapper

// Memoized Input field
const InputField = memo(({ label, type = "text", name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-1 text-white">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
      autoComplete="off"
    />
  </div>
));

// Memoized Select field
const SelectField = memo(({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-1 text-white">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
));

// File upload field
const FileUploadField = ({ label, name, file, onChange }) => (
  <div>
    <label className="block text-sm mb-1 text-white">{label}</label>
    <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
      <input
        type="text"
        readOnly
        value={file ? file.name : 'No file chosen'}
        className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
      />
      <label htmlFor={name} className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 flex items-center h-full">
        <Upload size={18} className="mr-2" /> Upload
      </label>
      <input
        type="file"
        name={name}
        id={name}
        onChange={onChange}
        className="hidden"
      />
    </div>
  </div>
);

// Main Component
const Reg_ma_vehicle_registration = () => {
  const [formData, setFormData] = useState({
    vehicle_name: '',
    vehicle_number: '',
    vehicle_type: 'CAR',
    image: null,
    insurance_number: '',
    insurance_document: null,
    insurance_expiry_date: '',
    service_date: '',
    rc_book_number: '',
    rc_document: null,
    is_leased: false,
    approval_status: 'PENDING',
  });

  // Unified change handler
  const handleChange = useCallback((e) => {
    const { name, type, value, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    }));
  }, []);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key.includes('_date') && value) {
        const date = new Date(value);
        if (!isNaN(date)) {
          submitData.append(key, date.toISOString().split('T')[0]);
        }
      } else if (value !== null) {
        submitData.append(key, value);
      }
    });

    try {
      await axiosInstance.post('/vehicles/', submitData);
      alert('Vehicle registered successfully!');
      // Reset form
      setFormData({
        vehicle_name: '',
        vehicle_number: '',
        vehicle_type: 'CAR',
        image: null,
        insurance_number: '',
        insurance_document: null,
        insurance_expiry_date: '',
        service_date: '',
        rc_book_number: '',
        rc_document: null,
        is_leased: false,
        approval_status: 'PENDING',
      });
    } catch (error) {
      console.error("Submission Error:", error.response?.data);
      alert('Error registering vehicle: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-8">
      {/* Header */}
      <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
        <div className="text-sm text-gray-400">Organization / Vehicle Registration</div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 bg-gray-900 rounded-full text-sm hover:bg-gray-800">
            English <ChevronDown size={16} className="ml-1" />
          </button>
          <CircleUserRound size={24} className="text-green-400" />
        </div>
      </header>

      {/* Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-gray-900 p-6 rounded-lg w-full max-w-4xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Register New Vehicle</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-300">Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadField label="Vehicle Image Profile" name="image" file={formData.image} onChange={handleChange} />
                <InputField label="Vehicle Name" name="vehicle_name" value={formData.vehicle_name} onChange={handleChange} placeholder="Enter vehicle name" />
                <InputField label="Vehicle Number" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} placeholder="Enter vehicle number" />
                <SelectField
                  label="Vehicle Type"
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  options={[
                    { value: 'CAR', label: 'Car' },
                    { value: 'BIKE', label: 'Bike' },
                    { value: 'TRUCK', label: 'Truck' },
                    { value: 'BUS', label: 'Bus' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                />
                <InputField label="Insurance Number" name="insurance_number" value={formData.insurance_number} onChange={handleChange} placeholder="Enter insurance number" />
                <FileUploadField label="Insurance Document" name="insurance_document" file={formData.insurance_document} onChange={handleChange} />
                <InputField label="Insurance Expiry Date" type="date" name="insurance_expiry_date" value={formData.insurance_expiry_date} onChange={handleChange} />
                <InputField label="Service Date" type="date" name="service_date" value={formData.service_date} onChange={handleChange} />
                <InputField label="RC Book Number" name="rc_book_number" value={formData.rc_book_number} onChange={handleChange} placeholder="Enter Chassis number" />
                <InputField label="Chassis Number" name="chassis _number" value={formData.Chassis_Number} onChange={handleChange} placeholder="Enter RC book number" />
                <FileUploadField label="RC Document" name="rc_document" file={formData.rc_document} onChange={handleChange} />

                {/* Is Leased Checkbox */}
                <div className="md:col-span-2 flex items-center mt-4 space-x-2">
                  <input
                    type="checkbox"
                    id="is_leased"
                    name="is_leased"
                    checked={formData.is_leased}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <label htmlFor="is_leased" className="text-white">Is Vehicle Leased?</label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">
                  Submit Vehicle
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reg_ma_vehicle_registration;
