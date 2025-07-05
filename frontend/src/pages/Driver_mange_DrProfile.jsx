import React, { useEffect, useState } from 'react';
import {
  ChevronDown, CircleUserRound, FileText, Image,
  Edit, ArrowLeft, Phone, Mail, MapPin, Calendar, User,
  Building, Car, Download, Eye, CheckCircle, XCircle, Clock,
  AlertTriangle, Trash2
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

function Driver_mange_DrProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [driverData, setDriverData] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [loadingDriverData, setLoadingDriverData] = useState(true);
  const [loadingVehicleData, setLoadingVehicleData] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverProfilePicture, setDriverProfilePicture] = useState(
    'https://placehold.co/100x100/535c9b/ffffff?text=Avatar'
  );

  useEffect(() => {
    const fetchDriverAndVehicleData = async () => {
      setLoadingDriverData(true);
      setError(null);
      try {
        const driverResponse = await axiosInstance.get(`/Register/drivers/${id}/`);
        const driverData = driverResponse.data;
        setDriverData(driverData);



        // Set profile picture
        if (driverData.driver_profile_img || driverData.profile_picture_url) {
          setDriverProfilePicture(driverData.driver_profile_img || driverData.profile_picture_url);
        }

        // Handle vehicle data - the vehicle should be included in the driver data as a nested object
        if (driverData.vehicle && typeof driverData.vehicle === 'object') {
          // Vehicle is already included as a nested object in the driver data
          setAssignedVehicle(driverData.vehicle);
          setLoadingVehicleData(false);
        } else if (driverData.vehicle && typeof driverData.vehicle === 'number') {
          // Vehicle is referenced by ID, need to fetch it
          setLoadingVehicleData(true);
          try {
            const vehicleResponse = await axiosInstance.get(`/vehicles/${driverData.vehicle}/`);
            setAssignedVehicle(vehicleResponse.data);
          } catch (vehicleError) {
            console.error('Failed to fetch assigned vehicle data:', vehicleError);
            setAssignedVehicle(null);
          } finally {
            setLoadingVehicleData(false);
          }
        } else {
          // No vehicle assigned
          setAssignedVehicle(null);
          setLoadingVehicleData(false);
        }
      } catch (error) {
        console.error('Failed to fetch driver data:', error);
        setError('Failed to load driver information. Please try again.');
        setDriverData({});
        setAssignedVehicle(null);
        toast.error('Failed to load driver information');
      } finally {
        setLoadingDriverData(false);
      }
    };

    if (id) {
      fetchDriverAndVehicleData();
    }
  }, [id]);

  // Handle driver deletion
  const handleDeleteDriver = async () => {
    try {
      await axiosInstance.delete(`/Register/drivers/${id}/`);
      toast.success('Driver deleted successfully');
      navigate('/registration-management');
    } catch (error) {
      console.error('Failed to delete driver:', error);
      toast.error('Failed to delete driver');
    }
    setShowDeleteModal(false);
  };

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' }
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



  if (loadingDriverData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading driver profile...</p>
        </div>
      </div>
    );
  }

  if (error || !driverData || Object.keys(driverData).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">{error || 'Driver not found or data could not be loaded.'}</p>
          <button
            onClick={() => navigate('/registration-management')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Back to Driver List
          </button>
        </div>
      </div>
    );
  }



  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Light Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/registration-management')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Driver List
            </button>
            <div className="text-gray-500">Driver Management / Driver Profile</div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-blue-600" />
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Enhanced Light Profile Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          {/* Profile Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={driverProfilePicture}
                  alt="Driver Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/100x100/535c9b/ffffff?text=Avatar';
                  }}
                />
                <div className="absolute -bottom-2 -right-2">
                  {getStatusBadge(driverData.status)}
                </div>
              </div>

              {/* Driver Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{driverData.driver_name || 'N/A'}</h1>
                    <p className="text-blue-100 text-lg">Driver ID: #{driverData.id || 'N/A'}</p>
                  </div>
                  <div className="flex space-x-3 mt-4 lg:mt-0">
                    <Link to={`/profileedit/${id}`}>
                      <button className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center text-blue-600 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">National ID</span>
                </div>
                <p className="text-gray-800 font-semibold">{driverData.iqama || 'N/A'}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center text-green-600 mb-2">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Phone Number</span>
                </div>
                <p className="text-gray-800 font-semibold">{driverData.mobile || 'N/A'}</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center text-purple-600 mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-gray-800 font-semibold">{driverData.email || 'N/A'}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center text-orange-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">City</span>
                </div>
                <p className="text-gray-800 font-semibold">{driverData.city || 'N/A'}</p>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center text-indigo-600 mb-2">
                  <Building className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Company</span>
                </div>
                <p className="text-gray-800 font-semibold">{driverData.company?.company_name || 'N/A'}</p>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center text-pink-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Date of Birth</span>
                </div>
                <p className="text-gray-800 font-semibold">{driverData.dob ? formatDate(driverData.dob) : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Enhanced Light Tabs */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'vehicle', label: 'Vehicle', icon: Car },
              { id: 'logs', label: 'Activity Logs', icon: Clock }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-blue-600 mb-2 block">Full Name</label>
                  <p className="text-gray-800 font-semibold">{driverData.driver_name || 'N/A'}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-green-600 mb-2 block">National ID (Iqama)</label>
                  <p className="text-gray-800 font-semibold">{driverData.iqama || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-purple-600 mb-2 block">Date of Birth</label>
                  <p className="text-gray-800 font-semibold">{driverData.dob ? formatDate(driverData.dob) : 'N/A'}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-orange-600 mb-2 block">Gender</label>
                  <p className="text-gray-800 font-semibold">{driverData.gender ? driverData.gender.charAt(0).toUpperCase() + driverData.gender.slice(1) : 'N/A'}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-indigo-600 mb-2 block">Nationality</label>
                  <p className="text-gray-800 font-semibold">{driverData.nationality || 'N/A'}</p>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-pink-600 mb-2 block">City</label>
                  <p className="text-gray-800 font-semibold">{driverData.city || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Phone className="h-6 w-6 mr-3 text-green-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-green-600 mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Mobile Number
                  </label>
                  <p className="text-gray-800 font-semibold">{driverData.mobile || 'N/A'}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-blue-600 mb-2 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address
                  </label>
                  <p className="text-gray-800 font-semibold">{driverData.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Employment Information Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Building className="h-6 w-6 mr-3 text-indigo-600" />
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-indigo-600 mb-2 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Company
                  </label>
                  <p className="text-gray-800 font-semibold">{driverData.company?.company_name || 'No Company Assigned'}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-purple-600 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Registration Date
                  </label>
                  <p className="text-gray-800 font-semibold">{driverData.created_at ? formatDate(driverData.created_at) : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Status Information Section */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                Status Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-yellow-600 mb-2 block">Current Status</label>
                  <div className="flex items-center">
                    {getStatusBadge(driverData.status)}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Driver ID</label>
                  <p className="text-gray-800 font-semibold">#{driverData.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-blue-600" />
              Driver Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Image */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Image className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-800">Profile Image</h4>
                </div>
                {driverData.driver_profile_img ? (
                  <div className="space-y-3">
                    <img
                      src={driverData.driver_profile_img}
                      alt="Driver Profile"
                      className="w-full h-32 object-cover rounded-lg border border-blue-300"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(driverData.driver_profile_img, '_blank')}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = driverData.driver_profile_img;
                          link.download = `${driverData.driver_name}_profile.jpg`;
                          link.click();
                        }}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No profile image uploaded</p>
                  </div>
                )}
              </div>

              {/* Iqama Document */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">Iqama Document</h4>
                </div>
                {driverData.iqama_document ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-300">
                      <p className="text-sm text-gray-600">Document available</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(driverData.iqama_document, '_blank')}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = driverData.iqama_document;
                          link.download = `${driverData.driver_name}_iqama.pdf`;
                          link.click();
                        }}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No Iqama document uploaded</p>
                  </div>
                )}
              </div>

              {/* License Document */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-purple-800">License Document</h4>
                </div>
                {driverData.license_document ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <p className="text-sm text-gray-600">Document available</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(driverData.license_document, '_blank')}
                        className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = driverData.license_document;
                          link.download = `${driverData.driver_name}_license.pdf`;
                          link.click();
                        }}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No license document uploaded</p>
                  </div>
                )}
              </div>

              {/* Passport Document */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-orange-600 mr-2" />
                  <h4 className="font-semibold text-orange-800">Passport Document</h4>
                </div>
                {driverData.passport_document ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-orange-300">
                      <p className="text-sm text-gray-600">Document available</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(driverData.passport_document, '_blank')}
                        className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = driverData.passport_document;
                          link.download = `${driverData.driver_name}_passport.pdf`;
                          link.click();
                        }}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No passport document uploaded</p>
                  </div>
                )}
              </div>

              {/* Medical Document */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-pink-600 mr-2" />
                  <h4 className="font-semibold text-pink-800">Medical Document</h4>
                </div>
                {driverData.medical_document ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-pink-300">
                      <p className="text-sm text-gray-600">Document available</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(driverData.medical_document, '_blank')}
                        className="flex items-center px-3 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = driverData.medical_document;
                          link.download = `${driverData.driver_name}_medical.pdf`;
                          link.click();
                        }}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No medical document uploaded</p>
                  </div>
                )}
              </div>

              {/* Visa Document */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                  <h4 className="font-semibold text-indigo-800">Visa Document</h4>
                </div>
                {driverData.visa_document ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-indigo-300">
                      <p className="text-sm text-gray-600">Document available</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(driverData.visa_document, '_blank')}
                        className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = driverData.visa_document;
                          link.download = `${driverData.driver_name}_visa.pdf`;
                          link.click();
                        }}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No visa document uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Tab */}
        {activeTab === 'vehicle' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Car className="h-6 w-6 mr-3 text-blue-600" />
              Assigned Vehicle Information
            </h3>



            {loadingVehicleData ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-gray-600">Loading vehicle information...</span>
              </div>
            ) : assignedVehicle ? (
              <div className="space-y-6">
                {/* Vehicle Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-blue-600 mb-2 block">Vehicle Name</label>
                    <p className="text-gray-800 font-semibold">{assignedVehicle.vehicle_name || 'N/A'}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-green-600 mb-2 block">Vehicle Number</label>
                    <p className="text-gray-800 font-semibold">{assignedVehicle.vehicle_number || 'N/A'}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-purple-600 mb-2 block">Vehicle Type</label>
                    <p className="text-gray-800 font-semibold">{assignedVehicle.vehicle_type || 'N/A'}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-orange-600 mb-2 block">Approval Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      assignedVehicle.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      assignedVehicle.approval_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignedVehicle.approval_status || 'PENDING'}
                    </span>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-indigo-600 mb-2 block">Insurance Number</label>
                    <p className="text-gray-800 font-semibold">{assignedVehicle.insurance_number || 'N/A'}</p>
                  </div>
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-pink-600 mb-2 block">Insurance Expiry</label>
                    <p className="text-gray-800 font-semibold">{assignedVehicle.insurance_expiry_date ? formatDate(assignedVehicle.insurance_expiry_date) : 'N/A'}</p>
                  </div>
                </div>

                {/* Vehicle Image */}
                {assignedVehicle.image && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Image</h4>
                    <img
                      src={assignedVehicle.image}
                      alt="Vehicle"
                      className="w-full max-w-md h-auto rounded-lg object-cover border border-gray-300 shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-center py-8">
                      <Car className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Failed to load vehicle image</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No Vehicle Assigned</h4>
                <p className="text-gray-500">This driver has not been assigned a vehicle yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-3 text-blue-600" />
              Driver Activity Logs
            </h3>

            {/* Sample Activity Logs */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">Profile Created</span>
                  <span className="text-xs text-gray-500">{driverData.created_at ? formatDate(driverData.created_at) : 'N/A'}</span>
                </div>
                <p className="text-gray-700 text-sm">Driver profile was created and submitted for approval</p>
              </div>

              {driverData.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600">Profile Approved</span>
                    <span className="text-xs text-gray-500">Recently</span>
                  </div>
                  <p className="text-gray-700 text-sm">Driver profile has been approved and activated</p>
                </div>
              )}

              {driverData.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-600">Profile Rejected</span>
                    <span className="text-xs text-gray-500">Recently</span>
                  </div>
                  <p className="text-gray-700 text-sm">Driver profile was rejected. Please review and resubmit.</p>
                </div>
              )}

              {assignedVehicle && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">Vehicle Assigned</span>
                    <span className="text-xs text-gray-500">Recently</span>
                  </div>
                  <p className="text-gray-700 text-sm">Vehicle {assignedVehicle.vehicle_name} has been assigned to this driver</p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  <span className="text-xs text-gray-500">{driverData.updated_at ? formatDate(driverData.updated_at) : 'N/A'}</span>
                </div>
                <p className="text-gray-700 text-sm">Driver profile information was last updated</p>
              </div>
            </div>

            {/* No logs message */}
            <div className="text-center py-8 mt-8 border-t border-gray-200">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">Activity Timeline</h4>
              <p className="text-gray-500">Complete activity logs will be available in future updates</p>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete driver <strong>{driverData.driver_name}</strong>?
              This action cannot be undone and will permanently remove all driver data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDriver}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Driver_mange_DrProfile;
