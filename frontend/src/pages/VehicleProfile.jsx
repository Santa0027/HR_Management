import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';

function VehicleProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8000/vehicles/${id}/`)
      .then(res => {
        setVehicle(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching vehicle:', err);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this vehicle?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/vehicles/${id}/`);
      alert('Vehicle deleted successfully!');
      navigate('/vehicle-list');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete vehicle.');
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (!vehicle) return <div className="text-red-500 text-center mt-10">Vehicle not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/vehicle-list" className="text-green-400 hover:text-green-300 flex items-center">
          <ChevronLeft className="mr-2" size={18} /> Back to List
        </Link>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/vehicles/${vehicle.id}/edit`}
            className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md"
          >
            <Edit className="mr-2" size={16} /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
          >
            <Trash2 className="mr-2" size={16} /> Delete
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Vehicle Profile</h1>

      {/* Image */}
      {vehicle.image && (
        <div className="mb-6">
          <img
            src={vehicle.image}
            alt="Vehicle"
            className="w-full max-w-md rounded-lg border border-gray-700"
          />
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900 p-6 rounded-xl shadow-lg">
        <Detail label="Vehicle Name" value={vehicle.vehicle_name} />
        <Detail label="Vehicle Number" value={vehicle.vehicle_number} />
        <Detail label="Vehicle Type" value={vehicle.vehicle_type} />
        <Detail label="Approval Status" value={vehicle.approval_status} />
        <Detail label="Insurance Number" value={vehicle.insurance_number || '—'} />
        <Detail label="Insurance Expiry" value={formatDate(vehicle.insurance_expiry_date)} />
        <Detail label="Chassis Number" value={vehicle.Chassis_Number || '—'} />
        <Detail label="Service Date" value={formatDate(vehicle.service_date)} />
        <Detail label="RC Book Number" value={vehicle.rc_book_number || '—'} />
        <Detail label="Is Leased" value={vehicle.is_leased ? 'Yes' : 'No'} />
        <Detail label="Created At" value={formatDate(vehicle.created_at)} />
      </div>

      {/* Document Downloads */}
      <div className="mt-8 space-y-4">
        {vehicle.insurance_document && (
          <DownloadLink label="Insurance Document" url={vehicle.insurance_document} />
        )}
        {vehicle.rc_document && (
          <DownloadLink label="RC Book Document" url={vehicle.rc_document} />
        )}
      </div>
    </div>
  );
}

// Detail Component
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-lg font-medium text-white">{value}</p>
    </div>
  );
}

// Download Link Component
function DownloadLink({ label, url }) {
  return (
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
      >
        Download
      </a>
    </div>
  );
}

// Date Formatter
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default VehicleProfile;
