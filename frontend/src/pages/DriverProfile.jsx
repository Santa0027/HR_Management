import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Camera,
  Edit,
  Save,
  X,
  Upload,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Award,
  Shield,
  CreditCard
} from 'lucide-react';

const DriverProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Mock profile data
      const mockProfileData = {
        id: user?.id || 1,
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, Apt 4B, New York, NY 10001',
        date_of_birth: '1985-06-15',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '+1 (555) 987-6543',
        license_number: 'DL123456789',
        license_expiry: '2025-12-31',
        license_class: 'Class C',
        years_experience: 5,
        rating: 4.8,
        total_trips: 1247,
        status: 'active',
        join_date: '2019-03-15',
        profile_image: null,
        bank_account: {
          account_holder: 'John Doe',
          bank_name: 'Chase Bank',
          account_number: '****1234',
          routing_number: '****5678'
        }
      };

      const mockDocuments = [
        {
          id: 1,
          type: 'driving_license',
          name: 'Driving License',
          status: 'approved',
          uploaded_date: '2024-01-01',
          expiry_date: '2025-12-31',
          file_url: '/documents/license.pdf'
        },
        {
          id: 2,
          type: 'vehicle_registration',
          name: 'Vehicle Registration',
          status: 'approved',
          uploaded_date: '2024-01-01',
          expiry_date: '2024-12-31',
          file_url: '/documents/registration.pdf'
        },
        {
          id: 3,
          type: 'insurance',
          name: 'Vehicle Insurance',
          status: 'pending',
          uploaded_date: '2024-01-10',
          expiry_date: '2024-08-15',
          file_url: '/documents/insurance.pdf'
        },
        {
          id: 4,
          type: 'background_check',
          name: 'Background Check',
          status: 'approved',
          uploaded_date: '2024-01-01',
          expiry_date: '2025-01-01',
          file_url: '/documents/background.pdf'
        }
      ];

      setProfileData(mockProfileData);
      setDocuments(mockDocuments);
      setFormData(mockProfileData);
      
      toast.success('Profile data loaded successfully');
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive', icon: Clock },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended', icon: X },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: X },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expired', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const isDocumentExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-2 text-gray-600">Manage your personal information and documents</p>
            </div>
            <div className="flex items-center space-x-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} variant="default">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profileData?.name}</h2>
                  {getStatusBadge(profileData?.status)}
                  <div className="flex items-center">
                    {getRatingStars(profileData?.rating)}
                    <span className="ml-2 text-sm text-gray-600">({profileData?.rating})</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    {profileData?.total_trips} Total Trips
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {new Date(profileData?.join_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    {profileData?.years_experience} Years Experience
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData?.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData?.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{new Date(profileData?.date_of_birth).toLocaleDateString()}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData?.address}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData?.emergency_contact_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData?.emergency_contact_phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              License Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <p className="text-gray-900">{profileData?.license_number}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Class
                </label>
                <p className="text-gray-900">{profileData?.license_class}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{new Date(profileData?.license_expiry).toLocaleDateString()}</p>
                  {isDocumentExpiringSoon(profileData?.license_expiry) && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Account Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Bank Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <p className="text-gray-900">{profileData?.bank_account?.account_holder}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <p className="text-gray-900">{profileData?.bank_account?.bank_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <p className="text-gray-900">{profileData?.bank_account?.account_number}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </label>
                <p className="text-gray-900">{profileData?.bank_account?.routing_number}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Documents
              </div>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{document.name}</h3>
                    {getStatusBadge(document.status)}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Uploaded:</span>
                      <span>{new Date(document.uploaded_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Expires:</span>
                      <div className="flex items-center space-x-1">
                        <span>{new Date(document.expiry_date).toLocaleDateString()}</span>
                        {isDocumentExpiringSoon(document.expiry_date) && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-1" />
                      Replace
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverProfile;
