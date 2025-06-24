import React, { useState, useEffect } from 'react';
import { ChevronDown, CircleUserRound } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom'; // Import for routing

function EditCompanyForm() {
  const { id } = useParams(); // Get company ID from URL
  const navigate = useNavigate(); // For redirection after submission

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    registration_number: '',
    gst_number: '', // Assuming GST number should be here as well for edit
    address: '',
    city: '',
    country: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
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

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(`/company/${id}/`);
        const data = response.data;

        // Populate formData with existing data
        setFormData(prev => ({
          ...prev,
          company_name: data.company_name || '',
          registration_number: data.registration_number || '',
          gst_number: data.gst_number || '', // Ensure GST number is fetched if it exists in your API
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          contact_person: data.contact_person || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();

    for (const key in formData) {
      // Only append fields that have values to avoid sending empty strings for optional fields if not changed
      if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    }

    try {
      const response = await axiosInstance.put(`/company/${id}/`, form); // Use PUT for full update
      console.log("Success:", response.data);
      alert("Company updated successfully!");
      navigate('/platform-list'); // Redirect to a company list or dashboard page
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Failed to update. Please check the form fields.");
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
                  <Input label="GST Number" name="gst_number" value={formData.gst_number} onChange={handleChange} /> {/* Added GST Number */}
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
                <button onClick={() => setStep(step - 1)} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors">
                  Back
                </button>
              )}
              {step < totalSteps && (
                <button onClick={() => setStep(step + 1)} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 text-white transition-colors ml-auto">
                  Next
                </button>
              )}
              {step === totalSteps && (
                <button onClick={handleSubmit} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 text-white transition-colors ml-auto">
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

export default EditCompanyForm;