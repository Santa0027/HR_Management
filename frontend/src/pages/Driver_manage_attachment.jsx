// import React, { useState } from 'react';
// import { ChevronDown, CircleUserRound, Upload } from 'lucide-react'; // Importing icons, including Upload
// import { Link } from 'react-router-dom';

// function Driver_manage_attachment() {
//   const [activeTab, setActiveTab] = useState('Attachments'); // Default to Attachments tab
//   const [driverProfilePicture] = useState('https://placehold.co/100x100/535c9b/ffffff?text=Avatar'); // Placeholder for driver image

//   // Sample data for the driver profile (read-only for the header)
//   const driverHeaderData = {
//     name: 'Ethan kan',
//     driverId: 'DRV123456',
//     nationalId: '1234567890',
//     deliveryProvider: 'Speedy Deliveries',
//     phoneNumber: '555-123-4567',
//     availability: 'Available',
//     status: 'Active', // Fixed status
//   };

//   // State for file inputs
//   const [attachments, setAttachments] = useState({
//     personalPhoto: null,
//     drivingLicenseCopy: null,
//     idIqamaCopy: null,
//     vehicleRegistrationCopy: null,
//     additionalFile1: null,
//     additionalFile2: null,
//   });

//   // Handler for file input changes
//   const handleFileChange = (e, fileType) => {
//     const file = e.target.files[0];
//     setAttachments(prevAttachments => ({
//       ...prevAttachments,
//       [fileType]: file,
//     }));
//   };

//   const getFileName = (file) => {
//     return file ? file.name : 'No file chosen';
//   };

//   return (
//     <div className="min-h-screen bg-black text-gray-200 font-inter p-8">
//       {/* Main Content */}
//       <div className="flex flex-col">
//         {/* Top Bar for Language and User Icon */}
//         <div className="flex justify-end items-center mb-6">
//           <div className="flex items-center space-x-4">
//             <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm transition-colors">
//               English <ChevronDown size={16} className="ml-1" />
//             </button>
//             <CircleUserRound size={24} className="text-green-400" />
//           </div>
//         </div>

//         {/* Breadcrumb */}
//         <div className="text-sm text-gray-400 mb-6">Driver Management / Driver Profile</div>

//         {/* Driver Profile Header Section */}
//         <div className="bg-gray-900 p-6 rounded-lg flex items-center mb-8">
//           <img
//             src={driverProfilePicture}
//             alt="Driver Avatar"
//             className="w-24 h-24 rounded-full object-cover mr-6"
//             onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/535c9b/ffffff?text=Avatar'; }} // Fallback
//           />
//           <div>
//             <h1 className="text-3xl font-semibold text-white mb-2">Driver Profile</h1>
//             <h2 className="text-2xl font-medium text-green-400 mb-4">{driverHeaderData.name}</h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-2 text-sm text-gray-400">
//               <div><span className="font-semibold text-gray-300">Driver ID:</span> {driverHeaderData.driverId}</div>
//               <div><span className="font-semibold text-gray-300">National ID:</span> {driverHeaderData.nationalId}</div>
//               <div><span className="font-semibold text-gray-300">Delivery Provider:</span> {driverHeaderData.deliveryProvider}</div>
//               <div><span className="font-semibold text-gray-300">Phone Number:</span> {driverHeaderData.phoneNumber}</div>
//               <div><span className="font-semibold text-gray-300">Availability:</span> {driverHeaderData.availability}</div>
//               <div>
//                 <span className="font-semibold text-gray-300">Status:</span>{' '}
//                 <button
//                   className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
//                     driverHeaderData.status === 'Active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
//                   }`}
//                   disabled
//                 >
//                   {driverHeaderData.status}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs for Driver Details */}
//         <div className="flex space-x-4 mb-8 border-b border-gray-700">
//           <Link to="/driver-management/Driver_profile">
//           <button
//             className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
//               activeTab === 'Driver Information' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
//             }`}
//             onClick={() => setActiveTab('Driver Information')}
//           >
//             Driver Information
//             </button>
//           </Link>
//           <Link to={"/driver-management/vehicle_information"}>
//           <button
//             className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
//               activeTab === 'Vehicle Information' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
//             }`}
//             onClick={() => setActiveTab('Vehicle Information')}
//           >
//             Vehicle Information
//             </button>
//           </Link>
//           <Link to={"/driver-management/attachments"}>
//           <button
//             className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
//               activeTab === 'Attachments' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
//             }`}
//             onClick={() => setActiveTab('Attachments')}
//           >
//             Attachments
//             </button>
//           </Link>
//           <Link to={"/driver-management/logs"}>
//           <button
//             className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
//               activeTab === 'Logs' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
//             }`}
//             onClick={() => setActiveTab('Logs')}
//           >
//             Logs
//           </button></Link>
//         </div>

