import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
// import { toast } from 'react-toastify';

const DriverAuthManagement = () => {
  const [driverAuths, setDriverAuths] = useState([]);
  const [driversWithoutAuth, setDriversWithoutAuth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('existing');

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPasswordResetForm, setShowPasswordResetForm] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState(null);

  const [createForm, setCreateForm] = useState({
    driver: '',
    username: '',
    password: '',
    confirm_password: '',
    is_active: true
  });

  const [passwordResetForm, setPasswordResetForm] = useState({
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [authsRes, driversRes] = await Promise.all([
        axiosInstance.get('/Register/driver-auth/'),
        axiosInstance.get('/Register/driver-auth/drivers-without-auth/')
      ]);

      console.log('Driver auths response:', authsRes.data);
      console.log('Drivers without auth response:', driversRes.data);

      // Handle paginated responses
      const authsData = authsRes.data?.results || authsRes.data || [];
      const driversData = driversRes.data?.results || driversRes.data || [];

      setDriverAuths(Array.isArray(authsData) ? authsData : []);
      setDriversWithoutAuth(Array.isArray(driversData) ? driversData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to fetch driver authentication data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuth = async (e) => {
    e.preventDefault();
    
    if (createForm.password !== createForm.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axiosInstance.post('/Register/driver-auth/', createForm);
      alert('Driver authentication credentials created successfully');
      setShowCreateForm(false);
      resetCreateForm();
      fetchData();
    } catch (error) {
      console.error('Error creating auth:', error);
      alert(error.response?.data?.detail || 'Failed to create authentication credentials');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (passwordResetForm.new_password !== passwordResetForm.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axiosInstance.post(`/Register/driver-auth/${selectedAuth.id}/reset-password/`, {
        new_password: passwordResetForm.new_password
      });
      alert('Password reset successfully');
      setShowPasswordResetForm(false);
      setSelectedAuth(null);
      resetPasswordResetForm();
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  const handleUnlockAccount = async (authId, driverName) => {
    try {
      await axiosInstance.post(`/Register/driver-auth/${authId}/unlock-account/`);
      alert(`Account unlocked for ${driverName}`);
      fetchData();
    } catch (error) {
      console.error('Error unlocking account:', error);
      alert('Failed to unlock account');
    }
  };

  const handleToggleActive = async (authId, currentStatus, driverName) => {
    try {
      await axiosInstance.patch(`/Register/driver-auth/${authId}/`, {
        is_active: !currentStatus
      });
      alert(`Account ${!currentStatus ? 'activated' : 'deactivated'} for ${driverName}`);
      fetchData();
    } catch (error) {
      console.error('Error updating account status:', error);
      alert('Failed to update account status');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      driver: '',
      username: '',
      password: '',
      confirm_password: '',
      is_active: true
    });
  };

  const resetPasswordResetForm = () => {
    setPasswordResetForm({
      new_password: '',
      confirm_password: ''
    });
  };

  const getStatusBadge = (auth) => {
    if (auth.is_locked) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">🔒 Locked</span>;
    } else if (!auth.is_active) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">⏸️ Inactive</span>;
    } else if (auth.driver_status !== 'approved') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">⏳ Driver Not Approved</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✅ Active</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('existing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'existing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Existing Credentials ({driverAuths.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create New ({driversWithoutAuth.length} drivers available)
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'existing' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Driver Mobile Authentication</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>📱 Mobile App Login:</strong> Drivers use these credentials to login to the mobile application.
                    This is separate from admin dashboard authentication.
                  </p>
                </div>
              </div>

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
                        Failed Attempts
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
                    {driverAuths.map((auth) => (
                      <tr key={auth.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{auth.driver_name}</div>
                            <div className="text-sm text-gray-500">ID: {auth.driver_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {auth.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(auth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {auth.failed_login_attempts > 0 ? (
                            <span className="text-red-600 font-semibold">{auth.failed_login_attempts}</span>
                          ) : (
                            <span className="text-green-600">0</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {auth.last_login ? new Date(auth.last_login).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {auth.is_locked && (
                            <button
                              onClick={() => handleUnlockAccount(auth.id, auth.driver_name)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Unlock
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleActive(auth.id, auth.is_active, auth.driver_name)}
                            className={auth.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                          >
                            {auth.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAuth(auth);
                              setShowPasswordResetForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Driver Authentication</h2>
                {driversWithoutAuth.length > 0 && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Create New Credentials
                  </button>
                )}
              </div>

              {driversWithoutAuth.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">All Set!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All approved drivers already have mobile authentication credentials.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IQAMA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {driversWithoutAuth.map((driver) => (
                        <tr key={driver.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {driver.driver_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {driver.iqama}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {driver.mobile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              No Mobile Auth
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Authentication Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Driver Authentication
              </h3>
              <form onSubmit={handleCreateAuth}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Driver *
                  </label>
                  <select
                    value={createForm.driver}
                    onChange={(e) => setCreateForm({ ...createForm, driver: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Driver</option>
                    {driversWithoutAuth.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.driver_name} - {driver.iqama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="e.g., driver1, john_doe"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used for mobile app login
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    minLength="6"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={createForm.confirm_password}
                    onChange={(e) => setCreateForm({ ...createForm, confirm_password: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    minLength="6"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createForm.is_active}
                      onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-gray-700 text-sm font-bold">Active (can login to mobile app)</span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetCreateForm();
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Form Modal */}
      {showPasswordResetForm && selectedAuth && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reset Password for {selectedAuth.driver_name}
              </h3>
              <form onSubmit={handlePasswordReset}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordResetForm.new_password}
                    onChange={(e) => setPasswordResetForm({ ...passwordResetForm, new_password: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    minLength="6"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordResetForm.confirm_password}
                    onChange={(e) => setPasswordResetForm({ ...passwordResetForm, confirm_password: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    minLength="6"
                    required
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>⚠️ Warning:</strong> This will reset the driver's mobile app password.
                    Make sure to inform the driver of the new password.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordResetForm(false);
                      setSelectedAuth(null);
                      resetPasswordResetForm();
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverAuthManagement;
