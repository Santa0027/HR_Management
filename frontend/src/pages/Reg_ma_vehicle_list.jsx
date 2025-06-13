import React, { useState } from 'react';
import { ChevronDown, CircleUserRound, ChevronLeft, ChevronRight } from 'lucide-react'; // Importing icons
import { Link } from "react-router-dom";
// import { ThemeContext } from '../context/ThemeContext.jsx'; // Explicitly added .jsx extension

function Reg_ma_vehicle_list() {
  const [activeTab, setActiveTab] = useState('All Vehicles'); // State for active tab, default to 'All Vehicles'
  const [currentPage, setCurrentPage] = useState(1); // State for current pagination page

  // State for filter inputs
  const [filters, setFilters] = useState({
    vehicleType: '',
    registrationStatus: '',
    vehicleNumber: '',
    chassisNumber: '', // Changed from city to chassisNumber
    insuranceStatus: '',
  });

  // Sample data for the vehicle list table
  const allVehicles = [
    {
      vehicleNumber: 'VHC001',
      vehicleName: 'Ford Transit',
      vehicleType: 'Van',
      registrationStatus: 'Registered',
      insuranceExpiry: '2025-10-20',
      serviceDate: '2024-11-01',
      chassisNumber: 'VNC-789012345', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC002',
      vehicleName: 'Honda CBR',
      vehicleType: 'Motorcycle',
      registrationStatus: 'Pending',
      insuranceExpiry: '2024-07-15',
      serviceDate: '2024-06-01',
      chassisNumber: 'MTC-234567890', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC003',
      vehicleName: 'Toyota Camry',
      vehicleType: 'Car',
      registrationStatus: 'Registered',
      insuranceExpiry: '2026-03-01',
      serviceDate: '2025-01-10',
      chassisNumber: 'CAR-567890123', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC004',
      vehicleName: 'Mercedes Actros',
      vehicleType: 'Truck',
      registrationStatus: 'Registered',
      insuranceExpiry: '2025-12-31',
      serviceDate: '2024-09-05',
      chassisNumber: 'TRK-901234567', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC005',
      vehicleName: 'BMW S1000RR',
      vehicleType: 'Motorcycle',
      registrationStatus: 'Expired',
      insuranceExpiry: '2023-01-01',
      serviceDate: '2023-01-01',
      chassisNumber: 'MTC-112233445', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC006',
      vehicleName: 'Hyundai H1',
      vehicleType: 'Van',
      registrationStatus: 'Registered',
      insuranceExpiry: '2025-08-20',
      serviceDate: '2024-07-10',
      chassisNumber: 'VNC-445566778', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC007',
      vehicleName: 'Nissan Sunny',
      vehicleType: 'Car',
      registrationStatus: 'Registered',
      insuranceExpiry: '2026-05-01',
      serviceDate: '2025-03-15',
      chassisNumber: 'CAR-990011223', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC008',
      vehicleName: 'Volvo FH16',
      vehicleType: 'Truck',
      registrationStatus: 'Registered',
      insuranceExpiry: '2025-09-30',
      serviceDate: '2024-08-20',
      chassisNumber: 'TRK-223344556', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC009',
      vehicleName: 'Ford F-150',
      vehicleType: 'Truck',
      registrationStatus: 'Registered',
      insuranceExpiry: '2025-07-25',
      serviceDate: '2024-06-12',
      chassisNumber: 'TRK-566677889', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC010',
      vehicleName: 'Kia Carnival',
      vehicleType: 'Van',
      registrationStatus: 'Pending',
      insuranceExpiry: '2024-11-11',
      serviceDate: '2024-09-20',
      chassisNumber: 'VNC-001122334', // Added chassis number
      action: '-',
    },
    // Add more data to ensure multiple pages
    {
      vehicleNumber: 'VHC011',
      vehicleName: 'Suzuki Swift',
      vehicleType: 'Car',
      registrationStatus: 'Registered',
      insuranceExpiry: '2026-01-01',
      serviceDate: '2025-01-01',
      chassisNumber: 'CAR-334455667', // Added chassis number
      action: '-',
    },
    {
      vehicleNumber: 'VHC012',
      vehicleName: 'Harley-Davidson',
      vehicleType: 'Motorcycle',
      registrationStatus: 'Registered',
      insuranceExpiry: '2025-04-05',
      serviceDate: '2024-03-01',
      chassisNumber: 'MTC-778899001', // Added chassis number
      action: '-',
    },
  ];

  const itemsPerPage = 8; // Number of items to display per page
  const totalPages = Math.ceil(allVehicles.length / itemsPerPage); // Calculate total pages dynamically

  // Get vehicles for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = allVehicles.slice(startIndex, endIndex);

  // Handler for filter input changes
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
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
           {/* Theme Toggle Button - Ensure ThemeProvider wraps your App component
           <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-900 hover:bg-gray-800 text-green-400' : 'bg-gray-200 hover:bg-gray-300 text-green-600'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button> */}
            {/* <CircleUserRound size={24} className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} /> */}
            <CircleUserRound size={24} className="text-green-400" />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">Organization / Vehicle Registration Management</div>

        {/* Page Title & Add Vehicle Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Vehicle Registration Management</h1>
          <div className="flex space-x-4">
            <Link to="/vehicle-registration" >
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Add Vehicle
            </button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'All Vehicles' ? 'bg-gray-900 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('All Vehicles')}
          >
            All Vehicles ( {allVehicles.length} )
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Pending Approval' ? 'bg-gray-900 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Pending Approval')}
          >
            Pending Approval ( 0 ) {/* Placeholder count */}
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label htmlFor="vehicleType" className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
            <select
              id="vehicleType"
              value={filters.vehicleType}
              onChange={handleFilterChange}
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
            <label htmlFor="registrationStatus" className="block text-gray-400 text-sm mb-2">Registration Status</label>
            <select
              id="registrationStatus"
              value={filters.registrationStatus}
              onChange={handleFilterChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Status</option>
              <option value="Registered">Registered</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div>
            <label htmlFor="vehicleNumber" className="block text-gray-400 text-sm mb-2">Vehicle Number</label>
            <input
              type="text"
              id="vehicleNumber"
              placeholder="Enter Vehicle Number"
              value={filters.vehicleNumber}
              onChange={handleFilterChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="chassisNumber" className="block text-gray-400 text-sm mb-2">Chassis Number</label>
            <input
              type="text"
              id="chassisNumber"
              placeholder="Enter Chassis Number"
              value={filters.chassisNumber}
              onChange={handleFilterChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="insuranceStatus" className="block text-gray-400 text-sm mb-2">Insurance Status</label>
            <select
              id="insuranceStatus"
              value={filters.insuranceStatus}
              onChange={handleFilterChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Status</option>
              <option value="Valid">Valid</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="flex space-x-2 col-span-full justify-end">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
              Sorting
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
              Reset All
            </button>
          </div>
        </div>

        {/* Vehicle List Table */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-gray-900 rounded-lg">
            <thead>
              <tr className="bg-gray-800 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left rounded-tl-lg">Vehicle Number</th>
                <th className="py-3 px-6 text-left">Vehicle Name</th>
                <th className="py-3 px-6 text-left">Vehicle Type</th>
                <th className="py-3 px-6 text-left">Chassis Number</th>
                <th className="py-3 px-6 text-left">Registration Status</th>
                <th className="py-3 px-6 text-left">Insurance Expiry</th>
                <th className="py-3 px-6 text-left">Service Date</th>
                <th className="py-3 px-6 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 text-sm font-light">
              {currentVehicles.map((vehicle, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-700">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicleNumber}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicleName}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicleType}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.chassisNumber}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <span className={`py-1 px-3 rounded-full text-xs ${
                      vehicle.registrationStatus === 'Registered' ? 'bg-green-700 text-green-100' :
                      vehicle.registrationStatus === 'Pending' ? 'bg-yellow-700 text-yellow-100' :
                      'bg-red-700 text-red-100'
                    }`}>
                      {vehicle.registrationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.insuranceExpiry}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.serviceDate}</td>
                  <td className="py-3 px-6 text-center whitespace-nowrap">{vehicle.action}</td>
                </tr>
              ))}
              {currentVehicles.length === 0 && (
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-6 text-center" colSpan="8">
                    <div className="text-lg font-semibold mt-8 mb-2">No Vehicles Found</div>
                    <div className="text-sm text-gray-500 mb-8">
                      Adjust your filters or add new vehicles.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-auto space-x-2 text-sm text-gray-400">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full transition-colors hover:bg-gray-800 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === index + 1
                    ? 'bg-green-600 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full transition-colors hover:bg-gray-800 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
}

export default Reg_ma_vehicle_list;
