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
    <div className="min-h-screen font-inter p-8 bg-white text-[#1E2022]">
      <div className="flex flex-col">
       {/* Header */}
               <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
                 <div className="text-sm text-[#52616B]">Organization / Platform Registration List / Company Profile</div>
                 <div className="flex items-center space-x-4">
                   <button className="flex items-center px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm  transition-colors">
                     English <ChevronDown size={16} className="ml-1" />
                   </button>
                   <CircleUserRound size={24} className="text-[#1E2022]" />
                 </div>
               </header>

        {/* Heading and Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[#187795] text-3xl font-semibold">Company Profile</h1>
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

        {/* Company Details */}
        <div className="bg-[#C9D6DF] p-6 rounded-lg mb-8 flex items-center">
          <img
            src={companyData.logo || 'https://placehold.co/80x80/535c9b/ffffff?text=Logo'}
            alt="Company Logo"
            className="w-20 h-20 rounded-full object-cover mr-6"
            onError={(e) => {
              e.target.src = 'https://placehold.co/80x80/535c9b/ffffff?text=Logo';
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400">
  <div>
    <span className="font-semibold text-[#353535]">Registration Number:</span>{' '}
    {companyData.registration_number}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">GST Number:</span>{' '}
    {companyData.gst_number || 'N/A'}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">Address:</span>{' '}
    {companyData.address}, {companyData.city}, {companyData.country}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">Contact Person:</span>{' '}
    {companyData.contact_person}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">Email:</span>{' '}
    {companyData.contact_email}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">Phone:</span>{' '}
    {companyData.contact_phone}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">Bank:</span>{' '}
    {companyData.bank_name}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">Account Number:</span>{' '}
    {companyData.account_number}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">IFSC Code:</span>{' '}
    {companyData.ifsc_code}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">SWIFT Code:</span>{' '}
    {companyData.swift_code || 'N/A'}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">IBAN Code:</span>{' '}
    {companyData.iban_code || 'N/A'}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">Commission Type:</span>{' '}
    {companyData.commission_type}
  </div>

  {/* Conditionally show commission values based on type */}
  {companyData.commission_type === 'km' && (
    <>
      <div>
        <span className="font-semibold text-[#353535]">Rate per KM:</span>{' '}
        ₹{companyData.rate_per_km}
      </div>
      <div>
        <span className="font-semibold text-[#353535]">Min KM:</span>{' '}
        {companyData.min_km}
      </div>
    </>
  )}
  {companyData.commission_type === 'order' && (
    <div>
      <span className="font-semibold text-[#353535]">Rate per Order:</span>{' '}
      ₹{companyData.rate_per_order}
    </div>
  )}
  {companyData.commission_type === 'fixed' && (
    <div>
      <span className="font-semibold text-[#353535]">Fixed Commission:</span>{' '}
      ₹{companyData.fixed_commission}
    </div>
  )}

  <div>
    <span className="font-semibold text-[#353535]">Total Drivers:</span>{' '}
    {companyDrivers.length}
  </div>
  <div>
    <span className="font-semibold text-[#353535]">Created At:</span>{' '}
    {new Date(companyData.created_at).toLocaleString()}
  </div>
</div>
  
        </div>

        {/* Drivers List */}
        <h2 className="text-2xl font-semibold text-[#353535] mb-4">
          Drivers Allotted ({companyDrivers.length})
        </h2>
        <div className="overflow-x-auto mb-4 bg-gray-900 rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#284B63] text-white uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Driver ID</th>
                <th className="py-3 px-6 text-left">Driver Name</th>
                <th className="py-3 px-6 text-left">Mobile Number</th>
                <th className="py-3 px-6 text-left">Vehicle Name</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#C9D6DF] text-sm font-light">
              {companyDrivers.length > 0 ? (
                companyDrivers.map((driver, index) => (
                  <tr
                    key={index}
                    className="border-b text-[#353535] font-bold border-gray-800 hover:bg-white0"
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