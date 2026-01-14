import React, { useState, useEffect } from 'react';
import { ChevronDown, CircleUserRound, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function PendingApprovalTabContent() {
  const [activeTab, setActiveTab] = useState('All Vehicles');
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const [currentPagePending, setCurrentPagePending] = useState(1);
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
    axiosInstance.get('/vehicles/')
      .then(res => setAllVehicles(res.data))
      .catch(err => {
        console.error('Error fetching vehicles', err);
        setAllVehicles([]);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
    activeTab === 'All Vehicles' ? setCurrentPageAll(1) : setCurrentPagePending(1);
  };

  const handleResetFilters = () => {
    setFilters({
      vehicleType: '',
      registrationStatus: '',
      vehicleNumber: '',
      chassisNumber: '',
      insuranceStatus: '',
    });
    activeTab === 'All Vehicles' ? setCurrentPageAll(1) : setCurrentPagePending(1);
  };

  const applyFilters = (vehicles) => {
    let filtered = vehicles;
    if (activeTab === 'Pending Approval') {
      filtered = filtered.filter(v => v.approval_status === 'PENDING');
    }

    return filtered.filter(v => {
      const insuranceDate = new Date(v.insurance_expiry_date);
      const today = new Date();

      return (
        (!filters.vehicleType || v.vehicle_type === filters.vehicleType) &&
        (!filters.registrationStatus || v.approval_status === filters.registrationStatus) &&
        (!filters.vehicleNumber || v.vehicle_number.toLowerCase().includes(filters.vehicleNumber.toLowerCase())) &&
        (!filters.chassisNumber || (v.Chassis_Number ?? '').toLowerCase().includes(filters.chassisNumber.toLowerCase())) &&
        (!filters.insuranceStatus ||
          (filters.insuranceStatus === 'Valid' && insuranceDate >= today) ||
          (filters.insuranceStatus === 'Expired' && insuranceDate < today))
      );
    });
  };

  const filteredVehicles = applyFilters(allVehicles);
  const currentPage = activeTab === 'All Vehicles' ? currentPageAll : currentPagePending;
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const pagedVehicles = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleApproveReject = (id, status) => {
    axiosInstance.patch(`/vehicles/${id}/`, { approval_status: status })
      .then(() => {
        setAllVehicles(prev => prev.map(v => v.id === id ? { ...v, approval_status: status } : v));
        alert(`Vehicle ${id} set to ${status}`);
      })
      .catch(err => {
        console.error(err);
        alert('Action failed');
      });
  };

  return (
    <>
      <div className="min-h-screen font-inter p-8 bg-white text-[#1E2022]">
         {/* Header */}
                <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
                  <div className="text-sm text-[#52616B]">Organization / Vehicle Registration Management</div>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm  transition-colors">
                      English <ChevronDown size={16} className="ml-1" />
                    </button>
                    <CircleUserRound size={24} className="text-[#1E2022]" />
                  </div>
                </header>

        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[#187795] text-3xl font-semibold">Vehicle Registration Management</h1>
          <Link to="/vehicle-registration">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium">
              Add Vehicle
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-[#3F4045]">
          {['All Vehicles', 'Pending Approval'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                tab === 'All Vehicles' ? setCurrentPageAll(1) : setCurrentPagePending(1);
              }}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === tab ? 'bg-[#060B21] text-white' : 'hover:bg-[#3F4045] text-[#636363]'}`}
            >
              {tab} ({tab === 'All Vehicles' ? allVehicles.length : allVehicles.filter(v => v.approval_status === 'PENDING').length})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-6 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-[#C9D6DF]]">
          <input id="vehicleType" value={filters.vehicleType} onChange={handleFilterChange} className="bg-[#D9D9D9] p-2 rounded text-sm" placeholder="Vehicle Type" />
          <input id="registrationStatus" value={filters.registrationStatus} onChange={handleFilterChange} className="bg-[#D9D9D9] p-2 rounded text-sm" placeholder="Registration Status" />
          <input id="vehicleNumber" value={filters.vehicleNumber} onChange={handleFilterChange} className="bg-[#D9D9D9] p-2 rounded text-sm" placeholder="Vehicle Number" />
          <input id="chassisNumber" value={filters.chassisNumber} onChange={handleFilterChange} className="bg-[#D9D9D9] p-2 rounded text-sm" placeholder="Chassis Number" />
          <select id="insuranceStatus" value={filters.insuranceStatus} onChange={handleFilterChange} className="bg-[#D9D9D9] p-2 rounded text-sm">
            <option value="">Insurance Status</option>
            <option value="Valid">Valid</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="flex space-x-2 mb-4">
          <button onClick={handleResetFilters} className="bg-[#9F2626] hover:bg-[#7F1F1F] text-white px-4 py-2 rounded-md">
            Reset All
          </button>
        </div>

        {/* Vehicle Table */}
        <div className="overflow-x-auto mb-4 bg-[#060B21] rounded-lg">
          <table className="min-w-full">
            <thead className="bg-[#284B63] text-white uppercase text-sm">
              <tr>
                <th className="py-3 px-6 text-left">#</th>
                <th className="py-3 px-6 text-left">Vehicle Number</th>
                <th className="py-3 px-6 text-left">Vehicle Type</th>
                <th className="py-3 px-6 text-left">Chassis Number</th>
                <th className="py-3 px-6 text-left">Approval Status</th>
                <th className="py-3 px-6 text-left">Insurance Expiry</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#353535] font-bold ">
              {pagedVehicles.map((v, i) => (
                <tr key={v.id} className="border-b  bg-[#C9D6DF] border-[#3F4045] hover:bg-white">
                  <td className="py-3 px-6">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td className="py-3 px-6">{v.vehicle_number}</td>
                  <td className="py-3 px-6">{v.vehicle_type}</td>
                  <td className="py-3 px-6">{v.Chassis_Number}</td>
                  <td className="py-3 px-6">{v.approval_status}</td>
                  <td className="py-3 px-6">{v.insurance_expiry_date}</td>
                  <td className="py-3 px-6 text-center">
                    {activeTab === 'Pending Approval' && v.approval_status === 'PENDING' ? (
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleApproveReject(v.id, 'APPROVED')} className="bg-[#0430DE] hover:bg-[#2750F5] text-white px-3 py-1 rounded-full text-xs">
                          Approve
                        </button>
                        <button onClick={() => handleApproveReject(v.id, 'REJECTED')} className="bg-[#9F2626] hover:bg-[#7F1F1F] text-white px-3 py-1 rounded-full text-xs">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <Link to={`/vehicles/${v.id}`}>
                        <button className="bg-[#0430DE] hover:bg-[#2750F5] text-white px-4 py-2 rounded-full text-xs">
                          View
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {pagedVehicles.length === 0 && (
                <tr><td colSpan="7" className="text-center py-4">No Vehicles Found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center space-x-2 text-sm">
          <button onClick={() => activeTab === 'All Vehicles' ? setCurrentPageAll(p => Math.max(1, p - 1)) : setCurrentPagePending(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
          {[...Array(totalPages)].map((_, idx) => (
            <button key={idx} onClick={() => activeTab === 'All Vehicles' ? setCurrentPageAll(idx + 1) : setCurrentPagePending(idx + 1)} className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-[#0430DE] text-white' : ''}`}>
              {idx + 1}
            </button>
          ))}
          <button onClick={() => activeTab === 'All Vehicles' ? setCurrentPageAll(p => Math.min(totalPages, p + 1)) : setCurrentPagePending(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
        </div>
      </div>

      {/* Nested Routes */}
      <Outlet />
    </>
  );
}

export default PendingApprovalTabContent;
