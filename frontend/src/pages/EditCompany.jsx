import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function EditCompany() {
  const { id } = useParams(); // company ID from URL
  const navigate = useNavigate();

  const [company, setCompany] = useState({
    company_name: '',
    gst_number: '',
    commission_percentage: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    logo: ''
  });

  const [loading, setLoading] = useState(true);

  // Fetch existing data
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axiosInstance.get(`/company/${id}/`);
        setCompany(res.data);
      } catch (error) {
        console.error('Failed to load company', error);
        alert('Error loading company');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/company-profile/${id}/`, company);
      alert('Company updated successfully');
      navigate(`/company/${id}`);
    } catch (error) {
      console.error('Update failed', error);
      alert('Error updating company');
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-inter">
      <h1 className="text-2xl font-semibold mb-6">Edit Company</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium">Company Name</label>
          <input
            type="text"
            name="company_name"
            value={company.company_name}
            onChange={handleChange}
            className="mt-1 p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">GST Number</label>
          <input
            type="text"
            name="gst_number"
            value={company.gst_number}
            onChange={handleChange}
            className="mt-1 p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Commission (%)</label>
          <input
            type="number"
            name="commission_percentage"
            value={company.commission_percentage}
            onChange={handleChange}
            className="mt-1 p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contact Person</label>
          <input
            type="text"
            name="contact_person"
            value={company.contact_person}
            onChange={handleChange}
            className="mt-1 p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contact Email</label>
          <input
            type="email"
            name="contact_email"
            value={company.contact_email}
            onChange={handleChange}
            className="mt-1 p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contact Phone</label>
          <input
            type="tel"
            name="contact_phone"
            value={company.contact_phone}
            onChange={handleChange}
            className="mt-1 p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            name="address"
            value={company.address}
            onChange={handleChange}
            className="mt-1 p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium">Logo URL</label>
          <input
            type="url"
            name="logo"
            value={company.logo}
            onChange={handleChange}
            className="mt-1 p-2 w-full rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
          >
            Update Company
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditCompany;
