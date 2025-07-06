import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {
  ChevronLeft, Edit, Trash2, Car, Calendar, FileText,
  Building, CreditCard, AlertTriangle, CheckCircle,
  XCircle, Clock, ArrowLeft, Eye, Download, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

// Enhanced Vehicle Profile Component
function VehicleProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchVehicleData();
  }, [id]);

  const fetchVehicleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/vehicles/${id}/`);
      setVehicle(response.data);
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('Failed to load vehicle data');
      toast.error('Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/vehicles/${id}/`);
      toast.success('Vehicle deleted successfully!');
      navigate('/vehicle-list');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete vehicle');
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      APPROVED: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
      REJECTED: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || { icon: AlertTriangle, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">{error || 'Vehicle not found'}</p>
          <button
            onClick={() => navigate('/vehicle-list')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Back to Vehicle List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Light Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/vehicle-list')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Vehicle List
            </button>
            <div className="text-gray-500">Vehicle Management / Vehicle Profile</div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/vehicle-registration/${vehicle.id}`)}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Vehicle
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Vehicle Header Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center">
                    <Car className="h-8 w-8 mr-3" />
                    {vehicle.vehicle_name}
                  </h1>
                  <p className="text-blue-100 mt-2 text-lg">{vehicle.vehicle_number}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(vehicle.approval_status)}
                  <p className="text-blue-100 mt-2 text-sm">Vehicle Type: {vehicle.vehicle_type}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vehicle Image */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Vehicle Image
                  </h3>
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {vehicle.image ? (
                      <img
                        src={vehicle.image}
                        alt={vehicle.vehicle_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Car className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Car className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Vehicle Name" value={vehicle.vehicle_name} />
                  <DetailField label="Vehicle Number" value={vehicle.vehicle_number} />
                  <DetailField label="Vehicle Type" value={vehicle.vehicle_type} />
                  <DetailField label="Chassis Number" value={vehicle.Chassis_Number || 'N/A'} />
                  <DetailField label="RC Book Number" value={vehicle.rc_book_number || 'N/A'} />
                  <DetailField label="Is Leased" value={vehicle.is_leased ? 'Yes' : 'No'} />
                </div>
              </div>

              {/* Insurance Information */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                  Insurance Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Insurance Number" value={vehicle.insurance_number || 'N/A'} />
                  <DetailField label="Insurance Expiry" value={formatDate(vehicle.insurance_expiry_date)} />
                  <DetailField label="Service Date" value={formatDate(vehicle.service_date)} />
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicle.insurance_document && (
                    <DocumentLink
                      label="Insurance Document"
                      url={vehicle.insurance_document}
                      icon={FileText}
                    />
                  )}
                  {vehicle.rc_document && (
                    <DocumentLink
                      label="RC Book Document"
                      url={vehicle.rc_document}
                      icon={FileText}
                    />
                  )}
                  {!vehicle.insurance_document && !vehicle.rc_document && (
                    <p className="text-gray-500 col-span-2">No documents available</p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-orange-600" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Created At" value={formatDate(vehicle.created_at)} />
                  <DetailField label="Last Updated" value={formatDate(vehicle.updated_at)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Delete Vehicle</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{vehicle.vehicle_name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Detail Field Component
function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-lg text-gray-800 font-medium">{value || 'N/A'}</p>
    </div>
  );
}

// Enhanced Document Link Component
function DocumentLink({ label, url, icon: Icon }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="h-5 w-5 text-blue-600 mr-3" />
          <span className="text-gray-800 font-medium">{label}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </a>
      </div>
    </div>
  );
}

export default VehicleProfile;