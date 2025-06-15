import React, { useState } from 'react';
import axios from 'axios'; // Changed import path to resolve the module directly
import { ChevronDown, CircleUserRound } from 'lucide-react';

const AddDriverForm = () => {
    const [step, setStep] = useState(1);
    const [formDataValues, setFormDataValues] = useState({
        driver_name: '',
        gender: '',
        iqama: '',
        mobile: '',
        city: '',
        nationality: '',
        dob: '',
        iqama_expiry: '',
        passport_expiry: '',
        license_expiry: '',
        visa_expiry: '',
        medical_expiry: '',
    });

    const [files, setFiles] = useState({
        iqama_document: null,
        passport_document: null,
        license_document: null,
        visa_document: null,
        medical_document: null,
    });

    const updateField = (field, value) => {
        setFormDataValues(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = e => {
        const { name, files: f } = e.target;
        setFiles(prev => ({ ...prev, [name]: f[0] }));
    };

    const formatDate = str => {
        if (!str) return '';
        const date = new Date(str);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    };

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            Object.entries(formDataValues).forEach(([key, val]) => {
                const isDateField = key.includes('expiry') || key === 'dob';
                data.append(key, isDateField ? formatDate(val) : val);
            });
            Object.entries(files).forEach(([key, file]) => {
                if (file) data.append(key, file);
            });

            const token = localStorage.getItem('access_token');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            };

            const response = await axios.post('/Register/drivers/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Driver added successfully!');
            console.log('Success:', response.data);
        } catch (error) {
            if (error.response) {
                console.error('Validation error:', error.response.data);
                alert('Validation error:\n' + JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Error:', error);
                alert('Unexpected error occurred.');
            }
        }
    };


    return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
                {/* Header Component */}
                <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
                   <div className="text-sm text-gray-400">Organization / Registration Management / Add Driver</div>
                   <div className="flex items-center space-x-4">
                     <button className="flex items-center px-3 py-1 bg-gray-900 rounded-full text-sm hover:bg-gray-800 transition-colors">
                       English <ChevronDown size={16} className="ml-1" />
                     </button>
                     <CircleUserRound size={24} className="text-green-400" />
                   </div>
                </header>
    
                <div className="flex-grow flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">Add New Driver</h2>
    
                        <div className="w-full h-1 bg-gray-700 mb-6 rounded">
                            <div className="h-full bg-white rounded" style={{ width: `${(step / 3) * 100}%` }} />
                        </div>
    
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Driver Name" value={formDataValues.driver_name} onChange={e => updateField('driver_name', e.target.value)} />
                                <Input label="ID/Iqama" value={formDataValues.iqama} onChange={e => updateField('iqama', e.target.value)} />
                                <Input label="Mobile Number" value={formDataValues.mobile} onChange={e => updateField('mobile', e.target.value)} />
                                <Input label="City" value={formDataValues.city} onChange={e => updateField('city', e.target.value)} />
                                <Select label="Gender" value={formDataValues.gender} onChange={e => updateField('gender', e.target.value)} />
                                <Input label="Nationality" value={formDataValues.nationality} onChange={e => updateField('nationality', e.target.value)} />
                                <Input label="Date of Birth" type="date" value={formDataValues.dob} onChange={e => updateField('dob', e.target.value)} />
                                <Input label="Iqama Expiry Date" type="date" value={formDataValues.iqama_expiry} onChange={e => updateField('iqama_expiry', e.target.value)} />
                            </div>
                        )}
    
                        {/* Step 2: Documents */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {[
                                    ['iqama_document', 'Iqama Document', 'iqama_expiry'],
                                    ['passport_document', 'Passport Document', 'passport_expiry'],
                                    ['license_document', 'License Document', 'license_expiry'],
                                    ['visa_document', 'Visa Document', 'visa_expiry'],
                                    ['medical_document', 'Medical Certificate', 'medical_expiry'],
                                ].map(([docKey, label, expiryKey]) => (
                                    <div key={docKey} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-300">{label}</label>
                                            <input
                                                type="file"
                                                name={docKey}
                                                onChange={handleFileChange}
                                                className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                                            />
                                        </div>
                                        <Input label={`${label} Expiry`} type="date" value={formDataValues[expiryKey]} onChange={e => updateField(expiryKey, e.target.value)} />
                                    </div>
                                ))}
                            </div>
                        )}
    
                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div className="space-y-2 text-sm">
                                <h3 className="text-lg font-semibold mb-2">Review Details</h3>
                                {Object.entries(formDataValues).map(([key, val]) => (
                                    <p key={key} className="text-gray-300"><strong>{key.replace(/_/g, ' ')}:</strong> {val || '—'}</p>
                                ))}
                                {Object.entries(files).map(([key, file]) => (
                                    <p key={key} className="text-gray-300"><strong>{key.replace(/_/g, ' ')}:</strong> {file?.name || 'Not uploaded'}</p>
                                ))}
                            </div>
                        )}
    
                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            {step > 1 && <button onClick={() => setStep(step - 1)} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 text-white">Back</button>}
                            {step < 3 && <button onClick={() => setStep(step + 1)} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 text-white">Next</button>}
                            {step === 3 && <button onClick={handleSubmit} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 text-white">Submit</button>}
                        </div>
                    </div>
                </div>
            </div>
        );
};
// Reusable Input component
const Input = ({ label, type = "text", value, onChange }) => (
    <div>
        <label className="block text-gray-300">{label}</label>
        <input type={type} value={value} onChange={onChange} className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
    </div>
);

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

export default AddDriverForm;
