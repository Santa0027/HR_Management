import React, { useState, useEffect } from 'react';
import { ChevronDown, CircleUserRound } from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';

function Reg_ma_vehicle_list() {
  const [activeTab, setActiveTab] = useState('All Vehicles');
  const [currentPage, setCurrentPage] = useState(1);
  const [allVehicles, setAllVehicles] = useState([]);
  const [filters, setFilters] = useState({
    vehicleType: '',
    registrationStatus: '',
    vehicleNumber: '',
    chassisNumber: '',
    insuranceStatus: '',
  });

  const itemsPerPage = 8;

  useEffect(() => {
    axios.get('http://localhost:8000/vehicles/')
      .then(response => {
        setAllVehicles(response.data);
      })
      .catch(error => {
        console.error('Error fetching vehicle data:', error);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [id]: value,
    }));
    setCurrentPage(1);
  };

  const applyFilters = (vehicles) => {
    return vehicles.filter(vehicle => {
      return (
        (!filters.vehicleType || vehicle.vehicle_type === filters.vehicleType) &&
        (!filters.registrationStatus || vehicle.approval_status === filters.registrationStatus) &&
        (!filters.vehicleNumber || vehicle.vehicle_number.toLowerCase().includes(filters.vehicleNumber.toLowerCase())) &&
        (!filters.chassisNumber || (vehicle.Chassis_Number && vehicle.Chassis_Number.toLowerCase().includes(filters.chassisNumber.toLowerCase()))) &&
        (!filters.insuranceStatus || (filters.insuranceStatus === 'Valid' ? new Date(vehicle.insurance_expiry_date) >= new Date() : new Date(vehicle.insurance_expiry_date) < new Date()))
      );
    });
  };

  const filteredVehicles = applyFilters(allVehicles);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-inter p-8">
      <div className="flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-green-400" />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">
          Organization / Vehicle Registration Management
        </div>

        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Vehicle Registration Management</h1>
          <Link to="/vehicle-registration">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Add Vehicle
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'All Vehicles' ? 'bg-gray-900 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
            onClick={() => setActiveTab('All Vehicles')}
          >
            All Vehicles ({filteredVehicles.length})
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'Pending Approval' ? 'bg-gray-900 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
            onClick={() => setActiveTab('Pending Approval')}
          >
            Pending Approval ({filteredVehicles.filter(v => v.approval_status === 'Pending').length})
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label htmlFor="vehicleType" className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
            <select id="vehicleType" value={filters.vehicleType} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white">
              <option value="">Select Vehicle Type</option>
              <option value="CAR">Car</option>
              <option value="BIKE">BIKE</option>
              <option value="VAN">Van</option>
              <option value="TRUCK">Truck</option>
            </select>
          </div>
          <div>
            <label htmlFor="registrationStatus" className="block text-gray-400 text-sm mb-2">Registration Status</label>
            <select id="registrationStatus" value={filters.registrationStatus} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white">
              <option value="">Select Status</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
          <div>
            <label htmlFor="vehicleNumber" className="block text-gray-400 text-sm mb-2">Vehicle Number</label>
            <input type="text" id="vehicleNumber" value={filters.vehicleNumber} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white" />
          </div>
          <div>
            <label htmlFor="chassisNumber" className="block text-gray-400 text-sm mb-2">Chassis Number</label>
            <input type="text" id="chassisNumber" value={filters.chassisNumber} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white" />
          </div>
          <div>
            <label htmlFor="insuranceStatus" className="block text-gray-400 text-sm mb-2">Insurance Status</label>
            <select id="insuranceStatus" value={filters.insuranceStatus} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white">
              <option value="">Select</option>
              <option value="Valid">Valid</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Vehicle Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-gray-800 text-white">
            <thead>
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Vehicle Number</th>
                <th className="px-4 py-3">Vehicle Name</th>
                <th className="px-4 py-3">Vehicle Type</th>
                <th className="px-4 py-3">Registration Status</th>
                <th className="px-4 py-3">Insurance Expiry</th>
                <th className="px-4 py-3">Service Date</th>
                <th className="px-4 py-3">Chassis Number</th>
                <th className="px-4 py-3">Actions</th> {/* New column */}
              </tr>
            </thead>
            <tbody>
              {currentVehicles.map((vehicle, index) => (
                <tr key={vehicle.id || index} className="border-t border-gray-700">
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">{vehicle.vehicle_number}</td>
                  <td className="px-4 py-3">{vehicle.vehicle_name}</td>
                  <td className="px-4 py-3">{vehicle.vehicle_type}</td>
                  <td className="px-4 py-3">{vehicle.approval_status}</td>
                  <td className="px-4 py-3">{vehicle.insurance_expiry_date || '—'}</td>
                  <td className="px-4 py-3">{vehicle.service_date || '—'}</td>
                  <td className="px-4 py-3">{vehicle.Chassis_Number || '—'}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/vehicles/${vehicle.id}`} // Assumes this route exists
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm mt-1">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reg_ma_vehicle_list;
