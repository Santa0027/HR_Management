import React, { useState, useEffect } from 'react';
import { ChevronDown, CircleUserRound, Upload } from 'lucide-react'; // Import Upload icon
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom'; // Import for routing

// Reusable Input field (provided in original code)
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

// Reusable FileUploadField component (adapted from CompanyRegistrationForm)
const FileUploadField = ({ label, name, file, onChange, existingImageUrl }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <div className="flex items-center space-x-2">
      <input
        type="text"
        readOnly
        // Display file name if a new file is selected, otherwise display existing image URL or "No file chosen"
        value={file ? file.name : (existingImageUrl ? existingImageUrl.split('/').pop() : 'No file chosen')}
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
    {existingImageUrl && !file && (
      <div className="mt-2 text-sm text-gray-400">
        Current logo: <a href={existingImageUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">{existingImageUrl.split('/').pop()}</a>
      </div>
    )}
  </div>
);


function EditCompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    registration_number: '',

    address: '',
    city: '',
    country: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    company_logo: null, // Add company_logo to the state
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState(null); // State to store the existing logo URL

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(`/company/${id}/`);
        const data = response.data;

        setFormData(prev => ({
          ...prev,
          company_name: data.company_name || '',
          registration_number: data.registration_number || '',
       
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          contact_person: data.contact_person || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          // Do NOT directly set company_logo to data.company_logo here if it's a URL.
          // We handle it separately to display the existing logo.
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          ifsc_code: data.ifsc_code || '',
          swift_code: data.swift_code || '',
          iban_code: data.iban_code || '',
          commission_type: data.commission_type || '',
          rate_per_km: data.rate_per_km || '',
          min_km: data.min_km || '',
          rate_per_order: data.rate_per_order || '',
          fixed_commission: data.fixed_commission || '',
        }));

        // Store the existing logo URL
        if (data.company_logo) {
          setExistingLogoUrl(data.company_logo);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching company data:", err.response?.data || err.message);
        setError("Failed to load company data.");
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

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
      if (key === 'company_logo' && formData[key] === null) {
        // If company_logo is null, it means no new file was selected.
        // We do NOT append the old URL. The backend should retain the existing one
        // if no new file is provided for this field. If you want to explicitly
        // clear the logo, you'd need a separate mechanism (e.g., a "clear logo" button)
        // and send a specific instruction to the backend.
        continue;
      }

      if (formData[key] !== '' && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    }

    try {
      // Use PATCH if your API supports partial updates, otherwise PUT.
      // PATCH is generally better for forms where not all fields are necessarily changed.
      const response = await axiosInstance.patch(`/company/${id}/`, form, {
        headers: {
          'Content-Type': 'multipart/form-data', // Essential for sending files
        },
      });
      console.log("Success:", response.data);
      alert("Company updated successfully!");
      navigate('/platform-list');
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      alert(`Failed to update. Error: ${errorMsg}`);
    }
  };

  const totalSteps = 3;

  if (loading) {
    return (
      <div className="min-h-screen font-inter p-8 bg-black text-gray-200 flex items-center justify-center">
        Loading company data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-inter p-8 bg-black text-red-500 flex items-center justify-center">
        {error}
      </div>
    );
  }

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

        <div className="text-sm mb-6 text-gray-400">Organization / Edit Company</div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-3xl font-semibold">Edit Company</h1>
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
                  <FileUploadField
                    label="Company Logo"
                    name="company_logo"
                    file={formData.company_logo}
                    onChange={handleChange}
                    existingImageUrl={existingLogoUrl} // Pass the existing logo URL
                  />
                  
                  <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                  <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                  <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
                  <Input label="Contact Person" name="contact_person" value={formData.contact_person} onChange={handleChange} />
                  <Input label="Contact Email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
                  <Input label="Contact Phone" name="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} />
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
                  Update Company
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCompanyForm;
