import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleUserRound, Upload } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { Link } from "react-router-dom";

// Reusable Input field for the edit form
const Input = ({ label, name, type = "text", value, onChange, placeholder = "" }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''} // Ensure value is not null/undefined for controlled input
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-900 border-gray-700 text-white"
    />
  </div>
);

// Reusable FileUploadField for the edit form
const FileUploadField = ({ label, name, file, onChange, currentImageUrl }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <div className="flex items-center space-x-2">
      {/* Show current image thumbnail if available and no new file is selected */}
      {currentImageUrl && !file && (
        <img
          src={currentImageUrl}
          alt="Current Logo"
          className="w-12 h-12 object-cover rounded-full border border-gray-700 flex-shrink-0"
          onError={(e) => e.target.src = 'https://placehold.co/48x48/535c9b/ffffff?text=Logo'} // Fallback for broken image
        />
      )}
      <input
        type="text"
        readOnly
        // Display name of new file, 'Existing File' if current, or 'No file chosen'
        value={file ? file.name : (currentImageUrl ? 'Existing File Selected' : 'No file chosen')}
        className="flex-1 p-2 border rounded bg-gray-900 border-gray-700 text-white truncate"
      />
      <label htmlFor={name} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center flex-shrink-0">
        <Upload size={18} className="mr-2" /> {file || currentImageUrl ? 'Change' : 'Upload'}
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


function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null); // Data for display
  const [editFormData, setEditFormData] = useState(null); // Data for form editing
  const [companyDrivers, setCompanyDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode
  const [newCompanyLogo, setNewCompanyLogo] = useState(null); // State to hold the new logo file

  // Initial data fetch for company profile and drivers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading true at the start of fetch
      try {
        const companyRes = await axiosInstance.get(`/company/${id}/`);
        const driversRes = await axiosInstance.get(`/by-company/${id}/`);

        setCompanyData(companyRes.data);
        // Initialize editFormData with fetched data
        setEditFormData(companyRes.data);
        setCompanyDrivers(driversRes.data);
      } catch (error) {
        console.error('Failed to fetch company or drivers:', error);
        setCompanyData(null); // Ensure companyData is null on error
        setEditFormData(null); // Clear edit form data on error
      } finally {
        setLoading(false); // Always set loading false at the end
      }
    };

    fetchData();
  }, [id]);

  // Handle input changes for the edit form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle logo file change
  const handleLogoChange = (e) => {
    setNewCompanyLogo(e.target.files[0]);
  };

  // Enters edit mode
  const handleEditClick = () => {
    setIsEditing(true);
    // When entering edit mode, ensure editFormData is a copy of companyData
    // This prevents direct mutation and allows cancel to revert
    setEditFormData({ ...companyData });
    setNewCompanyLogo(null); // Clear any previously selected new logo
  };

  // Cancels edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Revert editFormData to companyData (the last saved state)
    setEditFormData({ ...companyData });
    setNewCompanyLogo(null); // Discard new logo selection
  };

  // Handles updating the company data
  const handleUpdateSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);

    const formDataToSubmit = new FormData();

    // Iterate over editFormData to append relevant fields
    for (const key in editFormData) {
      // Exclude specific fields not meant for direct update by this form,
      // or that are handled separately (like company_logo)
      if (
        key === 'id' ||
        key === 'created_at' ||
        key === 'company_logo' || // company_logo will be appended separately if a new file is chosen
        key === 'driver_count' // Assuming this is derived and not directly editable
      ) {
        continue;
      }

      // Only append if the value is not null or undefined
      if (editFormData[key] !== null && editFormData[key] !== undefined) {
        formDataToSubmit.append(key, editFormData[key]);
      }
    }

    // Append the new logo file if one is selected
    if (newCompanyLogo) {
      formDataToSubmit.append('company_logo', newCompanyLogo);
    }
    // If no new logo is selected, and there was an old one,
    // we generally don't need to append the old URL again for a PATCH request
    // as the backend should interpret absence as "no change to this field".
    // If your backend specifically requires 'null' to remove the logo,
    // you'd add `else if (!newCompanyLogo && companyData.company_logo)`
    // then `formDataToSubmit.append('company_logo', '');` or similar based on API.

    try {
      const response = await axiosInstance.patch(`/company/${id}/`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data', // Essential for file uploads
        },
      });
      setCompanyData(response.data); // Update displayed data with the latest response from API
      setEditFormData(response.data); // Keep edit form data in sync
      setIsEditing(false); // Exit edit mode
      setNewCompanyLogo(null); // Clear the new logo state
      alert('Company updated successfully!');
    } catch (error) {
      console.error('Failed to update company:', error.response?.data || error.message);
      const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      alert(`Error updating company: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handles deleting the company
  const handleDeleteCompany = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this company? This action cannot be undone.');
    if (confirmed) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/company/${id}/`);
        alert('Company deleted successfully!');
        navigate('/platform-list'); // Redirect to company list after deletion
      } catch (error) {
        console.error('Failed to delete company:', error.response?.data || error.message);
        const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        alert(`Error deleting company: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Show loading state
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">Loading company data...</div>;

  // Show error if company data is not found after loading
  if (!companyData) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-8">Company not found or an error occurred.</div>;

  return (
    <div className="min-h-screen font-inter p-8 bg-black text-gray-200">
      <div className="flex flex-col">

        {/* Topbar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-green-400" />
          </div>
        </div>

        <div className="text-sm mb-6 text-gray-400">
          Organization / Platform Registration List / Company Profile
        </div>

        {/* Heading and Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-3xl font-semibold">Company Profile</h1>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm"
                onClick={handleEditClick}
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-full text-sm"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm"
                  onClick={handleUpdateSubmit}
                  disabled={loading} // Disable while submitting
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm"
              onClick={handleDeleteCompany}
              disabled={isEditing || loading} // Disable delete while editing or submitting
            >
              Delete
            </button>
          </div>
        </div>

        {/* Company Details / Edit Form Section */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8 flex flex-col md:flex-row items-start md:items-center">
          <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-6 w-full md:w-auto">
            {/* Displaying company_logo */}
            <img
              src={newCompanyLogo ? URL.createObjectURL(newCompanyLogo) : (companyData.company_logo || 'https://placehold.co/80x80/535c9b/ffffff?text=Logo')}
              alt="Company Logo"
              className="w-20 h-20 rounded-full object-cover border border-gray-700 mx-auto md:mx-0"
              onError={(e) => {
                e.target.src = 'https://placehold.co/80x80/535c9b/ffffff?text=Logo'; // Fallback if image fails to load
              }}
            />
            {isEditing && (
              <div className="mt-4 w-full">
                <FileUploadField
                  label="Upload New Logo"
                  name="company_logo" // This matches the backend field name
                  file={newCompanyLogo}
                  onChange={handleLogoChange}
                  currentImageUrl={companyData.company_logo}
                />
              </div>
            )}
          </div>

          {!isEditing ? (
            // Display Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400 flex-grow w-full">
              <div>
                <span className="font-semibold text-gray-300">Company Name:</span>{' '}
                {companyData.company_name}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Registration Number:</span>{' '}
                {companyData.registration_number}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Address:</span>{' '}
                {companyData.address}, {companyData.city}, {companyData.country}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Contact Person:</span>{' '}
                {companyData.contact_person}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Email:</span>{' '}
                {companyData.contact_email}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Phone:</span>{' '}
                {companyData.contact_phone}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Bank:</span>{' '}
                {companyData.bank_name}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Account Number:</span>{' '}
                {companyData.account_number}
              </div>
              <div>
                <span className="font-semibold text-gray-300">IFSC Code:</span>{' '}
                {companyData.ifsc_code}
              </div>
              <div>
                <span className="font-semibold text-gray-300">SWIFT Code:</span>{' '}
                {companyData.swift_code || 'N/A'}
              </div>
              <div>
                <span className="font-semibold text-gray-300">IBAN Code:</span>{' '}
                {companyData.iban_code || 'N/A'}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Commission Type:</span>{' '}
                {companyData.commission_type}
              </div>

              {companyData.commission_type === 'km' && (
                <>
                  <div>
                    <span className="font-semibold text-gray-300">Rate per KM:</span>{' '}
                    ₹{companyData.rate_per_km}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-300">Min KM:</span>{' '}
                    {companyData.min_km}
                  </div>
                </>
              )}
              {companyData.commission_type === 'order' && (
                <div>
                  <span className="font-semibold text-gray-300">Rate per Order:</span>{' '}
                  ₹{companyData.rate_per_order}
                </div>
              )}
              {companyData.commission_type === 'fixed' && (
                <div>
                  <span className="font-semibold text-gray-300">Fixed Commission:</span>{' '}
                  ₹{companyData.fixed_commission}
                </div>
              )}

              <div>
                <span className="font-semibold text-gray-300">Total Drivers:</span>{' '}
                {companyDrivers.length}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Created At:</span>{' '}
                {new Date(companyData.created_at).toLocaleString()}
              </div>
            </div>
          ) : (
            // Edit Mode Form
            <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm flex-grow w-full">
              <Input label="Company Name" name="company_name" value={editFormData.company_name} onChange={handleChange} />
              <Input label="Registration Number" name="registration_number" value={editFormData.registration_number} onChange={handleChange} />

              {/* GST number field is removed */}

              <Input label="Address" name="address" value={editFormData.address} onChange={handleChange} />
              <Input label="City" name="city" value={editFormData.city} onChange={handleChange} />
              <Input label="Country" name="country" value={editFormData.country} onChange={handleChange} />
              <Input label="Contact Person" name="contact_person" value={editFormData.contact_person} onChange={handleChange} />
              <Input label="Contact Email" name="contact_email" type="email" value={editFormData.contact_email} onChange={handleChange} />
              <Input label="Contact Phone" name="contact_phone" type="tel" value={editFormData.contact_phone} onChange={handleChange} />

              <h3 className="md:col-span-2 text-xl font-semibold mt-4 text-white">Accounting Details</h3>
              <Input label="Bank Name" name="bank_name" value={editFormData.bank_name} onChange={handleChange} />
              <Input label="Account Number" name="account_number" value={editFormData.account_number} onChange={handleChange} />
              <Input label="IFSC Code" name="ifsc_code" value={editFormData.ifsc_code} onChange={handleChange} />
              <Input label="SWIFT Code" name="swift_code" value={editFormData.swift_code} onChange={handleChange} />
              <Input label="IBAN Code" name="iban_code" value={editFormData.iban_code} onChange={handleChange} />

              <h3 className="md:col-span-2 text-xl font-semibold mt-4 text-white">Commission Details</h3>
              <div>
                <label htmlFor="commission_type" className="block text-sm mb-2 text-gray-300">Commission Type</label>
                <select
                  id="commission_type"
                  name="commission_type"
                  value={editFormData.commission_type || ''}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Type</option>
                  <option value="km">KM Based</option>
                  <option value="order">Order Based</option>
                  <option value="fixed">Fixed Commission</option>
                </select>
              </div>

              {editFormData.commission_type === 'km' && (
                <>
                  <Input label="Rate per KM" name="rate_per_km" type="number" value={editFormData.rate_per_km} onChange={handleChange} />
                  <Input label="Minimum KM" name="min_km" type="number" value={editFormData.min_km} onChange={handleChange} />
                </>
              )}
              {editFormData.commission_type === 'order' && (
                <Input label="Rate per Order" name="rate_per_order" type="number" value={editFormData.rate_per_order} onChange={handleChange} />
              )}
              {editFormData.commission_type === 'fixed' && (
                <Input label="Fixed Commission Amount" name="fixed_commission" type="number" value={editFormData.fixed_commission} onChange={handleChange} />
              )}
            </form>
          )}
        </div>

        {/* Drivers List */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          Drivers Allotted ({companyDrivers.length})
        </h2>
        <div className="overflow-x-auto mb-4 bg-gray-900 rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-800 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Driver ID</th>
                <th className="py-3 px-6 text-left">Driver Name</th>
                <th className="py-3 px-6 text-left">Mobile Number</th>
                <th className="py-3 px-6 text-left">Vehicle Name</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 text-sm font-light">
              {companyDrivers.length > 0 ? (
                companyDrivers.map((driver, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-gray-700"
                  >
                    <td className="py-3 px-6">{driver.id}</td>
                    <td className="py-3 px-6">{driver.driver_name}</td>
                    <td className="py-3 px-6">{driver.mobile}</td>
                    <td className="py-3 px-6">
                      {driver.vehicle
                        ? `${driver.vehicle.vehicle_name} (${driver.vehicle.vehicle_number})`
                        : 'No Vehicle Assigned'}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`py-1 px-3 rounded-full text-xs font-medium ${
                          driver.status === 'Active'
                            // ? 'bg-green-700 text-green-100'
                            // : driver.status === 'Inactive'
                            // ? 'bg-red-700 text-red-100'
                            // : 'bg-yellow-700 text-yellow-100'
                            // : 'bg-gray-700 text-gray-100' // Default for unknown status
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <Link to={`/profileedit/${driver.id}`} >
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-xs"
                        >
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">
                    No drivers allotted to this company.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;