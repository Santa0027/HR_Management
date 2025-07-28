import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Car, 
  Building2, 
  Edit, 
  ArrowLeft,
  FileText,
  Heart,
  Shirt,
  Weight,
  Ruler,
  Users,
  AlertTriangle
} from 'lucide-react';

const NewDriverApplicationDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/new-driver-applications/${applicationId}/`);
      if (response.data.success) {
        setApplication(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch application');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      setError('Failed to load application details. Please try again.');
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
      under_review: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Under Review' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested application could not be found.'}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => navigate('/new-driver-applications')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Applications
            </button>
            <button
              onClick={fetchApplication}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/new-driver-applications')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Driver Application Details</h1>
                <p className="text-gray-600 mt-1">Application #{application.application_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(application.status)}
              <button
                onClick={() => navigate(`/new-driver-applications/${applicationId}/edit`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Application
              </button>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 font-semibold">{application.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <p className="text-gray-900">{application.gender?.charAt(0).toUpperCase() + application.gender?.slice(1) || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <p className="text-gray-900">{formatDate(application.date_of_birth)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <p className="text-gray-900">{application.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <p className="text-gray-900">{application.nationality}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <p className="text-gray-900">{application.city}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Phone className="h-6 w-6 mr-3 text-green-600" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900">{application.phone_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Country Phone</label>
                  <p className="text-gray-900">{application.home_country_phone || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Area</label>
                  <p className="text-gray-900">{application.apartment_area}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Country Address</label>
                  <p className="text-gray-900">{application.home_country_address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Physical Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Heart className="h-6 w-6 mr-3 text-red-600" />
                Physical Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  <p className="text-gray-900">{application.marital_status?.charAt(0).toUpperCase() + application.marital_status?.slice(1) || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <p className="text-gray-900">{application.blood_group}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">T-Shirt Size</label>
                  <p className="text-gray-900">{application.t_shirt_size}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <p className="text-gray-900">{application.weight ? `${application.weight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <p className="text-gray-900">{application.height ? `${application.height} cm` : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Nominee Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Users className="h-6 w-6 mr-3 text-purple-600" />
                Nominee Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name</label>
                  <p className="text-gray-900">{application.nominee_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <p className="text-gray-900">{application.nominee_relationship?.charAt(0).toUpperCase() + application.nominee_relationship?.slice(1) || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Phone</label>
                  <p className="text-gray-900">{application.nominee_phone}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Address</label>
                  <p className="text-gray-900">{application.nominee_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Work Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Building2 className="h-6 w-6 mr-3 text-blue-600" />
                Work Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <p className="text-gray-900 font-semibold">{application.company_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <p className="text-gray-900">{application.vehicle_type?.charAt(0).toUpperCase() + application.vehicle_type?.slice(1)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Destination</label>
                  <p className="text-gray-900">{application.vehicle_destination || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kuwait Entry Date</label>
                  <p className="text-gray-900">{formatDate(application.kuwait_entry_date)}</p>
                </div>
              </div>
            </div>

            {/* Application Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-orange-600" />
                Application Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                  <p className="text-gray-900">{formatDate(application.application_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-gray-900">{formatDate(application.updated_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <p className="text-gray-900">{application.employee_id || 'Not Assigned'}</p>
                </div>
              </div>
            </div>

            {/* Accessories Requested */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Shirt className="h-6 w-6 mr-3 text-green-600" />
                Accessories Requested
              </h2>
              <div className="space-y-3">
                {[
                  { key: 't_shirt_quantity', label: 'T-Shirts' },
                  { key: 'cap_quantity', label: 'Caps' },
                  { key: 'jackets_quantity', label: 'Jackets' },
                  { key: 'bag_quantity', label: 'Bags' },
                  { key: 'wristbands_quantity', label: 'Wristbands' },
                  { key: 'water_bottle_quantity', label: 'Water Bottles' },
                  { key: 'safety_gear_quantity', label: 'Safety Gear' },
                  { key: 'helmet_quantity', label: 'Helmets' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {application[key] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDriverApplicationDetail;
