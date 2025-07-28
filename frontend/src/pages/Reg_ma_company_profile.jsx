import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronDown, UserCircle, Upload, Save, X, Edit2, Trash2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

// Enhanced Input Component
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  className = ""
}) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
        disabled ? "bg-gray-100" : "bg-white"
      }`}
    />
  </div>
);

// Enhanced File Upload Component
const LogoUpload = ({ label, file, onChange, currentImageUrl }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="flex items-center space-x-4">
      <div className="relative">
        {currentImageUrl && !file ? (
          <img
            src={currentImageUrl}
            alt="Company Logo"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80";
              e.target.className = "w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center";
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            {file ? "New Logo" : "No Logo"}
          </div>
        )}
      </div>
      <div className="flex-1">
        <input
          type="text"
          readOnly
          value={file ? file.name : currentImageUrl ? "Current Logo" : "No file selected"}
          className="w-full p-2 border rounded-md bg-gray-50 text-gray-700 truncate"
        />
      </div>
      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm transition">
        <Upload size={16} className="mr-2" />
        {file || currentImageUrl ? "Change" : "Upload"}
        <input
          type="file"
          className="hidden"
          onChange={onChange}
          accept="image/*"
        />
      </label>
    </div>
  </div>
);

// Enhanced Info Display Component
const InfoDisplay = ({ label, value, className = "" }) => (
  <div className={`mb-3 ${className}`}>
    <span className="text-sm font-medium text-gray-500">{label}:</span>
    <p className="text-gray-800 font-medium mt-1">{value || "N/A"}</p>
  </div>
);

// Enhanced Section Header
const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
    {icon && <div className="mr-2 text-blue-600">{icon}</div>}
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
  </div>
);

// Enhanced Button Component
const ActionButton = ({ 
  onClick, 
  label, 
  icon, 
  variant = "primary",
  disabled = false,
  className = ""
}) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center px-4 py-2 rounded-md font-medium transition ${
        variants[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};

function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [companyDrivers, setCompanyDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newCompanyLogo, setNewCompanyLogo] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch company data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [companyRes, driversRes] = await Promise.all([
          axiosInstance.get(`/companies/${id}/`),
          axiosInstance.get(`/by-company/${id}/`)
        ]);
        setCompanyData(companyRes.data);
        setEditFormData(companyRes.data);
        setCompanyDrivers(driversRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setErrors({ fetch: "Failed to load company data" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle logo upload
  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewCompanyLogo(e.target.files[0]);
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditFormData({ ...companyData });
      setNewCompanyLogo(null);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!editFormData.company_name) newErrors.company_name = "Company name is required";
    if (!editFormData.registration_number) newErrors.registration_number = "Registration number is required";
    if (!editFormData.contact_email) newErrors.contact_email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(editFormData.contact_email)) {
      newErrors.contact_email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save changes
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();

    // Append all fields except excluded ones
    Object.entries(editFormData).forEach(([key, value]) => {
      if (!["id", "created_at", "updated_at", "company_logo"].includes(key)) {
        formData.append(key, value || "");
      }
    });

    if (newCompanyLogo) {
      formData.append("company_logo", newCompanyLogo);
    }

    try {
      const response = await axiosInstance.patch(
        `/companies/${id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setCompanyData(response.data);
      setEditFormData(response.data);
      setIsEditing(false);
      setNewCompanyLogo(null);
    } catch (error) {
      console.error("Update failed:", error);
      setErrors({ save: "Failed to save changes. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Delete company
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.delete(`/companies/${id}/`);
      navigate("/platform-list", { state: { message: "Company deleted successfully" } });
    } catch (error) {
      console.error("Delete failed:", error);
      setErrors({ delete: "Failed to delete company. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (!companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-700 mb-4">{errors.fetch || "Company not found or an error occurred."}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <nav className="flex items-center text-sm text-gray-500 mb-2">
              <Link to="/platform-list" className="hover:text-blue-600">Organization</Link>
              <span className="mx-2">/</span>
              <Link to="/platform-list" className="hover:text-blue-600">Platform Registration List</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">Company Profile</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {companyData.company_name}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <ActionButton
              onClick={toggleEdit}
              label={isEditing ? "Cancel" : "Edit"}
              icon={isEditing ? <X size={18} /> : <Edit2 size={18} />}
              variant={isEditing ? "secondary" : "primary"}
              disabled={loading}
            />
            
            {isEditing ? (
              <ActionButton
                onClick={handleSave}
                label="Save Changes"
                icon={<Save size={18} />}
                variant="success"
                disabled={loading}
              />
            ) : (
              <ActionButton
                onClick={handleDelete}
                label="Delete Company"
                icon={<Trash2 size={18} />}
                variant="danger"
                disabled={loading}
              />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Error Message */}
          {errors.save && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
              {errors.save}
            </div>
          )}

          {/* Logo and Basic Info */}
          <div className="mb-8">
            {isEditing ? (
              <LogoUpload
                label="Company Logo"
                file={newCompanyLogo}
                onChange={handleLogoChange}
                currentImageUrl={companyData.company_logo}
              />
            ) : (
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={companyData.company_logo || "https://via.placeholder.com/120"}
                    alt="Company Logo"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/120";
                      e.target.className = "w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center";
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{companyData.company_name}</h2>
                  <p className="text-gray-600">
                    <span className="font-medium">Registration No:</span> {companyData.registration_number}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* General Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <SectionHeader title="General Information" />
              
              {isEditing ? (
                <>
                  <InputField
                    label="Company Name"
                    name="company_name"
                    value={editFormData.company_name}
                    onChange={handleChange}
                    error={errors.company_name}
                  />
                  <InputField
                    label="Registration Number"
                    name="registration_number"
                    value={editFormData.registration_number}
                    onChange={handleChange}
                    error={errors.registration_number}
                  />
                  <InputField
                    label="GST Number"
                    name="gst_number"
                    value={editFormData.gst_number}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Established Date"
                    name="established_date"
                    type="date"
                    value={editFormData.established_date?.split('T')[0]}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Website"
                    name="website"
                    value={editFormData.website}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <InfoDisplay label="Company Name" value={companyData.company_name} />
                  <InfoDisplay label="Registration Number" value={companyData.registration_number} />
                  <InfoDisplay label="GST Number" value={companyData.gst_number} />
                  <InfoDisplay 
                    label="Established Date" 
                    value={companyData.established_date ? new Date(companyData.established_date).toLocaleDateString() : "N/A"} 
                  />
                  <InfoDisplay label="Description" value={companyData.description} />
                  <InfoDisplay 
                    label="Website" 
                    value={companyData.website ? (
                      <a href={companyData.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                        {companyData.website}
                      </a>
                    ) : "N/A"} 
                  />
                </>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <SectionHeader title="Contact Information" />
              
              {isEditing ? (
                <>
                  <InputField
                    label="Contact Person"
                    name="contact_person"
                    value={editFormData.contact_person}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Email"
                    name="contact_email"
                    type="email"
                    value={editFormData.contact_email}
                    onChange={handleChange}
                    error={errors.contact_email}
                  />
                  <InputField
                    label="Phone"
                    name="contact_phone"
                    value={editFormData.contact_phone}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Address"
                    name="address"
                    value={editFormData.address}
                    onChange={handleChange}
                  />
                  <InputField
                    label="City"
                    name="city"
                    value={editFormData.city}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Country"
                    name="country"
                    value={editFormData.country}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <InfoDisplay label="Contact Person" value={companyData.contact_person} />
                  <InfoDisplay label="Email" value={companyData.contact_email} />
                  <InfoDisplay label="Phone" value={companyData.contact_phone} />
                  <InfoDisplay 
                    label="Address" 
                    value={`${companyData.address || ''}, ${companyData.city || ''}, ${companyData.country || ''}`.trim().replace(/^, |, $/g, '') || "N/A"} 
                  />
                </>
              )}
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <SectionHeader title="Bank Details" />
              
              {isEditing ? (
                <>
                  <InputField
                    label="Bank Name"
                    name="bank_name"
                    value={editFormData.bank_name}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Account Number"
                    name="account_number"
                    value={editFormData.account_number}
                    onChange={handleChange}
                  />
                  <InputField
                    label="IFSC Code"
                    name="ifsc_code"
                    value={editFormData.ifsc_code}
                    onChange={handleChange}
                  />
                  <InputField
                    label="SWIFT Code"
                    name="swift_code"
                    value={editFormData.swift_code}
                    onChange={handleChange}
                  />
                  <InputField
                    label="IBAN Code"
                    name="iban_code"
                    value={editFormData.iban_code}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <InfoDisplay label="Bank Name" value={companyData.bank_name} />
                  <InfoDisplay label="Account Number" value={companyData.account_number} />
                  <InfoDisplay label="IFSC Code" value={companyData.ifsc_code} />
                  <InfoDisplay label="SWIFT Code" value={companyData.swift_code} />
                  <InfoDisplay label="IBAN Code" value={companyData.iban_code} />
                </>
              )}
            </div>

            {/* Commission Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <SectionHeader title="Commission Details" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Car Commission */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Car Commission</h4>
                  {isEditing ? (
                    <>
                      <InputField
                        label="Rate per KM"
                        name="car_rate_per_km"
                        type="number"
                        value={editFormData.car_rate_per_km}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Min KM"
                        name="car_min_km"
                        type="number"
                        value={editFormData.car_min_km}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Rate per Order"
                        name="car_rate_per_order"
                        type="number"
                        value={editFormData.car_rate_per_order}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Fixed Commission"
                        name="car_fixed_commission"
                        type="number"
                        value={editFormData.car_fixed_commission}
                        onChange={handleChange}
                      />
                    </>
                  ) : (
                    <>
                      <InfoDisplay label="Rate per KM" value={companyData.car_rate_per_km ? `₹${companyData.car_rate_per_km}` : "N/A"} />
                      <InfoDisplay label="Min KM" value={companyData.car_min_km} />
                      <InfoDisplay label="Rate per Order" value={companyData.car_rate_per_order ? `₹${companyData.car_rate_per_order}` : "N/A"} />
                      <InfoDisplay label="Fixed Commission" value={companyData.car_fixed_commission ? `₹${companyData.car_fixed_commission}` : "N/A"} />
                    </>
                  )}
                </div>

                {/* Bike Commission */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Bike Commission</h4>
                  {isEditing ? (
                    <>
                      <InputField
                        label="Rate per KM"
                        name="bike_rate_per_km"
                        type="number"
                        value={editFormData.bike_rate_per_km}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Min KM"
                        name="bike_min_km"
                        type="number"
                        value={editFormData.bike_min_km}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Rate per Order"
                        name="bike_rate_per_order"
                        type="number"
                        value={editFormData.bike_rate_per_order}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Fixed Commission"
                        name="bike_fixed_commission"
                        type="number"
                        value={editFormData.bike_fixed_commission}
                        onChange={handleChange}
                      />
                    </>
                  ) : (
                    <>
                      <InfoDisplay label="Rate per KM" value={companyData.bike_rate_per_km ? `₹${companyData.bike_rate_per_km}` : "N/A"} />
                      <InfoDisplay label="Min KM" value={companyData.bike_min_km} />
                      <InfoDisplay label="Rate per Order" value={companyData.bike_rate_per_order ? `₹${companyData.bike_rate_per_order}` : "N/A"} />
                      <InfoDisplay label="Fixed Commission" value={companyData.bike_fixed_commission ? `₹${companyData.bike_fixed_commission}` : "N/A"} />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Accessories */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <SectionHeader title="Provided Accessories" />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "T-Shirt", name: "t_shirt" },
                  { label: "Cap", name: "cap" },
                  { label: "Jackets", name: "jackets" },
                  { label: "Bag", name: "bag" },
                  { label: "Wristbands", name: "wristbands" },
                  { label: "Water Bottle", name: "water_bottle" },
                  { label: "Safety Gear", name: "safety_gear" },
                  { label: "Helmet", name: "helmet" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center">
                    {isEditing ? (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={!!editFormData[item.name]}
                          onChange={(e) => handleChange({
                            target: {
                              name: item.name,
                              value: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span>{item.label}</span>
                      </label>
                    ) : (
                      <InfoDisplay 
                        label={item.label} 
                        value={companyData[item.name] ? "Yes" : "No"} 
                        className="flex-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <p><span className="font-medium">Created At:</span> {new Date(companyData.created_at).toLocaleString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(companyData.updated_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Drivers Section */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Drivers Allotted ({companyDrivers.length})
              </h2>
              <Link 
                to={`/driver-registration?company=${id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add New Driver
              </Link>
            </div>

            {companyDrivers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companyDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.driver_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.mobile}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {driver.vehicle ? `${driver.vehicle.vehicle_name} (${driver.vehicle.vehicle_number})` : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driver.status === "Active" ? "bg-green-100 text-green-800" :
                            driver.status === "Inactive" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            to={`/profileedit/${driver.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </Link>
                          <Link 
                            to={`/driver-registration/${driver.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No drivers currently allotted to this company.</p>
                <Link 
                  to={`/driver-registration?company=${id}`}
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add Your First Driver
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;