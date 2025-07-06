import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const DriverLoginDemo = () => {
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    device_info: 'Demo Web Browser'
  });
  
  const [loginResponse, setLoginResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/mobile/login/', loginForm);
      setLoginResponse(response.data);
      toast.success('Driver login successful!');
      
      // Fetch driver profile
      const profileResponse = await axiosInstance.get(`/mobile/profile/${response.data.driver.id}/`);
      setDriverProfile(profileResponse.data);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Login failed');
      setLoginResponse(null);
      setDriverProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/mobile/logout/');
      setLoginResponse(null);
      setDriverProfile(null);
      setLoginForm({ username: '', password: '', device_info: 'Demo Web Browser' });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📱 Driver Mobile Login Demo</h2>
            <p className="text-gray-600 mt-2">Test the driver mobile authentication system</p>
          </div>

          {!loginResponse ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., driver1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Info (Optional)
                </label>
                <input
                  type="text"
                  value={loginForm.device_info}
                  onChange={(e) => setLoginForm({ ...loginForm, device_info: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Device information"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Login Successful!</h3>
                <div className="text-sm text-green-700">
                  <p><strong>Driver:</strong> {loginResponse.driver.name}</p>
                  <p><strong>Username:</strong> {loginResponse.driver.username}</p>
                  <p><strong>Mobile:</strong> {loginResponse.driver.mobile}</p>
                  <p><strong>IQAMA:</strong> {loginResponse.driver.iqama}</p>
                  <p><strong>Last Login:</strong> {new Date(loginResponse.last_login).toLocaleString()}</p>
                </div>
              </div>

              {driverProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">👤 Driver Profile</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Name:</strong> {driverProfile.driver_name}</p>
                    <p><strong>Gender:</strong> {driverProfile.gender}</p>
                    <p><strong>City:</strong> {driverProfile.city}</p>
                    <p><strong>Nationality:</strong> {driverProfile.nationality}</p>
                    <p><strong>DOB:</strong> {driverProfile.dob}</p>
                    <p><strong>Status:</strong> {driverProfile.status}</p>
                    {driverProfile.company_name && (
                      <p><strong>Company:</strong> {driverProfile.company_name}</p>
                    )}
                    {driverProfile.vehicle_name && (
                      <p><strong>Vehicle:</strong> {driverProfile.vehicle_name} ({driverProfile.vehicle_number})</p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🔑 JWT Tokens</h3>
                <div className="text-xs text-gray-600 space-y-2">
                  <div>
                    <p className="font-medium">Access Token:</p>
                    <p className="break-all bg-gray-100 p-2 rounded">{loginResponse.access_token}</p>
                  </div>
                  <div>
                    <p className="font-medium">Refresh Token:</p>
                    <p className="break-all bg-gray-100 p-2 rounded">{loginResponse.refresh_token}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          )}

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">📋 Test Credentials</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>Username:</strong> driver1, driver2, driver3</p>
              <p><strong>Password:</strong> driver123</p>
              <p><strong>Note:</strong> These are demo credentials created by the management command</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverLoginDemo;
