import React, { useState } from 'react';
import axios from 'axios';

const AddDriverForm = () => {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        driverName: '',
        gender: '',
        iqama: '',
        mobile: '',
        city: '',
        nationality: '',
        password: '',
        iqamaExpiry: '',
        dob: '',
        expiryIqama: '',
        expiryPassport: '',
        expiryLicense: '',
        expiryVisa: '',
        expiryMedical: '',
        uploadedDocuments: {},
    });

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        updateField('uploadedDocuments', {
            ...formData.uploadedDocuments,
            [e.target.name]: e.target.files[0],
        });
    };

    const handleSubmit = async () => {
        try {
            const submitData = new FormData();
            submitData.append('driver_name', formData.driverName);
            submitData.append('gender', formData.gender);
            submitData.append('iqama', formData.iqama);
            submitData.append('mobile', formData.mobile);
            submitData.append('city', formData.city);
            submitData.append('nationality', formData.nationality);
            submitData.append('password', formData.password);
            submitData.append('dob', formData.dob);
            submitData.append('iqama_expiry', formData.iqamaExpiry);
            submitData.append('iqama_expiry_date', formData.expiryIqama);
            submitData.append('passport_expiry_date', formData.expiryPassport);
            submitData.append('license_expiry_date', formData.expiryLicense);
            submitData.append('visa_expiry_date', formData.expiryVisa);
            submitData.append('medical_expiry_date', formData.expiryMedical);

            const documents = formData.uploadedDocuments;
            if (documents.iqama) submitData.append('iqama_document', documents.iqama);
            if (documents.passport) submitData.append('passport_document', documents.passport);
            if (documents.license) submitData.append('license_document', documents.license);
            if (documents.visa) submitData.append('visa_document', documents.visa);
            if (documents.medical) submitData.append('medical_certificate', documents.medical);

            const response = await axios.post('/Register/drivers/', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('Driver added successfully!');
            console.log('Success:', response.data);
        } catch (error) {
            if (error.response) {
                console.error('Validation Error:', error.response.data);
                alert('Validation failed: ' + JSON.stringify(error.response.data));
            } else {
                alert('Failed to submit the form.');
                console.error('Error:', error);
            }
        }

    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Add new Driver</h2>

                {/* Progress bar */}
                <div className="w-full h-1 bg-gray-700 mb-6 rounded">
                    <div
                        className="h-full bg-white rounded"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* STEP 1: Personal Info */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            ['Driver Name', 'driverName'],
                            ['ID/Iqama', 'iqama'],
                            ['Mobile Number', 'mobile'],
                            ['Password', 'password']
                        ].map(([label, field]) => (
                            <div key={field}>
                                <label>{label}</label>
                                <input
                                    type={field === 'password' ? 'password' : 'text'}
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded"
                                    value={formData[field]}
                                    onChange={(e) => updateField(field, e.target.value)}
                                />
                            </div>
                        ))}
                        <div>
                            <label>Gender</label>
                            <select
                                className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded"
                                value={formData.gender}
                                onChange={(e) => updateField('gender', e.target.value)}
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label>City</label>
                            <select
                                className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded"
                                value={formData.city}
                                onChange={(e) => updateField('city', e.target.value)}
                            >
                                <option value="">Select city</option>
                                <option value="Riyadh">Riyadh</option>
                                <option value="Jeddah">Jeddah</option>
                            </select>
                        </div>
                        <div>
                            <label>Nationality</label>
                            <select
                                className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded"
                                value={formData.nationality}
                                onChange={(e) => updateField('nationality', e.target.value)}
                            >
                                <option value="">Select nationality</option>
                                <option value="Indian">Indian</option>
                                <option value="Pakistani">Pakistani</option>
                            </select>
                        </div>
                        <div>
                            <label>ID/Iqama Expiry Date</label>
                            <input
                                type="date"
                                className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded text-white"
                                value={formData.iqamaExpiry}
                                onChange={(e) => updateField('iqamaExpiry', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded text-white"
                                value={formData.dob}
                                onChange={(e) => updateField('dob', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: Upload Documents */}
                {step === 2 && (
                    <div className="space-y-6">
                        {[
                            ['iqama', 'Iqama'],
                            ['passport', 'Passport'],
                            ['license', 'License'],
                            ['visa', 'Visa'],
                            ['medical', 'Medical Certificate'],
                        ].map(([name, label]) => (
                            <div key={name}>
                                <label>Upload {label}</label>
                                <input
                                    type="file"
                                    name={name}
                                    onChange={handleFileChange}
                                    className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded"
                                />
                                <label className="block mt-2">{label} Expiry Date</label>
                                <input
                                    type="date"
                                    value={formData[`expiry${label.replace(' ', '')}`] || ''}
                                    onChange={(e) =>
                                        updateField(`expiry${label.replace(' ', '')}`, e.target.value)
                                    }
                                    className="mt-1 p-2 w-full bg-gray-900 border border-gray-700 rounded text-white"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 3: Review */}
                {step === 3 && (
                    <div className="space-y-3 text-sm">
                        {Object.entries({
                            'Driver Name': formData.driverName,
                            Gender: formData.gender,
                            'ID/Iqama': formData.iqama,
                            Mobile: formData.mobile,
                            City: formData.city,
                            Nationality: formData.nationality,
                            Password: formData.password,
                            'Date of Birth': formData.dob,
                            'Iqama Expiry': formData.iqamaExpiry,
                        }).map(([label, value]) => (
                            <p key={label}>
                                <strong>{label}:</strong> {value}
                            </p>
                        ))}
                        <p><strong>Iqama Document:</strong> {formData.uploadedDocuments.iqama?.name || 'Not uploaded'}</p>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 && (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
                        >
                            Next
                        </button>
                    )}
                    {step === 3 && (
                        <button
                            onClick={handleSubmit}
                            className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
                        >
                            Submit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddDriverForm;
