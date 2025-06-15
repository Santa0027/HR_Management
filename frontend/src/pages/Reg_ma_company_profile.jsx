import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, CircleUserRound } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { Link } from "react-router-dom";

function CompanyProfile() {
  const { id } = useParams(); // Get company ID from URL
  const [companyData, setCompanyData] = useState(null);
  const [companyDrivers, setCompanyDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch company and drivers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyRes = await axiosInstance.get(`/company/${id}/`);
        const driversRes = await axiosInstance.get(`/by-company/${id}/`);

        setCompanyData(companyRes.data);
        setCompanyDrivers(driversRes.data);
      } catch (error) {
        console.error('Failed to fetch company or drivers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleViewDriverClick = (driverId) => {
    alert(`Viewing driver details for: ${driverId}`);
  };

  const handleEditCompany = () => {
    alert(`Edit company: ${companyData.id}`);
    // TODO: Replace with actual edit logic
  };

  const handleDeleteCompany = () => {
    const confirmed = window.confirm('Are you sure you want to delete this company?');
    if (confirmed) {
      alert(`Delete company: ${companyData.id}`);
      // TODO: Replace with actual delete logic
    }
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!companyData) return <div className="text-red-500 p-8">Company not found.</div>;

  return (
    <div className="min-h-screen font-inter p-8 bg-black text-gray-200">
      <div className="flex flex-col">
        {/* Topbar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-green-400" />
          </div>
        </div>

        <div className="text-sm mb-6 text-gray-400">
          Organization / Platform Registration List / Company Profile
        </div>

        {/* Heading and Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-3xl font-semibold">Company Profile</h1>
          <div className="flex gap-2">
            <Link to={`/company/${companyData.id}/edit`} >
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm"
              
            >
              Edit
            </button>
            </Link>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm"
              onClick={handleDeleteCompany}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8 flex items-center">
          <img
            src={companyData.logo || 'https://placehold.co/80x80/535c9b/ffffff?text=Logo'}
            alt="Company Logo"
            className="w-20 h-20 rounded-full object-cover mr-6"
            onError={(e) => {
              e.target.src = 'https://placehold.co/80x80/535c9b/ffffff?text=Logo';
            }}
          />
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">{companyData.company_name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400">
              <div>
                <span className="font-semibold text-gray-300">GST Number:</span>{' '}
                {companyData.gst_number}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Commission:</span>{' '}
                {companyData.commission_percentage}%
              </div>
              <div>
                <span className="font-semibold text-gray-300">Total Drivers:</span>{' '}
                {companyDrivers.length}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Address:</span>{' '}
                {companyData.address}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Contact Person:</span>{' '}
                {companyData.contact_person}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Email:</span>{' '}
                {companyData.contact_email}
              </div>
              <div>
                <span className="font-semibold text-gray-300">Phone:</span>{' '}
                {companyData.contact_phone}
              </div>
            </div>
          </div>
        </div>

        {/* Drivers List */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          Drivers Allotted ({companyDrivers.length})
        </h2>
        <div className="overflow-x-auto mb-4 bg-gray-900 rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-800 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Driver ID</th>
                <th className="py-3 px-6 text-left">Driver Name</th>
                <th className="py-3 px-6 text-left">Mobile Number</th>
                <th className="py-3 px-6 text-left">Vehicle Name</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 text-sm font-light">
              {companyDrivers.length > 0 ? (
                companyDrivers.map((driver, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-gray-700"
                  >
                    <td className="py-3 px-6">{driver.driver_id}</td>
                    <td className="py-3 px-6">{driver.name}</td>
                    <td className="py-3 px-6">{driver.phone}</td>
                    <td className="py-3 px-6">{driver.vehicle_name}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`py-1 px-3 rounded-full text-xs font-medium ${
                          driver.status === 'Active'
                            ? 'bg-green-700 text-green-100'
                            : driver.status === 'Inactive'
                            ? 'bg-red-700 text-red-100'
                            : 'bg-yellow-700 text-yellow-100'
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handleViewDriverClick(driver.driver_id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">
                    No drivers allotted to this company.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;
