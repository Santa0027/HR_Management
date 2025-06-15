import React, { useState, useEffect } from 'react';
import { ChevronDown, CircleUserRound } from 'lucide-react';
import { Link } from "react-router-dom";
import axiosInstance from '../api/axiosInstance';

function Reg_ma_platform_list() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    company_name: '',
    gst_number: '',
  });
  const [loading, setLoading] = useState(true);

  const [allRegistrations, setAllRegistrations] = useState([]);
  const itemsPerPage = 8;

  useEffect(() => {
    axiosInstance.get("company/")
      .then((response) => {
        setAllRegistrations(response.data);
        setLoading(false);
        console.log("Fetched registrations:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Filtering logic
  const filteredRegistrations = allRegistrations.filter(reg =>
    reg.company_name?.toLowerCase().includes(filters.company_name.toLowerCase()) &&
    reg.gst_number?.toLowerCase().includes(filters.gst_number.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
    setCurrentPage(1);
  };

  const handleViewClick = (companyName) => {
    alert(`Viewing details for: ${companyName}`);
  };

  return (
    <div className="min-h-screen font-inter p-8 bg-black text-gray-200">
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm">
            English <ChevronDown size={16} className="ml-1" />
          </button>
          <CircleUserRound size={24} className="text-green-400" />
        </div>
      </div>

      <div className="text-sm mb-6 text-gray-400">Organization / Platform Registration List</div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-3xl font-semibold">Platform Registration List</h1>
        <Link to="/company-registration">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium">
            Add Platform
          </button>
        </Link>
      </div>

      <div className="p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end bg-gray-900">
        <div>
          <label htmlFor="company_name" className="block text-sm mb-2 text-gray-400">Company Name</label>
          <input
            type="text"
            id="company_name"
            value={filters.company_name}
            onChange={handleFilterChange}
            placeholder="Enter Company Name"
            className="w-full border rounded-md py-2 px-3 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div>
          <label htmlFor="gst_number" className="block text-sm mb-2 text-gray-400">GST Number</label>
          <input
            type="text"
            id="gst_number"
            value={filters.gst_number}
            onChange={handleFilterChange}
            placeholder="Enter GST Number"
            className="w-full border rounded-md py-2 px-3 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="flex space-x-2 col-span-full justify-end">
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md">Sorting</button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md" onClick={() => setFilters({ company_name: '', gst_number: '' })}>Reset All</button>
        </div>
      </div>

      <div className="overflow-x-auto mb-4 bg-gray-900 rounded-lg">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-800 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Logo</th>
                <th className="py-3 px-6 text-left">Company Name</th>
                <th className="py-3 px-6 text-left">GST Number</th>
                <th className="py-3 px-6 text-left">Commission %</th>
                <th className="py-3 px-6 text-left">Drivers Allotted</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 text-sm font-light">
              {currentRegistrations.map((reg, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-700">
                  <td className="py-3 px-6">
                    <img src={reg.logo || 'https://placehold.co/40x40'} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="py-3 px-6">{reg.company_name}</td>
                  <td className="py-3 px-6">{reg.gst_number}</td>
                  <td className="py-3 px-6">{reg.commission_percentage || '-'}</td>
                  <td className="py-3 px-6">{reg.drivers_allotted || '-'}</td>
                  <td className="py-3 px-6 text-center">
                    <Link to={`/company-profile/${reg.id}`}>
                      <button
                      
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-xs"
                      >
                        View
                      </button>
                    </Link>

                  </td>
                </tr>
              ))}
              {currentRegistrations.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">No Platform Registrations Found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end space-x-2 text-sm text-gray-400 mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="px-4 py-1">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Reg_ma_platform_list;