//         {/* Content based on active tab */}
//         <div className="bg-gray-900 p-6 rounded-lg mb-8">
//           {activeTab === 'Attachments' && (
//             <div className="space-y-6">
//               {/* Driver's Personal Photo */}
//               <div>
//                 <label className="block text-gray-300 text-lg font-medium mb-2">Driver's Personal Photo</label>
//                 <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
//                   <input
//                     type="text"
//                     readOnly
//                     value={getFileName(attachments.personalPhoto)}
//                     className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
//                   />
//                   <label htmlFor="personalPhoto" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
//                     <Upload size={18} className="mr-2" /> Upload
//                   </label>
//                   <input
//                     type="file"
//                     id="personalPhoto"
//                     className="hidden"
//                     onChange={(e) => handleFileChange(e, 'personalPhoto')}
//                   />
//                 </div>
//               </div>

//               {/* Driving License Copy */}
//               <div>
//                 <label className="block text-gray-300 text-lg font-medium mb-2">Driving License Copy</label>
//                 <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
//                   <input
//                     type="text"
//                     readOnly
//                     value={getFileName(attachments.drivingLicenseCopy)}
//                     className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
//                   />
//                   <label htmlFor="drivingLicenseCopy" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
//                     <Upload size={18} className="mr-2" /> Upload
//                   </label>
//                   <input
//                     type="file"
//                     id="drivingLicenseCopy"
//                     className="hidden"
//                     onChange={(e) => handleFileChange(e, 'drivingLicenseCopy')}
//                   />
//                 </div>
//               </div>

//               {/* ID/Iqama Copy */}
//               <div>
//                 <label className="block text-gray-300 text-lg font-medium mb-2">ID/Iqama Copy</label>
//                 <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
//                   <input
//                     type="text"
//                     readOnly
//                     value={getFileName(attachments.idIqamaCopy)}
//                     className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
//                   />
//                   <label htmlFor="idIqamaCopy" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
//                     <Upload size={18} className="mr-2" /> Upload
//                   </label>
//                   <input
//                     type="file"
//                     id="idIqamaCopy"
//                     className="hidden"
//                     onChange={(e) => handleFileChange(e, 'idIqamaCopy')}
//                   />
//                 </div>
//               </div>

//               {/* Vehicle Registration / Istimara Copy */}
//               <div>
//                 <label className="block text-gray-300 text-lg font-medium mb-2">Vehicle Registration / Istimara Copy</label>
//                 <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
//                   <input
//                     type="text"
//                     readOnly
//                     value={getFileName(attachments.vehicleRegistrationCopy)}
//                     className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
//                   />
//                   <label htmlFor="vehicleRegistrationCopy" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
//                     <Upload size={18} className="mr-2" /> Upload
//                   </label>
//                   <input
//                     type="file"
//                     id="vehicleRegistrationCopy"
//                     className="hidden"
//                     onChange={(e) => handleFileChange(e, 'vehicleRegistrationCopy')}
//                   />
//                 </div>
//               </div>

//               {/* Additional File (1) */}
//               <div>
//                 <label className="block text-gray-300 text-lg font-medium mb-2">Additional File (1)</label>
//                 <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
//                   <input
//                     type="text"
//                     readOnly
//                     value={getFileName(attachments.additionalFile1)}
//                     className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
//                   />
//                   <label htmlFor="additionalFile1" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
//                     <Upload size={18} className="mr-2" /> Upload
//                   </label>
//                   <input
//                     type="file"
//                     id="additionalFile1"
//                     className="hidden"
//                     onChange={(e) => handleFileChange(e, 'additionalFile1')}
//                   />
//                 </div>
//               </div>

//               {/* Additional File (2) */}
//               <div>
//                 <label className="block text-gray-300 text-lg font-medium mb-2">Additional File (2)</label>
//                 <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
//                   <input
//                     type="text"
//                     readOnly
//                     value={getFileName(attachments.additionalFile2)}
//                     className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
//                   />
//                   <label htmlFor="additionalFile2" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center h-full">
//                     <Upload size={18} className="mr-2" /> Upload
//                   </label>
//                   <input
//                     type="file"
//                     id="additionalFile2"
//                     className="hidden"
//                     onChange={(e) => handleFileChange(e, 'additionalFile2')}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//           {activeTab === 'Driver Information' && <div className="text-gray-400">Driver Information content goes here.</div>}
//           {activeTab === 'Vehicle Information' && <div className="text-gray-400">Vehicle Information content goes here.</div>}
//           {activeTab === 'Logs' && <div className="text-gray-400">Logs content goes here.</div>}
//         </div>

//         {/* Save Button (unchanged from previous context, but could be 'Edit' or 'Upload') */}
//         <div className="flex justify-center">
//           <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors">
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Driver_manage_attachment;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  User,
  FileText,
  Car,
  Building,
  ArrowLeft,
  ArrowRight,
  Save,
  AlertTriangle,
  CheckCircle,
  Upload
} from 'lucide-react';

const AddDriverForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    driver_name: '',
    gender: '',
    iqama: '',
    mobile: '',
    city: '',
    nationality: '',
    dob: '',
    vehicle: '',
    company: '',
    status: 'pending',
    documents: {
      iqama_document: null,
      iqama_expiry: '',
      passport_document: null,
      passport_expiry: '',
      license_document: null,
      license_expiry: '',
      visa_document: null,
      visa_expiry: '',
      medical_document: null,
      medical_expiry: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, companiesRes] = await Promise.all([
        axiosInstance.get('/vehicles/'),
        axiosInstance.get('/companies/')
      ]);

      setVehicles(vehiclesRes.data.results || vehiclesRes.data || []);
      setCompanies(companiesRes.data.results || companiesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    switch (stepNumber) {
      case 0:
        if (!formData.driver_name.trim()) newErrors.driver_name = 'Driver name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.iqama.trim()) newErrors.iqama = 'Iqama number is required';
        if (formData.iqama.length !== 10) newErrors.iqama = 'Iqama must be 10 digits';
        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        break;
      case 2:
        if (!formData.company) newErrors.company = 'Company selection is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      // Validate file size (max 5MB)
      if (files[0].size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [name]: files[0]
        }
      }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: value
      }
    }));
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(step)) {
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Append basic driver information
      data.append('driver_name', formData.driver_name);
      data.append('gender', formData.gender);
      data.append('iqama', formData.iqama);
      data.append('mobile', formData.mobile);
      data.append('city', formData.city);
      data.append('nationality', formData.nationality);
      data.append('dob', formData.dob);
      data.append('status', formData.status);

      // Append company and vehicle if selected
      if (formData.company) data.append('company', formData.company);
      if (formData.vehicle) data.append('vehicle', formData.vehicle);

      // Append documents
      Object.entries(formData.documents).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          data.append(key, value);
        } else if (value && typeof value === 'string' && value.trim()) {
          data.append(key, value);
        }
      });

      const response = await axiosInstance.post('/Register/drivers/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Driver registered successfully!');
      console.log('Driver created:', response.data);

      // Navigate to driver list or profile
      navigate('/registration-management');

    } catch (error) {
      console.error('Error submitting form:', error);

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = {};
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              fieldErrors[key] = errorData[key][0];
            } else {
              fieldErrors[key] = errorData[key];
            }
          });
          setErrors(fieldErrors);
          toast.error('Please check the form for errors');
        } else {
          toast.error('Failed to register driver');
        }
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.driver_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.driver_name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.driver_name}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Iqama Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Iqama Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="iqama"
                  value={formData.iqama}
                  onChange={handleChange}
                  placeholder="Enter 10-digit Iqama number"
                  maxLength="10"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.iqama ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.iqama && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.iqama}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+966 50 123 4567"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="Enter nationality"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.nationality ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.nationality && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.nationality}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.dob ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.dob && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.dob}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Document Upload</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { label: 'Iqama', name: 'iqama_document', expiry: 'iqama_expiry', required: true },
                { label: 'Passport', name: 'passport_document', expiry: 'passport_expiry', required: false },
                { label: 'Driving License', name: 'license_document', expiry: 'license_expiry', required: true },
                { label: 'Visa', name: 'visa_document', expiry: 'visa_expiry', required: false },
                { label: 'Medical Certificate', name: 'medical_document', expiry: 'medical_expiry', required: false },
              ].map(({ label, name, expiry, required }) => (
                <div key={name} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    {label} {required && <span className="text-red-500 ml-1">*</span>}
                  </h4>

                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Document
                      </label>
                      <input
                        type="file"
                        name={name}
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted formats: PDF, JPG, PNG (Max 5MB)
                      </p>
                      {formData.documents[name] && (
                        <p className="text-green-600 text-sm mt-1 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          File selected: {formData.documents[name].name}
                        </p>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name={expiry}
                        value={formData.documents[expiry] || ''}
                        onChange={handleDateChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Please ensure all documents are clear and readable.
                Required documents must be uploaded to proceed.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Building className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Company & Vehicle Assignment</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Company <span className="text-red-500">*</span>
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.company ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
                {errors.company && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.company}
                  </p>
                )}
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Vehicle <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Vehicle (Optional)</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_name || vehicle.vehicle_type} - {vehicle.plate_number || vehicle.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-800 mb-4">Registration Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Driver Name:</span>
                  <span className="ml-2 font-medium">{formData.driver_name || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Iqama:</span>
                  <span className="ml-2 font-medium">{formData.iqama || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mobile:</span>
                  <span className="ml-2 font-medium">{formData.mobile || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Company:</span>
                  <span className="ml-2 font-medium">
                    {formData.company ?
                      companies.find(c => c.id == formData.company)?.company_name || 'Selected'
                      : 'Not selected'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Personal Information',
    'Document Upload',
    'Company Assignment'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Driver</h1>
              <p className="text-gray-600 mt-2">Complete the registration process in 3 simple steps</p>
            </div>
            <button
              onClick={() => navigate('/registration-management')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Drivers
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  index <= step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {index < step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    index <= step ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Step {index + 1}
                  </p>
                  <p className={`text-xs ${
                    index <= step ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {title}
                  </p>
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    index < step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 0}
                  className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Register Driver
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDriverForm;
