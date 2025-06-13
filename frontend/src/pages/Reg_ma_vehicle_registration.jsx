import React, { useState } from 'react';
import axios from 'axios';
import { ChevronDown, CircleUserRound, Upload } from 'lucide-react'; // Import necessary icons for the header and Upload icon

const Reg_ma_vehicle_registration = () => {
    // State for Vehicle Registration form
    const [vehicleFormDataValues, setVehicleFormDataValues] = useState({
        vehicleName: '',
        vehicleNumber: '',
        insuranceNumber: '',
        insuranceExpiryDate: '',
        serviceDate: '',
        rcBookNumber: '',
    });

    const [vehicleFiles, setVehicleFiles] = useState({
        vehicleImageProfile: null,
        insuranceDocument: null,
        rcDocument: null,
    });

    const updateVehicleField = (field, value) => {
        setVehicleFormDataValues(prev => ({ ...prev, [field]: value }));
    };

    const handleVehicleFileChange = e => {
        const { name, files: f } = e.target;
        setVehicleFiles(prev => ({ ...prev, [name]: f[0] }));
    };

    const formatDate = str => {
        if (!str) return '';
        const date = new Date(str);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    };

    const handleSubmitVehicle = async () => {
        try {
            const data = new FormData();
            Object.entries(vehicleFormDataValues).forEach(([key, val]) => {
                const isDateField = key.includes('Date'); // Covers insuranceExpiryDate, serviceDate
                data.append(key, isDateField ? formatDate(val) : val);
            });
            Object.entries(vehicleFiles).forEach(([key, file]) => {
                if (file) data.append(key, file);
            });

            // Assuming this is your actual vehicle registration endpoint
            const token = localStorage.getItem('access_token');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            };

            const response = await axios.post('/Register/vehicles/', data, config);
            alert('Vehicle added successfully!');
            console.log('Vehicle Submission Success:', response.data);
            // Optionally reset vehicle form fields after successful submission
            setVehicleFormDataValues({
                vehicleName: '',
                vehicleNumber: '',
                insuranceNumber: '',
                insuranceExpiryDate: '',
                serviceDate: '',
                rcBookNumber: '',
            });
            setVehicleFiles({
                vehicleImageProfile: null,
                insuranceDocument: null,
                rcDocument: null,
            });

        } catch (error) {
            if (error.response) {
                console.error('Vehicle Validation error:', error.response.data);
                alert('Vehicle Validation error:\n' + JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Vehicle Error:', error);
                alert('Unexpected error occurred during vehicle submission.');
            }
        }
    };

    // Helper to get file name for display
    const getFileName = (file) => {
      return file ? file.name : 'No file chosen';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
            {/* Header Component */}
            <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
               <div className="text-sm text-gray-400">Organization / Vehicle Registration</div> {/* Updated Breadcrumb */}
               <div className="flex items-center space-x-4">
                 <button className="flex items-center px-3 py-1 bg-gray-900 rounded-full text-sm hover:bg-gray-800 transition-colors">
                   English <ChevronDown size={16} className="ml-1" />
                 </button>
                 <CircleUserRound size={24} className="text-green-400" />
               </div>
            </header>

            <div className="flex-grow flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Register New Vehicle</h2>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">Vehicle Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Vehicle Image Profile */}
                            <div>
                                <label className="block text-gray-300">Vehicle Image Profile</label>
                                <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
                                    <input
                                        type="text" // Display selected file name
                                        readOnly
                                        value={getFileName(vehicleFiles.vehicleImageProfile)}
                                        className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
                                    />
                                    <label htmlFor="vehicleImageProfile" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
                                        <Upload size={18} className="mr-2" /> Upload
                                    </label>
                                    <input
                                        type="file"
                                        name="vehicleImageProfile"
                                        id="vehicleImageProfile" // Added ID for label htmlFor
                                        onChange={handleVehicleFileChange}
                                        className="hidden" // Hide the default file input
                                    />
                                </div>
                            </div>
                            {/* Vehicle Name */}
                            <Input label="Vehicle Name" value={vehicleFormDataValues.vehicleName} onChange={e => updateVehicleField('vehicleName', e.target.value)} />
                            {/* Vehicle Number */}
                            <Input label="Vehicle Number" value={vehicleFormDataValues.vehicleNumber} onChange={e => updateVehicleField('vehicleNumber', e.target.value)} />
                            {/* Insurance Number */}
                            <Input label="Insurance Number" value={vehicleFormDataValues.insuranceNumber} onChange={e => updateVehicleField('insuranceNumber', e.target.value)} />
                            {/* Insurance Document Upload */}
                            <div>
                                <label className="block text-gray-300">Insurance Document</label>
                                <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
                                    <input
                                        type="text" // Display selected file name
                                        readOnly
                                        value={getFileName(vehicleFiles.insuranceDocument)}
                                        className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
                                    />
                                    <label htmlFor="insuranceDocument" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
                                        <Upload size={18} className="mr-2" /> Upload
                                    </label>
                                    <input
                                        type="file"
                                        name="insuranceDocument"
                                        id="insuranceDocument" // Added ID for label htmlFor
                                        onChange={handleVehicleFileChange}
                                        className="hidden" // Hide the default file input
                                    />
                                </div>
                            </div>
                            {/* Insurance Expiry Date */}
                            <Input label="Insurance Expiry Date" type="date" value={vehicleFormDataValues.insuranceExpiryDate} onChange={e => updateVehicleField('insuranceExpiryDate', e.target.value)} />
                            {/* Service Date */}
                            <Input label="Service Date" type="date" value={vehicleFormDataValues.serviceDate} onChange={e => updateVehicleField('serviceDate', e.target.value)} />
                            {/* RC (Registration Certificate) Book Number */}
                            <Input label="RC Book Number" value={vehicleFormDataValues.rcBookNumber} onChange={e => updateVehicleField('rcBookNumber', e.target.value)} />
                            {/* RC Document */}
                            <div>
                                <label className="block text-gray-300">RC Document</label>
                                <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
                                    <input
                                        type="text" // Display selected file name
                                        readOnly
                                        value={getFileName(vehicleFiles.rcDocument)}
                                        className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
                                    />
                                    <label htmlFor="rcDocument" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
                                        <Upload size={18} className="mr-2" /> Upload
                                    </label>
                                    <input
                                        type="file"
                                        name="rcDocument"
                                        id="rcDocument" // Added ID for label htmlFor
                                        onChange={handleVehicleFileChange}
                                        className="hidden" // Hide the default file input
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-6">
                            <button onClick={handleSubmitVehicle} className="bg-green-600 px-8 py-3 rounded-full font-medium text-lg text-white hover:bg-green-700">Add Vehicle</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Input component (Included for self-containment, ideally would be in a common components file)
const Input = ({ label, type = "text", value, onChange }) => (
    <div>
        <label className="block text-gray-300">{label}</label>
        <input type={type} value={value} onChange={onChange} className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
    </div>
);

// Reusable Select component (Included for self-containment, though not used in this specific form)
const Select = ({ label, value, onChange }) => (
    <div>
        <label className="block text-gray-300">{label}</label>
        <select value={value} onChange={onChange} className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
        </select>
    </div>
);

export default Reg_ma_vehicle_registration;
