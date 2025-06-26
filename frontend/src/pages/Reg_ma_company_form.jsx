import React, { useState } from 'react';
import { ChevronDown, CircleUserRound, Upload } from 'lucide-react'; // Import Upload icon
import axiosInstance from '../api/axiosInstance';

// Reusable Input field
const Input = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-900 border-gray-700 text-white"
    />
  </div>
);

// Reusable FileUploadField component (adapted for this context)
const FileUploadField = ({ label, name, file, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <div className="flex items-center space-x-2">
      <input
        type="text"
        readOnly
        value={file ? file.name : 'No file chosen'}
        className="flex-1 p-2 border rounded bg-gray-900 border-gray-700 text-white truncate"
      />
      <label htmlFor={name} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center">
        <Upload size={18} className="mr-2" /> Upload
      </label>
      <input
        type="file"
        id={name}
        name={name}
        onChange={onChange}
        className="hidden"
        accept="image/*" // Restrict to image files
      />
    </div>
  </div>
);


function CompanyRegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    registration_number: '',
    gst_number: '',
    address: '',
    city: '',
    country: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    // Add company_logo to the state
    company_logo: null,
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    swift_code: '',
    iban_code: '',
    commission_type: '', // Added for commission details
    rate_per_km: '',
    min_km: '',
    rate_per_order: '',
    fixed_commission: '',
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value // Handle file input correctly
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();

    for (const key in formData) {
      // Only append non-empty string values or File objects
      if (formData[key] !== null && formData[key] !== '' && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    }

    try {
      const response = await axiosInstance.post('/company/', form, {
        headers: {
          'Content-Type': 'multipart/form-data', // Essential for sending files
        },
      });
      console.log("Success:", response.data);
      alert("Company added successfully!");
      // Reset form after successful submission
      setFormData({
        company_name: '',
        registration_number: '',
        gst_number: '',
        address: '',
        city: '',
        country: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        company_logo: null, // Reset logo
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        swift_code: '',
        iban_code: '',
        commission_type: '',
        rate_per_km: '',
        min_km: '',
        rate_per_order: '',
        fixed_commission: '',
      });
      setStep(1); // Go back to the first step
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      alert(`Failed to submit. Error: ${errorMsg}`);
    }
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen font-inter p-8 bg-black text-gray-200">
      <div className="flex flex-col">
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 rounded-full text-sm transition-colors bg-gray-900 hover:bg-gray-800 text-white">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-green-400" />
          </div>
        </div>

        <div className="text-sm mb-6 text-gray-400">Organization / Add New Company</div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-3xl font-semibold">Add New Company</h1>
        </div>

        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl shadow-lg">
            <div className="w-full h-1 bg-gray-700 mb-6 rounded">
              <div className="h-full bg-green-500 rounded" style={{ width: `${(step / totalSteps) * 100}%` }} />
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4 text-white">Company Registration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} />
                  <Input label="Registration Number" name="registration_number" value={formData.registration_number} onChange={handleChange} />
                  {/* Add the company_logo upload field here */}
                  <FileUploadField label="Company Logo" name="company_logo" file={formData.company_logo} onChange={handleChange} />

                  <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                  <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                  <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
                  <Input label="Contact Person" name="contact_person" value={formData.contact_person} onChange={handleChange} />
                  <Input label="Contact Email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
                  <Input label="Contact Phone" name="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} />
                  <Input label="GST Number" name="gst_number" value={formData.gst_number} onChange={handleChange} />

                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4 text-white">Accounting Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleChange} />
                  <Input label="Account Number" name="account_number" value={formData.account_number} onChange={handleChange} />
                  <Input label="IFSC Code" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} />
                  <Input label="SWIFT Code" name="swift_code" value={formData.swift_code} onChange={handleChange} />
                  <Input label="IBAN code" name="iban_code" value={formData.iban_code} onChange={handleChange} />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4 text-white">Commission Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="commission_type" className="block text-sm mb-2 text-gray-300">Commission Type</label>
                    <select
                      id="commission_type"
                      name="commission_type"
                      value={formData.commission_type || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 w-full border rounded bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Type</option>
                      <option value="km">KM Based</option>
                      <option value="order">Order Based</option>
                      <option value="fixed">Fixed Commission</option>
                    </select>
                  </div>

                  {formData.commission_type === 'km' && (
                    <>
                      <Input label="Rate per KM" name="rate_per_km" type="number" value={formData.rate_per_km || ''} onChange={handleChange} />
                      <Input label="Minimum KM" name="min_km" type="number" value={formData.min_km || ''} onChange={handleChange} />
                    </>
                  )}

                  {formData.commission_type === 'order' && (
                    <Input label="Rate per Order" name="rate_per_order" type="number" value={formData.rate_per_order || ''} onChange={handleChange} />
                  )}

                  {formData.commission_type === 'fixed' && (
                    <Input label="Fixed Commission Amount" name="fixed_commission" type="number" value={formData.fixed_commission || ''} onChange={handleChange} />
                  )}
                </div>
              </div>
            )}


            <div className="flex justify-between mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors">
                  Back
                </button>
              )}
              {step < totalSteps && (
                <button type="button" onClick={() => setStep(step + 1)} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 text-white transition-colors ml-auto">
                  Next
                </button>
              )}
              {step === totalSteps && (
                <button type="submit" onClick={handleSubmit} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 text-white transition-colors ml-auto">
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyRegistrationForm;