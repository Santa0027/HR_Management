import React, { useState, useEffect } from 'react';
import { ChevronDown, CircleUserRound, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from "react-router-dom";
// Import your configured axiosInstance
import axiosInstance from '../api/axiosInstance'; // Adjust this path based on where you saved axiosConfig.js

function PendingApprovalTabContent() {
  const [activeTab, setActiveTab] = useState('All Vehicles');
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const [currentPagePending, setCurrentPagePending] = useState(1);
  const [allVehicles, setAllVehicles] = useState([]);
  const [filters, setFilters] = useState({
    vehicleType: '',
    registrationStatus: '', // This will map to approval_status
    vehicleNumber: '',
    chassisNumber: '',
    insuranceStatus: '',
  });

  const itemsPerPage = 8;

  useEffect(() => {
    // Fetch data when the component mounts
    // Use axiosInstance.get and provide only the endpoint path
    axiosInstance.get('vehicles/') // Removed 'http://localhost:8000/'
      .then(response => {
        // Axios puts the response data directly in .data
        setAllVehicles(response.data);
      })
      .catch(error => {
        console.error('Error fetching vehicle data:', error);
        // Fallback to sample data if API fails, for development purposes
        // Your existing fallback data is fine here, it will be used if the API call fails
        setAllVehicles([
          { id: 'VHC001', vehicle_number: '098765isyfdapsoy', vehicle_name: 'Santha Kumar', vehicle_type: 'CAR', approval_status: 'APPROVED', insurance_expiry_date: '2026-06-15', service_date: '2025-06-12', Chassis_Number: 'CHAS001' },
          { id: 'VHC002', vehicle_number: '1122334455', vehicle_name: 'Honda City', vehicle_type: 'CAR', approval_status: 'PENDING', insurance_expiry_date: '2025-01-20', service_date: '2024-10-01', Chassis_Number: 'CHAS002' },
          { id: 'VHC003', vehicle_number: '6677889900', vehicle_name: 'TVS Apache', vehicle_type: 'BIKE', approval_status: 'APPROVED', insurance_expiry_date: '2026-11-05', service_date: '2025-08-01', Chassis_Number: 'CHAS003' },
          { id: 'VHC004', vehicle_number: '0011223344', vehicle_name: 'Tata Truck', vehicle_type: 'TRUCK', approval_status: 'PENDING', insurance_expiry_date: '2024-09-10', service_date: '2024-07-01', Chassis_Number: 'CHAS004' },
          { id: 'VHC005', vehicle_number: '5544332211', vehicle_name: 'Maruti Alto', vehicle_type: 'CAR', approval_status: 'APPROVED', insurance_expiry_date: '2027-03-25', service_date: '2026-01-15', Chassis_Number: 'CHAS005' },
          { id: 'VHC006', vehicle_number: '9876543210', vehicle_name: 'Yamaha FZ', vehicle_type: 'BIKE', approval_status: 'PENDING', insurance_expiry_date: '2025-04-30', service_date: '2024-02-28', Chassis_Number: 'CHAS006' },
          { id: 'VHC007', vehicle_number: '2345678901', vehicle_name: 'Force Traveller', vehicle_type: 'VAN', approval_status: 'APPROVED', insurance_expiry_date: '2026-09-10', service_date: '2025-07-05', Chassis_Number: 'CHAS007' },
          { id: 'VHC008', vehicle_number: '8765432109', vehicle_name: 'Eicher Truck', vehicle_type: 'TRUCK', approval_status: 'APPROVED', insurance_expiry_date: '2027-01-01', service_date: '2025-11-20', Chassis_Number: 'CHAS008' },
          { id: 'VHC009', vehicle_number: '1357924680', vehicle_name: 'Bajaj Pulsar', vehicle_type: 'BIKE', approval_status: 'PENDING', insurance_expiry_date: '2025-12-15', service_date: '2024-10-30', Chassis_Number: 'CHAS009' },
          { id: 'VHC010', vehicle_number: '2468013579', vehicle_name: 'Hyundai Accent', vehicle_type: 'CAR', approval_status: 'APPROVED', insurance_expiry_date: '2026-07-20', service_date: '2025-05-10', Chassis_Number: 'CHAS010' },
        ]);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [id]: value,
    }));
    // Reset current page when filters change, depending on active tab
    if (activeTab === 'All Vehicles') {
      setCurrentPageAll(1);
    } else {
      setCurrentPagePending(1);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      vehicleType: '',
      registrationStatus: '',
      vehicleNumber: '',
      chassisNumber: '',
      insuranceStatus: '',
    });
    // Reset current page when filters change, depending on active tab
    if (activeTab === 'All Vehicles') {
      setCurrentPageAll(1);
    } else {
      setCurrentPagePending(1);
    }
  };

  const applyFilters = (vehicles) => {
    let filtered = vehicles;

    // Filter by active tab (All Vehicles vs. Pending Approval)
    if (activeTab === 'Pending Approval') {
      filtered = filtered.filter(vehicle => vehicle.approval_status === 'PENDING');
    }

    // Apply other filters
    return filtered.filter(vehicle => {
      const vehicleTypeMatch = !filters.vehicleType || vehicle.vehicle_type === filters.vehicleType;
      const registrationStatusMatch = !filters.registrationStatus || vehicle.approval_status === filters.registrationStatus;
      const vehicleNumberMatch = !filters.vehicleNumber || vehicle.vehicle_number.toLowerCase().includes(filters.vehicleNumber.toLowerCase());
      const chassisNumberMatch = !filters.chassisNumber || (vehicle.Chassis_Number && vehicle.Chassis_Number.toLowerCase().includes(filters.chassisNumber.toLowerCase()));

      const insuranceExpiryDate = new Date(vehicle.insurance_expiry_date);
      const today = new Date();
      const insuranceStatusMatch = !filters.insuranceStatus ||
                                   (filters.insuranceStatus === 'Valid' && insuranceExpiryDate >= today) ||
                                   (filters.insuranceStatus === 'Expired' && insuranceExpiryDate < today);

      return vehicleTypeMatch && registrationStatusMatch && vehicleNumberMatch && chassisNumberMatch && insuranceStatusMatch;
    });
  };

  const filteredVehicles = applyFilters(allVehicles);
  const currentPage = activeTab === 'All Vehicles' ? currentPageAll : currentPagePending;
  const currentTotalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const vehiclesToDisplay = filteredVehicles.slice(startIndex, endIndex);

  const handleApproveReject = (vehicleId, status) => {
    // In a real application, you would make an API call to update the status on the backend.
    // For this example, we'll just update the local state.
    // If you were to use axiosInstance for this, it would look like:
    /*
    axiosInstance.patch(`vehicles/${vehicleId}/`, { approval_status: status })
        .then(response => {
            setAllVehicles(prevVehicles =>
                prevVehicles.map(vehicle =>
                    vehicle.id === vehicleId
                        ? { ...vehicle, approval_status: response.data.approval_status }
                        : vehicle
                )
            );
            alert(`Vehicle ${vehicleId} has been ${status}.`);
            if (activeTab === 'Pending Approval') {
                setCurrentPagePending(1);
            } else {
                setCurrentPageAll(1);
            }
        })
        .catch(error => {
            console.error(`Failed to update vehicle ${vehicleId}:`, error);
            alert(`Failed to update vehicle ${vehicleId}.`);
        });
    */
    setAllVehicles(prevVehicles =>
      prevVehicles.map(vehicle =>
        vehicle.id === vehicleId
          ? { ...vehicle, approval_status: status }
          : vehicle
      )
    );
    alert(`Vehicle ${vehicleId} has been ${status}.`);
    // After approval/rejection, you might want to move to the first page of the current tab
    if (activeTab === 'Pending Approval') {
      setCurrentPagePending(1);
    } else {
      setCurrentPageAll(1);
    }
  };

  return (
    <div className="min-h-screen font-inter p-8 bg-black text-[#C6C8CF]"> {/* Main container, black background, light text */}
      {/* Top Bar for Language and User Icon */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 bg-[#3F4045] hover:bg-[#060B21] text-[#C6C8CF] rounded-full text-sm transition-colors">
            English <ChevronDown size={16} className="ml-1" />
          </button>
          <CircleUserRound size={24} className="text-[#C6C8CF]" />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm mb-6 text-[#C6C8CF]">Organization / Vehicle Registration Management</div>

      {/* Page Title & Add Vehicle Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-3xl font-semibold">Vehicle Registration Management</h1>
        <div className="flex space-x-4">
          <Link to="/vehicle-registration">
            <button className="bg-[#0430DE] hover:bg-[#2750F5] text-white px-6 py-2 rounded-full font-medium transition-colors">
              Add Vehicle
            </button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-[#3F4045]"> {/* Border matches other elements */}
        <button
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'All Vehicles'
              ? 'bg-[#060B21] text-white' // Active tab background and text
              : 'hover:bg-[#3F4045] text-[#C6C8CF] hover:text-white' // Inactive tab hover
          }`}
          onClick={() => { setActiveTab('All Vehicles'); setCurrentPageAll(1); }}
        >
          All Vehicles ( {allVehicles.length} )
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'Pending Approval'
              ? 'bg-[#060B21] text-white' // Active tab background and text
              : 'hover:bg-[#3F4045] text-[#C6C8CF] hover:text-white' // Inactive tab hover
          }`}
          onClick={() => { setActiveTab('Pending Approval'); setCurrentPagePending(1); }}
        >
          Pending Approval ( {allVehicles.filter(v => v.approval_status === 'PENDING').length} )
        </button>
      </div>

      {/* Filter Section */}
      <div className="p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end bg-[#060B21]"> {/* Filter section background */}
        <div>
          <label htmlFor="vehicleType" className="block text-sm mb-2 text-[#C6C8CF]">Vehicle Type</label>
          <select
            id="vehicleType"
            value={filters.vehicleType}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#3F4045] border-[#52616B] text-[#C6C8CF]"
          >
            <option value="">Select Vehicle Type</option>
            <option value="CAR">Car</option>
            <option value="BIKE">BIKE</option>
            <option value="VAN">Van</option>
            <option value="TRUCK">Truck</option>
          </select>
        </div>
        <div>
          <label htmlFor="registrationStatus" className="block text-sm mb-2 text-[#C6C8CF]">Registration Status</label>
          <select
            id="registrationStatus"
            value={filters.registrationStatus}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#3F4045] border-[#52616B] text-[#C6C8CF]"
          >
            <option value="">Select Status</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
        <div>
          <label htmlFor="vehicleNumber" className="block text-sm mb-2 text-[#C6C8CF]">Vehicle Number</label>
          <input
            type="text"
            id="vehicleNumber"
            placeholder="Enter Vehicle Number"
            value={filters.vehicleNumber}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#3F4045] border-[#52616B] text-[#C6C8CF]"
          />
        </div>
        <div>
          <label htmlFor="chassisNumber" className="block text-sm mb-2 text-[#C6C8CF]">Chassis Number</label>
          <input
            type="text"
            id="chassisNumber"
            placeholder="Enter Chassis Number"
            value={filters.chassisNumber}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#3F4045] border-[#52616B] text-[#C6C8CF]"
          />
        </div>
        <div>
          <label htmlFor="insuranceStatus" className="block text-sm mb-2 text-[#C6C8CF]">Insurance Status</label>
          <select
            id="insuranceStatus"
            value={filters.insuranceStatus}
            onChange={handleFilterChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0430DE] bg-[#3F4045] border-[#52616B] text-[#C6C8CF]"
          >
            <option value="">Select Status</option>
            <option value="Valid">Valid</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
        <div className="flex space-x-2 col-span-full justify-end">
          <button className="bg-[#3F4045] hover:bg-[#52616B] text-white px-4 py-2 rounded-md font-medium transition-colors">
            Sorting
          </button>
          <button
            onClick={handleResetFilters}
            className="bg-[#9F2626] hover:bg-[#7F1F1F] text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Vehicle List Table */}
      <div className="overflow-x-auto mb-4 bg-[#060B21] rounded-lg"> {/* Table background */}
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#3F4045] text-white uppercase text-sm leading-normal"> {/* Header background and text */}
              <th className="py-3 px-6 text-left rounded-tl-lg">#</th>
              <th className="py-3 px-6 text-left">Vehicle Number</th>
              <th className="py-3 px-6 text-left">Vehicle Name</th>
              <th className="py-3 px-6 text-left">Vehicle Type</th>
              <th className="py-3 px-6 text-left">Registration Status</th>
              <th className="py-3 px-6 text-left">Insurance Expiry</th>
              <th className="py-3 px-6 text-left">Service Date</th>
              <th className="py-3 px-6 text-left">Chassis Number</th>
              <th className="py-3 px-6 text-center rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody className="text-[#C6C8CF] text-sm font-light"> {/* Table body text */}
            {vehiclesToDisplay.map((vehicle, index) => (
              <tr key={vehicle.id || index} className="border-b border-[#3F4045] hover:bg-[#060B21]"> {/* Border and hover effect */}
                <td className="py-3 px-6 text-left whitespace-nowrap">{startIndex + index + 1}</td>
                <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicle_number}</td>
                <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicle_name}</td>
                <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.vehicle_type}</td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <span className={`py-1 px-3 rounded-full text-xs font-medium ${
                    vehicle.approval_status === 'APPROVED' ? 'bg-[#0430DE] text-white' :
                    vehicle.approval_status === 'PENDING' ? 'bg-[#2750F5] text-white' :
                    'bg-[#9F2626] text-white'
                  }`}>
                    {vehicle.approval_status}
                  </span>
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.insurance_expiry_date || '—'}</td>
                <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.service_date || '—'}</td>
                <td className="py-3 px-6 text-left whitespace-nowrap">{vehicle.Chassis_Number || '—'}</td>
                <td className="py-3 px-6 text-center whitespace-nowrap">
                  {activeTab === 'Pending Approval' && vehicle.approval_status === 'PENDING' ? (
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleApproveReject(vehicle.id, 'APPROVED')}
                        className="bg-[#0430DE] hover:bg-[#2750F5] text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveReject(vehicle.id, 'REJECTED')}
                        className="bg-[#9F2626] hover:bg-[#7F1F1F] text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <Link to={`/vehicles/${vehicle.id}`}>
                      <button className="bg-[#0430DE] hover:bg-[#2750F5] text-white px-4 py-2 rounded-full text-xs font-medium transition-colors">
                        View
                      </button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {vehiclesToDisplay.length === 0 && (
              <tr className="border-b border-[#3F4045]">
                <td className="py-3 px-6 text-center" colSpan="9">
                  <div className="text-lg font-semibold mt-8 mb-2 text-[#C6C8CF]">No Vehicles Found</div>
                  <div className="text-sm mb-8 text-[#52616B]">
                    Adjust your filters or add new vehicles.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-auto space-x-2 text-sm text-[#C6C8CF]">
          <button
            onClick={() => {
              if (activeTab === 'All Vehicles') setCurrentPageAll(prev => Math.max(1, prev - 1));
              else setCurrentPagePending(prev => Math.max(1, prev - 1));
            }}
            disabled={currentPage === 1}
            className={`p-2 rounded-full transition-colors hover:bg-[#3F4045] ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
              <ChevronLeft size={16} />
          </button>
          {[...Array(currentTotalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => {
                if (activeTab === 'All Vehicles') setCurrentPageAll(index + 1);
                else setCurrentPagePending(index + 1);
              }}
              className={`px-3 py-1 rounded-full ${
                currentPage === index + 1
                  ? 'bg-[#0430DE] text-white'
                  : 'hover:bg-[#3F4045]'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => {
              if (activeTab === 'All Vehicles') setCurrentPageAll(prev => Math.min(currentTotalPages, prev + 1));
              else setCurrentPagePending(prev => Math.min(currentTotalPages, prev + 1));
            }}
            disabled={currentPage === currentTotalPages}
            className={`p-2 rounded-full transition-colors hover:bg-[#3F4045] ${currentPage === currentTotalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
              <ChevronRight size={16} />
          </button>
      </div>
    </div>
  );
}

export default PendingApprovalTabContent;