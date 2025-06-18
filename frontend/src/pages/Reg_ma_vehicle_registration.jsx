import React, { useState, useEffect, useCallback, memo } from 'react'; // Added memo and useCallback for optimization
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { ChevronDown, CircleUserRound, Upload } from 'lucide-react'; // Import necessary icons for the header and Upload icon

// Assuming axiosInstance is defined elsewhere and handles token logic
// import axiosInstance from '../api/axiosInstance'; // User provided this in their context

// Dummy axiosInstance for self-containment in Canvas, replace with actual import
// const axiosInstance = axios.create({
//     baseURL: 'http://localhost:8000', // Base URL for your API
//     // You might also include default headers here if needed,
//     // e//g., headers: { 'Content-Type': 'application/json' }
// });


// Memoized InputField component
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

// Memoized SelectField component
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

// FileUploadField component
const FileUploadField = ({ label, name, file, onChange }) => { // Simplified onChange to match parent's handleChange
    // Helper to get file name for display
    const getFileName = (f) => {
        return f ? f.name : 'No file chosen';
    };

    return (
        <div>
          <label className="block text-sm mb-1 text-white">{label}</label>
          <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
            <input
              type="text"
              readOnly
              value={getFileName(file)}
              className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
            />
            <label htmlFor={name} className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 flex items-center h-full">
              <Upload size={18} className="mr-2" /> Upload
            </label>
            <input
              type="file"
              name={name}
              id={name}
              onChange={onChange} // Use the passed onChange prop
              className="hidden"
            />
          </div>
        </div>
    );
};

const Reg_ma_vehicle_registration = () => {
    const [formData, setFormData] = useState({
        vehicle_name: '',
        vehicle_number: '',
        vehicle_type: 'CAR', // default
        image: null, // Corresponds to vehicleImageProfile
        insurance_number: '',
        insurance_document: null,
        insurance_expiry_date: '',
        service_date: '',
        rc_book_number: '',
        rc_document: null,
        is_leased: false, // New field from user's code
        approval_status: 'PENDING', // default, not an input field
    });

    // Use useCallback for handleChange to ensure stability across renders
    const handleChange = useCallback((e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []); // Empty dependency array means this function is created once

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData();
        for (const key in formData) {
            // Special handling for date fields if needed, ensure they are in correct format for backend
            if (key.includes('_date') && formData[key]) {
                const date = new Date(formData[key]);
                if (!isNaN(date.getTime())) {
                    submitData.append(key, date.toISOString().split('T')[0]); // YYYY-MM-DD
                } else {
                    submitData.append(key, ''); // Append empty string or handle error
                }
            } else if (key === 'image' && !formData[key]) {
                // If 'image' is null, don't append it to avoid sending 'null' string
                // The backend should handle missing file gracefully if it's optional
            }
            else {
                submitData.append(key, formData[key]);
            }
        }

        try {
            // The user's axiosInstance already handles token logic
            await axiosInstance.post('/vehicles/', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for FormData
                },
            });
            alert('Vehicle registered successfully!');
            // Reset form after successful submission
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
            console.error("Error response:", error.response?.data);
            alert('Error registering vehicle: ' + (error.response?.data ? JSON.stringify(error.response.data) : error.message));
        }
    };


    return (
        <div className="min-h-screen bg-black text-white flex flex-col p-8">
            {/* Header Component */}
            <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
               <div className="text-sm text-gray-400">Organization / Vehicle Registration</div>
               <div className="flex items-center space-x-4">
                 <button className="flex items-center px-3 py-1 bg-gray-900 rounded-full text-sm hover:bg-gray-800 transition-colors">
                   English <ChevronDown size={16} className="ml-1" />
                 </button>
                 <CircleUserRound size={24} className="text-green-400" />
               </div>
            </header>

            <div className="flex-grow flex items-center justify-center">
                <div className="bg-gray-900 p-6 rounded-lg w-full max-w-4xl shadow-lg"> {/* Adjusted max-w */}
                    <h2 className="text-2xl font-bold mb-4">Register New Vehicle</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6"> {/* Added space-y for vertical spacing */}
                            <h3 className="text-lg font-semibold mb-4 text-gray-300">Vehicle Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Vehicle Image Profile */}
                                <FileUploadField
                                    label="Vehicle Image Profile"
                                    name="image" // Matches formData key
                                    file={formData.image}
                                    onChange={handleChange} // Pass the common handleChange
                                />
                                {/* Vehicle Name */}
                                <InputField label="Vehicle Name" name="vehicle_name" value={formData.vehicle_name} onChange={handleChange} placeholder="Enter vehicle name" />
                                {/* Vehicle Number */}
                                <InputField label="Vehicle Number" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} placeholder="Enter vehicle number" />
                                {/* Vehicle Type */}
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
                                        { value: 'OTHER', label: 'Other' },
                                    ]}
                                />
                                {/* Insurance Number */}
                                <InputField label="Insurance Number" name="insurance_number" value={formData.insurance_number} onChange={handleChange} placeholder="Enter insurance number" />
                                {/* Insurance Document Upload */}
                                <FileUploadField
                                    label="Insurance Document"
                                    name="insurance_document" // Matches formData key
                                    file={formData.insurance_document}
                                    onChange={handleChange}
                                />
                                {/* Insurance Expiry Date */}
                                <InputField label="Insurance Expiry Date" type="date" name="insurance_expiry_date" value={formData.insurance_expiry_date} onChange={handleChange} />
                                {/* Service Date */}
                                <InputField label="Service Date" type="date" name="service_date" value={formData.service_date} onChange={handleChange} />
                                {/* RC Book Number */}
                                <InputField label="RC Book Number" name="rc_book_number" value={formData.rc_book_number} onChange={handleChange} placeholder="Enter RC book number" />
                                {/* RC Document */}
                                <FileUploadField
                                    label="RC Document"
                                    name="rc_document" // Matches formData key
                                    file={formData.rc_document}
                                    onChange={handleChange}
                                />
                                {/* Is Leased Checkbox */}
                                <div className="md:col-span-2 flex items-center mt-4">
                                    <input
                                        type="checkbox"
                                        id="is_leased"
                                        name="is_leased"
                                        checked={formData.is_leased}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_leased" className="ml-2 block text-sm text-white">Is Leased Vehicle?</label>
                                </div>
                            </div>
                            <div className="flex justify-center mt-6">
                                <button type="submit" className="bg-green-600 px-8 py-3 rounded-full font-medium text-lg text-white hover:bg-green-700">Register Vehicle</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Reg_ma_vehicle_registration;
