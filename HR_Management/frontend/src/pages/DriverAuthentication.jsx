import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  Download,
  QrCode
} from 'lucide-react';

const DriverAuthentication = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    driverId: '',
    username: '',
    password: '',
    status: 'active',
    deviceId: '',
    lastLogin: null,
    loginAttempts: 0
  });

  useEffect(() => {
    fetchDriverAuth();
  }, []);

  const fetchDriverAuth = async () => {
    try {
      setLoading(true);
      // Simulate API call to get drivers with auth data
      const mockDriverAuth = [
        {
          id: 1,
          driverId: 1,
          driverName: 'Mohammed Al-Ahmad',
          mobile: '+965-1111-2222',
          iqama: 'IQ001234567',
          username: 'driver1',
          status: 'active',
          deviceId: 'DEVICE_001',
          lastLogin: '2024-01-15 08:30:00',
          loginAttempts: 0,
          createdAt: '2024-01-01 00:00:00',
          hasPassword: true
        },
        {
          id: 2,
          driverId: 2,
          driverName: 'Ahmed Hassan',
          mobile: '+965-2222-3333',
          iqama: 'IQ002345678',
          username: 'driver2',
          status: 'active',
          deviceId: 'DEVICE_002',
          lastLogin: '2024-01-14 16:45:00',
          loginAttempts: 0,
          createdAt: '2024-01-02 00:00:00',
          hasPassword: true
        },
        {
          id: 3,
          driverId: 3,
          driverName: 'Omar Al-Rashid',
          mobile: '+965-3333-4444',
          iqama: 'IQ003456789',
          username: 'driver3',
          status: 'inactive',
          deviceId: null,
          lastLogin: null,
          loginAttempts: 3,
          createdAt: '2024-01-03 00:00:00',
          hasPassword: false
        }
      ];
      setDrivers(mockDriverAuth);
    } catch (error) {
      console.error('Error fetching driver authentication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriverAuth = async (e) => {
    e.preventDefault();
    try {
      // Simulate API call
      const newDriverAuth = {
        id: drivers.length + 1,
        ...formData,
        createdAt: new Date().toISOString(),
        hasPassword: true
      };
      setDrivers([...drivers, newDriverAuth]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding driver authentication:', error);
    }
  };

  const handleEditDriverAuth = async (e) => {
    e.preventDefault();
    try {
      // Simulate API call
      const updatedDrivers = drivers.map(driver => 
        driver.id === selectedDriver.id 
          ? { ...driver, ...formData, hasPassword: formData.password ? true : driver.hasPassword }
          : driver
      );
      setDrivers(updatedDrivers);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating driver authentication:', error);
    }
  };

  const handleDeleteDriverAuth = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver authentication?')) {
      try {
        // Simulate API call
        setDrivers(drivers.filter(driver => driver.id !== driverId));
      } catch (error) {
        console.error('Error deleting driver authentication:', error);
      }
    }
  };

  const handleToggleStatus = async (driverId) => {
    try {
      // Simulate API call
      const updatedDrivers = drivers.map(driver => 
        driver.id === driverId 
          ? { ...driver, status: driver.status === 'active' ? 'inactive' : 'active' }
          : driver
      );
      setDrivers(updatedDrivers);
    } catch (error) {
      console.error('Error updating driver status:', error);
    }
  };

  const handleResetPassword = async (driverId) => {
    if (window.confirm('Are you sure you want to reset this driver\'s password?')) {
      try {
        // Simulate API call
        const newPassword = generateRandomPassword();
        const updatedDrivers = drivers.map(driver => 
          driver.id === driverId 
            ? { ...driver, loginAttempts: 0, hasPassword: true }
            : driver
        );
        setDrivers(updatedDrivers);
        alert(`New password generated: ${newPassword}\nPlease share this with the driver securely.`);
      } catch (error) {
        console.error('Error resetting password:', error);
      }
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateQRCode = (driver) => {
    setSelectedDriver(driver);
    setShowQRModal(true);
  };

  const resetForm = () => {
    setFormData({
      driverId: '',
      username: '',
      password: '',
      status: 'active',
      deviceId: '',
      lastLogin: null,
      loginAttempts: 0
    });
    setSelectedDriver(null);
  };

  const openEditModal = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      driverId: driver.driverId,
      username: driver.username,
      password: '',
      status: driver.status,
      deviceId: driver.deviceId || '',
      lastLogin: driver.lastLogin,
      loginAttempts: driver.loginAttempts
    });
    setShowEditModal(true);
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.mobile.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Smartphone className="mr-3 h-8 w-8 text-blue-600" />
                Driver Authentication
              </h1>
              <p className="mt-2 text-gray-600">
                Manage driver mobile app authentication and access
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchDriverAuth}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Driver Auth
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Drivers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locked Accounts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.loginAttempts >= 3).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">No Password Set</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter(d => !d.hasPassword).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {driver.driverName.split(' ').map(n => n.charAt(0)).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.driverName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {driver.mobile}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {driver.driverId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        @{driver.username}
                      </div>
                      <div className="flex items-center mt-1">
                        {driver.hasPassword ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <Key className="mr-1 h-3 w-3" />
                            Password Set
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <Key className="mr-1 h-3 w-3" />
                            No Password
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleToggleStatus(driver.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            driver.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {driver.status === 'active' ? (
                            <UserCheck className="mr-1 h-3 w-3" />
                          ) : (
                            <UserX className="mr-1 h-3 w-3" />
                          )}
                          {driver.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                        {driver.loginAttempts >= 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Shield className="mr-1 h-3 w-3" />
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.deviceId ? (
                        <div>
                          <div className="font-medium">{driver.deviceId}</div>
                          <div className="text-xs text-green-600">Registered</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not registered</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.lastLogin ? (
                        <div>
                          <div>{new Date(driver.lastLogin).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(driver.lastLogin).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(driver)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Edit Authentication"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(driver.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                          title="Reset Password"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generateQRCode(driver)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="Generate QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriverAuth(driver.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Delete Authentication"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Driver Auth Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Driver Authentication</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleAddDriverAuth} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver ID *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.driverId}
                        onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Device ID
                      </label>
                      <input
                        type="text"
                        value={formData.deviceId}
                        onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional - will be set on first login"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Authentication
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Driver Auth Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Driver Authentication</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleEditDriverAuth} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver ID *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.driverId}
                        onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password (leave blank to keep current)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Device ID
                      </label>
                      <input
                        type="text"
                        value={formData.deviceId}
                        onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Update Authentication
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedDriver && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">QR Code for App Download</h3>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="text-center">
                  <div className="bg-gray-100 p-8 rounded-lg mb-4">
                    <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Driver:</strong> {selectedDriver.driverName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Username:</strong> @{selectedDriver.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      Scan this QR code to download the driver mobile app
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3 pt-4">
                    <button
                      onClick={() => setShowQRModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Simulate download
                        alert('QR Code downloaded successfully!');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download QR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverAuthentication;
