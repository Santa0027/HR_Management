import React, { useState } from 'react';
import { ChevronDown, CircleUserRound } from 'lucide-react'; // Importing icons

function Driver_mange_vehicle_info() {
  const [activeTab, setActiveTab] = useState('Vehicle Information'); // Default to Vehicle Information tab
  const [driverProfilePicture] = useState('https://placehold.co/100x100/535c9b/ffffff?text=Avatar'); // Placeholder for driver image

  // Sample data for the driver profile (read-only for the header)
  const driverHeaderData = {
    name: 'Ethan kan',
    driverId: 'DRV123456',
    nationalId: '1234567890',
    deliveryProvider: 'Speedy Deliveries',
    phoneNumber: '555-123-4567',
    availability: 'Available',
    status: 'Active', // Fixed status
  };

  // State for Vehicle Information form inputs
  const [vehicleInfo, setVehicleInfo] = useState({
    vehicleType: '',
    vehicleName: '',
    vehicleSequenceNumber: '',
    vehicleModel: '',
    drivingLicenseExpiry: '',
    vehicleChassisNumber: '', // Added new state for Vehicle Chassis Number
  });

  // Sample data for the Vehicle List table
  const vehicleList = [
    {
      vehicleNumber: 'VHC001',
      vehicleType: 'Motorcycle',
      vehicleChassisNumber: 'CHAS123456789', // Added sample chassis number
      assignedDate: '2023-01-15',
      changedDate: '2023-05-20',
      reasonForChange: 'Maintenance',
    },
    {
      vehicleNumber: 'VHC002',
      vehicleType: 'Car',
      vehicleChassisNumber: 'CHAS987654321', // Added sample chassis number
      assignedDate: '2023-05-20',
      changedDate: '2023-08-10',
      reasonForChange: 'Upgrade',
    },
    {
      vehicleNumber: 'VHC003',
      vehicleType: 'Van',
      vehicleChassisNumber: 'CHAS112233445', // Added sample chassis number
      assignedDate: '2023-08-10',
      changedDate: '2024-01-05',
      reasonForChange: 'Capacity',
    },
    {
      vehicleNumber: 'VHC004',
      vehicleType: 'Motorcycle',
      vehicleChassisNumber: 'CHAS667788990', // Added sample chassis number
      assignedDate: '2024-01-05',
      changedDate: 'N/A',
      reasonForChange: 'New Assignment',
    },
  ];

  // Handler for Vehicle Information input changes
  const handleVehicleInputChange = (e) => {
    const { id, value } = e.target;
    setVehicleInfo(prevInfo => ({
      ...prevInfo,
      [id]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-inter p-8">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Top Bar for Language and User Icon */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-green-400" />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">Driver Management / Driver Profile</div>

        {/* Driver Profile Header Section */}
        <div className="bg-gray-900 p-6 rounded-lg flex items-center mb-8">
          <img
            src={driverProfilePicture}
            alt="Driver Avatar"
            className="w-24 h-24 rounded-full object-cover mr-6"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/535c9b/ffffff?text=Avatar'; }} // Fallback
          />
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">Driver Profile</h1>
            <h2 className="text-2xl font-medium text-green-400 mb-4">{driverHeaderData.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-2 text-sm text-gray-400">
              <div><span className="font-semibold text-gray-300">Driver ID:</span> {driverHeaderData.driverId}</div>
              <div><span className="font-semibold text-gray-300">National ID:</span> {driverHeaderData.nationalId}</div>
              <div><span className="font-semibold text-gray-300">Delivery Provider:</span> {driverHeaderData.deliveryProvider}</div>
              <div><span className="font-semibold text-gray-300">Phone Number:</span> {driverHeaderData.phoneNumber}</div>
              <div><span className="font-semibold text-gray-300">Availability:</span> {driverHeaderData.availability}</div>
              <div>
                <span className="font-semibold text-gray-300">Status:</span>{' '}
                <button
                  className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
                    driverHeaderData.status === 'Active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                  disabled
                >
                  {driverHeaderData.status}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Driver Details */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Driver Information' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Driver Information')}
          >
            Driver Information
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Vehicle Information' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Vehicle Information')}
          >
            Vehicle Information
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Attachments' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Attachments')}
          >
            Attachments
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Logs' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Logs')}
          >
            Logs
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          {activeTab === 'Vehicle Information' && (
            <div>
              {/* Vehicle Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label htmlFor="vehicleType" className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
                  <select
                    id="vehicleType"
                    value={vehicleInfo.vehicleType}
                    onChange={handleVehicleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vehicleName" className="block text-gray-400 text-sm mb-2">Vehicle Name</label>
                  <input
                    type="text"
                    id="vehicleName"
                    placeholder="Enter Vehicle Name"
                    value={vehicleInfo.vehicleName}
                    onChange={handleVehicleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="vehicleSequenceNumber" className="block text-gray-400 text-sm mb-2">Vehicle Sequence Number</label>
                  <input
                    type="text"
                    id="vehicleSequenceNumber"
                    placeholder="Sequence Number"
                    value={vehicleInfo.vehicleSequenceNumber}
                    onChange={handleVehicleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="vehicleModel" className="block text-gray-400 text-sm mb-2">Vehicle Model</label>
                  <input
                    type="text"
                    id="vehicleModel"
                    placeholder="Enter Vehicle Model"
                    value={vehicleInfo.vehicleModel}
                    onChange={handleVehicleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="drivingLicenseExpiry" className="block text-gray-400 text-sm mb-2">Driving License Expiry</label>
                  <input
                    type="date"
                    id="drivingLicenseExpiry"
                    value={vehicleInfo.drivingLicenseExpiry}
                    onChange={handleVehicleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {/* New: Vehicle Chassis Number Input Field */}
                <div>
                  <label htmlFor="vehicleChassisNumber" className="block text-gray-400 text-sm mb-2">Vehicle Chassis Number</label>
                  <input
                    type="text"
                    id="vehicleChassisNumber"
                    placeholder="Enter Chassis Number"
                    value={vehicleInfo.vehicleChassisNumber}
                    onChange={handleVehicleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Save Button for Vehicle Info */}
              <div className="flex justify-center mb-10">
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors">
                  Save
                </button>
              </div>

              {/* Vehicle List Table */}
              <h3 className="text-xl font-semibold text-white mb-4">Vehicle List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 rounded-lg">
                  <thead>
                    <tr className="bg-gray-800 text-gray-300 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left rounded-tl-lg">Vehicle Number</th>
                      <th className="py-3 px-6 text-left">Vehicle Type</th>
                      <th className="py-3 px-6 text-left">Vehicle Chassis Number</th> {/* New Column Header */}
                      <th className="py-3 px-6 text-left">Assigned Date</th>
                      <th className="py-3 px-6 text-left">Changed Date</th>
                      <th className="py-3 px-6 text-left rounded-tr-lg">Reason for Change</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-400 text-sm font-light">
                    {vehicleList.map((vehicle, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-700">
                        <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicleNumber}</td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicleType}</td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicleChassisNumber}</td> {/* New Column Data */}
                        <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.assignedDate}</td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.changedDate}</td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.reasonForChange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'Driver Information' && <div className="text-gray-400">Driver Information content goes here.</div>}
          {activeTab === 'Attachments' && <div className="text-gray-400">Attachments content goes here.</div>}
          {activeTab === 'Logs' && <div className="text-gray-400">Logs content goes here.</div>}
        </div>
      </div>
    </div>
  );
}

export default Driver_mange_vehicle_info;
