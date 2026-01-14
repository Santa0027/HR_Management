import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, CircleUserRound, ChevronLeft, ChevronRight
} from 'lucide-react';

function Reg_ma_new_request() {
  const [activeTab, setActiveTab] = useState('New Request');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterVehicleType, setFilterVehicleType] = useState('');
  const [filterRequestStatus, setFilterRequestStatus] = useState('');
  const [filterRequestId, setFilterRequestId] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterApproval, setFilterApproval] = useState('');

  // Fetch driver data from API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('http://localhost:8000/Register/drivers/');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setDrivers(data);
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
        setError("Unable to load drivers.");
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  // Filtered drivers based on selected filters
  const filteredDrivers = drivers.filter(driver => {
    return (
      (filterVehicleType === '' || driver.vehicle === filterVehicleType) &&
      (filterRequestStatus === '' || driver.status === filterRequestStatus) &&
      (filterRequestId === '' || String(driver.id).includes(filterRequestId)) &&
      (filterCity === '' || driver.city === filterCity) &&
      (filterApproval === '' || driver.approval === filterApproval)
    );
  });

  // Reset all filters
  const resetFilters = () => {
    setFilterVehicleType('');
    setFilterRequestStatus('');
    setFilterRequestId('');
    setFilterCity('');
    setFilterApproval('');
  };

  // Extract unique options for dropdowns
  const getUniqueOptions = (key) => [...new Set(drivers.map(driver => driver[key]).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white text-[#1E2022] font-inter">
      <div className="flex flex-col p-8">
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
          <div className="text-sm text-[#52616B]">Organization / Registration Management</div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm  transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-[#1E2022]" />
          </div>
        </header>

        {/* Page Title & Add Driver */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-[#187795]">Driver Registration Management</h1>
          <Link to="/adddriverform">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Add Driver
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <Link to="/registration-management">
            <button className={`bg-[#284B63] px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'New Request' ? 'bg-gray-900 text-white' : 'hover:bg-gray-800 text-gray-400'}`}>
              New Request
            </button>
          </Link>
          <Link to="/registration-management/aproval_status">
            <button className={` px-4 py-2 rounded-t-lg font-medium transition-colors hover:bg-gray-800 hover:text-white text-gray-500S`}>
              Completed Requests
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#C9D6DF] p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label htmlFor="vehicleType" className="block text-[#353535] text-sm mb-2">Vehicle Type</label>
            <select
              id="vehicleType"
              value={filterVehicleType}
              onChange={e => setFilterVehicleType(e.target.value)}
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            >
              {getUniqueOptions("vehicle").map(vehicle => (
                <option className="bg-[#D9D9D9]" key={vehicle.id} value={vehicle.vehicle_type}>
                  {vehicle.vehicle_type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="requestStatus" className="block text-[#353535] text-sm mb-2">Request Status</label>
            <select
              id="requestStatus"
              value={filterRequestStatus}
              onChange={e => setFilterRequestStatus(e.target.value)}
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            >
              <option value="">Select Request Status</option>
              {getUniqueOptions("status").map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="requestId" className="block text-[#353535] text-sm mb-2">Request ID</label>
            <input
              type="text"
              id="requestId"
              value={filterRequestId}
              onChange={e => setFilterRequestId(e.target.value)}
              placeholder="Enter Request ID"
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-[#353535]text-sm mb-2">City</label>
            <select
              id="city"
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            >
              <option value="">Select City</option>
              {getUniqueOptions("city").map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="approval" className="block text-[#353535]text-sm mb-2">Approval</label>
            <select
              id="approval"
              value={filterApproval}
              onChange={e => setFilterApproval(e.target.value)}
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            >
              <option value="">Select Approval</option>
              {getUniqueOptions("approval").map(appr => (
                <option key={appr} value={appr}>{appr}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium">Sorting</button>
            <button
              onClick={resetFilters}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-gray-900 rounded-lg">
            <thead>
              <tr className="bg-[#284B63] text-white uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left rounded-tl-lg">Request Number</th>
                <th className="py-3 px-6 text-left">Driver ID</th>
                <th className="py-3 px-6 text-left">Driver Name</th>
                <th className="py-3 px-6 text-left">Phone Number</th>
                <th className="py-3 px-6 text-left">Delivery Provider</th>
                <th className="py-3 px-6 text-left">Tawseel Approval</th>
                <th className="py-3 px-6 text-left">Vehicle Type</th>
                <th className="py-3 px-6 text-left">City</th>
                <th className="py-3 px-6 text-left">Request Status</th>
                <th className="py-3 px-6 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 bg-[#C9D6DF] text-sm font-light">
              {loading ? (
                <tr><td colSpan="11" className="py-6 text-center">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="11" className="py-6 text-center text-red-400">{error}</td></tr>
              ) : filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver, index) => (
                  <tr key={index} className="border-b text-[#353535] font-bold border-gray-800 hover:bg-white transition-colors">
                    <td className="py-3 px-6">{driver.driver_}</td>
                    <td className="py-3 px-6">{driver.iqama}</td>
                    <td className="py-3 px-6">{driver.driver_name}</td>
                    <td className="py-3 px-6">{driver.mobile}</td>
                    <td className="py-3 px-6">{driver.company}</td>
                    <td className="py-3 px-6">{driver.approval}</td>
                    <td className="py-3 px-6">
                      {driver.vehicle ? driver.vehicle.vehicle_type : 'No Vehicle Assigned'}
                    </td>
                    <td className="py-3 px-6">{driver.city}</td>
                    <td className="py-3 px-6">{driver.status}</td>
                    <td className="py-3 px-6 text-center">
                      <Link to={`/profileedit/${driver.id}`}>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-sm">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="11" className="py-6 text-center text-gray-500">No Entries Available</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-auto space-x-2 text-sm text-gray-400">
          <button className="p-2 rounded-full hover:bg-gray-800"><ChevronLeft size={16} /></button>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full">1</span>
          <button className="p-2 rounded-full hover:bg-gray-800"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}

export default Reg_ma_new_request;


