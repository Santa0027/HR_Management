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

const AddDriverForm = () => {
  const [step, setStep] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    driver_name: '',
    gender: '',
    iqama: '',
    mobile: '',
    city: '',
    nationality: '',
    dob: '',
    vehicleType: '',
    company: '',
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
    fetch('http://localhost:8000/vehicles/')
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Error fetching vehicles:', err));

    fetch('http://localhost:8000/company/')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error('Error fetching companies:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: files[0]
      }
    }));
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
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
     console.log('Submitting...'); // ← Debug line
    const data = new FormData();
    data.append('driver_name', formData.driver_name);
    data.append('gender', formData.gender);
    data.append('iqama', formData.iqama);
    data.append('mobile', formData.mobile);
    data.append('city', formData.city);
    data.append('nationality', formData.nationality);
    data.append('dob', formData.dob);
    data.append('vehicleType', formData.vehicleType);
    data.append('company', formData.company);

    Object.entries(formData.documents).forEach(([key, value]) => {
      if (value) {
        data.append(key, value);
      }
    });

    fetch('http://localhost:8000/Register/drivers/', {
      method: 'POST',
      body: data
    })
      .then(res => res.json())
      .then(data => {
        alert('Driver added successfully!');
        console.log(data);
      })
      .catch(err => {
        console.error('Error submitting form:', err);
      });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid gap-4">
            <input type="text" name="driver_name" value={formData.driver_name} onChange={handleChange} placeholder="Name" className="p-2 border rounded bg-gray-800 text-white" />
            <select name="gender" value={formData.gender} onChange={handleChange} className="p-2 border rounded bg-gray-800 text-white">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input type="text" name="iqama" value={formData.iqama} onChange={handleChange} placeholder="Iqama Number" className="p-2 border rounded bg-gray-800 text-white" />
            <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" className="p-2 border rounded bg-gray-800 text-white" />
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="p-2 border rounded bg-gray-800 text-white" />
            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nationality" className="p-2 border rounded bg-gray-800 text-white" />
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="p-2 border rounded bg-gray-800 text-white" />
          </div>
        );

      case 1:
        return (
          <div className="grid gap-4">
            {[
              { label: 'Iqama', name: 'iqama_document', expiry: 'iqama_expiry' },
              { label: 'Passport', name: 'passport_document', expiry: 'passport_expiry' },
              { label: 'License', name: 'license_document', expiry: 'license_expiry' },
              { label: 'Visa', name: 'visa_document', expiry: 'visa_expiry' },
              { label: 'Medical', name: 'medical_document', expiry: 'medical_expiry' },
            ].map(({ label, name, expiry }) => (
              <div key={name} className="space-y-2">
                <label className="block text-sm">{label} Document:</label>
                <input type="file" name={name} onChange={handleFileChange} className="p-2 border rounded bg-gray-800 text-white" />
                <label className="block text-sm">{label} Expiry:</label>
                <input type="date" name={expiry} value={formData.documents[expiry] || ''} onChange={handleDateChange} className="p-2 border rounded bg-gray-800 text-white" />
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="grid gap-4">
            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="p-2 border rounded bg-gray-800 text-white">
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_name}</option>
              ))}
            </select>
            <select name="company" value={formData.company} onChange={handleChange} className="p-2 border rounded bg-gray-800 text-white">
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.company_name}</option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-black text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Driver</h2>
      <form onSubmit={handleSubmit}>
        {renderStep()}

        <div className="flex justify-between mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddDriverForm;
