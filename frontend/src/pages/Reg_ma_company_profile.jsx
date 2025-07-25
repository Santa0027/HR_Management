import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronDown, UserCircle, Upload } from "lucide-react"; // Changed CircleUserRound to UserCircle for consistency
import axiosInstance from "../api/axiosInstance";

// Reusable Input field for the edit form - Adjusted for new palette
const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out bg-white text-gray-900 shadow-sm"
    />
  </div>
);

// Reusable FileUploadField for the edit form - Adjusted for new palette
const FileUploadField = ({ label, name, file, onChange, currentImageUrl }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <div className="flex items-center space-x-3">
      {currentImageUrl && !file ? (
        <img
          src={currentImageUrl}
          alt="Current Logo"
          className="w-16 h-16 object-cover rounded-full border-2 border-gray-300 shadow-sm flex-shrink-0"
          onError={(e) =>
            (e.target.src =
              "https://via.placeholder.com/64x64/E2E8F0/4A5568?text=Logo")
          } // Fallback with a more modern placeholder
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
          {file ? "New File" : "No Logo"}
        </div>
      )}
      <input
        type="text"
        readOnly
        value={
          file
            ? file.name
            : currentImageUrl
            ? "Existing Logo"
            : "No file chosen"
        }
        className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 truncate shadow-sm"
      />
      <label
        htmlFor={name}
        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center shadow-md transition duration-200 ease-in-out text-sm flex-shrink-0"
      >
        <Upload size={18} className="mr-2" />{" "}
        {file || currentImageUrl ? "Change" : "Upload"}
      </label>
      <input
        type="file"
        id={name}
        name={name}
        onChange={onChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  </div>
);

function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [companyDrivers, setCompanyDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode (relevant if you switch to on-page editing)
  const [newCompanyLogo, setNewCompanyLogo] = useState(null);

  // Initial data fetch for company profile and drivers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const companyRes = await axiosInstance.get(`/companies/${id}/`);
        const driversRes = await axiosInstance.get(`/by-company/${id}/`);

        setCompanyData(companyRes.data);
        // Initialize editFormData with fetched data
        setEditFormData(companyRes.data);
        setCompanyDrivers(driversRes.data);
      } catch (error) {
        console.error(
          "Failed to fetch company or drivers:",
          error.response?.data || error.message
        );
        setCompanyData(null);
        setEditFormData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Dependency array: re-run if 'id' changes

  // Handle input changes for the edit form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle logo file change
  const handleLogoChange = (e) => {
    setNewCompanyLogo(e.target.files[0]);
  };

  // Navigates to the edit form route
  // If you want on-page editing, uncomment the commented-out handleEditClick
  // and remove this one, then manage `isEditing` state.
  const handleEditClick = () => {
    navigate(`/company-registration/${id}`); // Corrected URL using `id`
  };

  // Cancels edit mode (only relevant if you enable on-page editing)
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({ ...companyData }); // Revert to last saved data
    setNewCompanyLogo(null); // Discard new logo selection
  };

  // Handles updating the company data (relevant if you enable on-page editing)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSubmit = new FormData();

    for (const key in editFormData) {
      if (
        key === "id" ||
        key === "created_at" ||
        key === "company_logo" ||
        key === "driver_count" || // Assuming this is derived
        key === "updated_at" // Typically auto-managed by Django
      ) {
        continue;
      }
      if (editFormData[key] !== null && editFormData[key] !== undefined) {
        formDataToSubmit.append(key, editFormData[key]);
      }
    }

    if (newCompanyLogo) {
      formDataToSubmit.append("company_logo", newCompanyLogo);
    }

    try {
      const response = await axiosInstance.patch(
        `/company-registration/${id}/`, // Corrected to use `id` from useParams
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setCompanyData(response.data);
      setEditFormData(response.data);
      setIsEditing(false);
      setNewCompanyLogo(null);
      alert("Company updated successfully!");
    } catch (error) {
      console.error(
        "Failed to update company:",
        error.response?.data || error.message
      );
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      alert(`Error updating company: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handles deleting the company
  const handleDeleteCompany = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company? This action cannot be undone."
    );
    if (confirmed) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/company-registration/${id}/`); // Corrected to use `id` from useParams
        alert("Company deleted successfully!");
        navigate("/platform-list");
      } catch (error) {
        console.error(
          "Failed to delete company:",
          error.response?.data || error.message
        );
        const errorMessage = error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message;
        alert(`Error deleting company: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse delay-75"></div>
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse delay-150"></div>
          <span className="text-lg font-semibold">Loading company data...</span>
        </div>
      </div>
    );
  if (!companyData)
    return (
      <div className="min-h-screen bg-gray-100 text-red-600 flex items-center justify-center p-8">
        <p className="text-xl font-semibold">
          Company not found or an error occurred. Please try again later.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-gray-200 mb-8">
          <nav className="text-sm text-gray-500">
            <Link to="/platform-list" className="hover:text-blue-600">
              Organization
            </Link>{" "}
            /{" "}
            <Link to="/platform-list" className="hover:text-blue-600">
              Platform Registration List
            </Link>{" "}
            / <span className="text-gray-700 font-medium">Company Profile</span>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-sm transition-colors duration-200">
              English <ChevronDown size={16} className="ml-1 text-gray-600" />
            </button>
            <UserCircle size={28} className="text-gray-600" />
          </div>
        </header>

        {/* Page Title and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Company Profile
          </h1>
          <div className="flex gap-3">
            {/* The 'isEditing' state is likely managed by the target edit route now.
                If you decide to do on-page editing, uncomment the 'isEditing' logic here. */}
            {!isEditing ? (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md transition duration-200 ease-in-out transform hover:scale-105"
                onClick={handleEditClick}
              >
                Edit Company
              </button>
            ) : (
              <>
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md transition duration-200 ease-in-out transform hover:scale-105"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md transition duration-200 ease-in-out transform hover:scale-105"
                  onClick={handleUpdateSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md transition duration-200 ease-in-out transform hover:scale-105"
              onClick={handleDeleteCompany}
              disabled={isEditing || loading}
            >
              Delete Company
            </button>
          </div>
        </div>

        {/* Company Details Display Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-10 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
            <img
              src={
                companyData.company_logo ||
                "https://via.placeholder.com/96x96/E2E8F0/4A5568?text=Logo"
              }
              alt="Company Logo"
              className="w-24 h-24 rounded-full object-cover mr-0 sm:mr-8 mb-6 sm:mb-0 border-4 border-blue-100 shadow-md flex-shrink-0"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/96x96/E2E8F0/4A5568?text=Logo";
              }}
            />
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {companyData.company_name}
              </h2>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Registration No:</span>{" "}
                {companyData.registration_number}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Website:</span>{" "}
                {companyData.website ? (
                  <a
                    href={companyData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {companyData.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p className="text-gray-600 text-sm italic">
                "{companyData.description || "No description provided."}"
              </p>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-gray-700">
            {/* Basic Info */}
            <div className="col-span-full md:col-span-1 lg:col-span-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                General Information
              </h3>
              <InfoItem
                label="GST Number"
                value={companyData.gst_number || "N/A"}
              />
              <InfoItem
                label="Established Date"
                value={
                  companyData.established_date
                    ? new Date(
                        companyData.established_date
                      ).toLocaleDateString()
                    : "N/A"
                }
              />
              <InfoItem label="Total Drivers" value={companyDrivers.length} />
            </div>

            {/* Contact Info */}
            <div className="col-span-full md:col-span-1 lg:col-span-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                Contact Details
              </h3>
              <InfoItem
                label="Contact Person"
                value={companyData.contact_person}
              />
              <InfoItem label="Email" value={companyData.contact_email} />
              <InfoItem label="Phone" value={companyData.contact_phone} />
              <InfoItem
                label="Address"
                value={`${companyData.address}, ${companyData.city}, ${companyData.country}`}
              />
            </div>

            {/* Bank Info */}
            <div className="col-span-full md:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                Bank Details
              </h3>
              <InfoItem
                label="Bank Name"
                value={companyData.bank_name || "N/A"}
              />
              <InfoItem
                label="Account Number"
                value={companyData.account_number || "N/A"}
              />
              <InfoItem
                label="IFSC Code"
                value={companyData.ifsc_code || "N/A"}
              />
              <InfoItem
                label="SWIFT Code"
                value={companyData.swift_code || "N/A"}
              />
              <InfoItem
                label="IBAN Code"
                value={companyData.iban_code || "N/A"}
              />
            </div>

            {/* Car Commission Details */}
            <div className="col-span-full md:col-span-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                Car Commission
              </h3>
              <InfoItem label="Type" value={companyData.car_commission_type} />
              {companyData.car_commission_type === "KM" && (
                <>
                  <InfoItem
                    label="Rate per KM"
                    value={`₹${companyData.car_rate_per_km}`}
                  />
                  <InfoItem label="Min KM" value={companyData.car_min_km} />
                </>
              )}
              {companyData.car_commission_type === "ORDER" && (
                <InfoItem
                  label="Rate per Order"
                  value={`₹${companyData.car_rate_per_order}`}
                />
              )}
              {companyData.car_commission_type === "FIXED" && (
                <InfoItem
                  label="Fixed Commission"
                  value={`₹${companyData.car_fixed_commission}`}
                />
              )}
            </div>

            {/* Bike Commission Details */}
            <div className="col-span-full md:col-span-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                Bike Commission
              </h3>
              <InfoItem label="Type" value={companyData.bike_commission_type} />
              {companyData.bike_commission_type === "KM" && (
                <>
                  <InfoItem
                    label="Rate per KM"
                    value={`₹${companyData.bike_rate_per_km}`}
                  />
                  <InfoItem label="Min KM" value={companyData.bike_min_km} />
                </>
              )}
              {companyData.bike_commission_type === "ORDER" && (
                <InfoItem
                  label="Rate per Order"
                  value={`₹${companyData.bike_rate_per_order}`}
                />
              )}
              {companyData.bike_commission_type === "FIXED" && (
                <InfoItem
                  label="Fixed Commission"
                  value={`₹${companyData.bike_fixed_commission}`}
                />
              )}
            </div>

            {/* Employee Accessories */}
            <div className="col-span-full">
              <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                Provided Accessories
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <InfoItem
                  label="T-Shirt"
                  value={companyData.t_shirt ? "Yes" : "No"}
                />
                <InfoItem label="Cap" value={companyData.cap ? "Yes" : "No"} />
                <InfoItem
                  label="Jackets"
                  value={companyData.jackets ? "Yes" : "No"}
                />
                <InfoItem label="Bag" value={companyData.bag ? "Yes" : "No"} />
                <InfoItem
                  label="Wristbands"
                  value={companyData.wristbands ? "Yes" : "No"}
                />
                <InfoItem
                  label="Water Bottle"
                  value={companyData.water_bottle ? "Yes" : "No"}
                />
                <InfoItem
                  label="Safety Gear"
                  value={companyData.safety_gear ? "Yes" : "No"}
                />
                <InfoItem
                  label="Helmet"
                  value={companyData.helmet ? "Yes" : "No"}
                />
              </div>
            </div>

            {/* Timestamps */}
            <div className="col-span-full flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-500 pt-4 border-t border-gray-200 mt-4">
              <p>
                <span className="font-semibold">Created At:</span>{" "}
                {new Date(companyData.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Last Updated:</span>{" "}
                {new Date(companyData.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Drivers List Section */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Drivers Allotted ({companyDrivers.length})
        </h2>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver ID
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companyDrivers.length > 0 ? (
                  companyDrivers.map((driver) => (
                    <tr
                      key={driver.id}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        {driver.id}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                        {driver.driver_name}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                        {driver.mobile}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                        {driver.vehicle
                          ? `${driver.vehicle.vehicle_name} (${driver.vehicle.vehicle_number})`
                          : "N/A"}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driver.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : driver.status === "Inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800" // Assuming other statuses
                          }`}
                        >
                          {driver.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-center text-sm font-medium">
                        <Link to={`/profileedit/${driver.id}`}>
                          <button className="text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out">
                            View Profile
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-8 text-center text-gray-500 text-lg"
                    >
                      No drivers currently allotted to this company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying info items
const InfoItem = ({ label, value }) => (
  <div className="mb-2">
    <span className="font-semibold text-gray-600 text-sm">{label}:</span>{" "}
    <span className="text-gray-800 text-base">{value}</span>
  </div>
);

export default CompanyProfile;
