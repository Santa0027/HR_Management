import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function DriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch driver data when the component mounts
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const response = await axiosInstance.get(`/Register/drivers/${id}/`);
        setDriver(response.data);
      } catch (err) {
        console.error('Error fetching driver:', err);
        setError('Failed to fetch driver data.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDriver();
  }, [id]);

  // Handle approve or reject action
  const handleAction = async (status) => {
    const confirmed = window.confirm(`Are you sure you want to ${status} this driver?`);
    if (!confirmed) return;

    try {
      await axiosInstance.patch(`/Register/drivers/${id}/`, {
        status: status.toLowerCase(), // ensure backend expects "approved"/"rejected"
      });

      navigate('/registration-management');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-white text-[#187795]  p-8">
      <h1 className="text-3xl font-semibold mb-6">Driver Profile</h1>

      <div className="bg-[#C9D6DF]  p-6 rounded-md mb-6 space-y-2">
        <p><strong>Name:</strong> {driver.driver_name}</p>
        <p><strong>Driver ID:</strong> {driver.id}</p>
        <p><strong>City:</strong> {driver.city}</p>
        <p><strong>Vehicle Type:</strong> {driver.vehicleType || 'N/A'}</p>
        <p><strong>Status:</strong> {driver.status}</p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => handleAction('approved')}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white"
        >
          Approve
        </button>
        <button
          onClick={() => handleAction('rejected')}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default DriverProfile;

