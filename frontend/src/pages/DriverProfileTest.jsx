import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const DriverProfileTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  const testDriverProfileSystem = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get all drivers
      console.log('Testing: GET /Register/drivers/');
      const driversRes = await axiosInstance.get('/Register/drivers/');
      const driversData = driversRes.data.results || driversRes.data;
      setDrivers(driversData);
      results.drivers = {
        success: true,
        data: driversData,
        count: driversData.length
      };
      console.log('Drivers response:', driversData);
    } catch (error) {
      console.error('Drivers error:', error);
      results.drivers = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 2: Get companies for dropdown
      console.log('Testing: GET /companies/');
      const companiesRes = await axiosInstance.get('/companies/');
      results.companies = {
        success: true,
        data: companiesRes.data,
        count: companiesRes.data?.results?.length || companiesRes.data?.length || 0
      };
    } catch (error) {
      console.error('Companies error:', error);
      results.companies = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 3: Get vehicles for dropdown
      console.log('Testing: GET /vehicles/');
      const vehiclesRes = await axiosInstance.get('/vehicles/');
      results.vehicles = {
        success: true,
        data: vehiclesRes.data,
        count: vehiclesRes.data?.results?.length || vehiclesRes.data?.length || 0
      };
    } catch (error) {
      console.error('Vehicles error:', error);
      results.vehicles = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 4: Create a test driver
      if (results.companies?.success && results.companies.count > 0) {
        const companies = results.companies.data.results || results.companies.data;
        const firstCompany = companies[0];
        
        console.log('Testing: POST /Register/drivers/');
        const testDriverData = {
          driver_name: 'Test Driver Profile Enhanced',
          email: 'testprofile@example.com',
          mobile: '+966501234567',
          iqama: 'TEST987654321',
          city: 'Riyadh',
          nationality: 'Saudi',
          dob: '1990-01-01',
          gender: 'male',
          company_id: firstCompany.id,
          status: 'pending'
        };
        
        const createRes = await axiosInstance.post('/Register/drivers/', testDriverData);
        results.createDriver = {
          success: true,
          data: createRes.data,
          driverId: createRes.data.id
        };
        console.log('Create driver response:', createRes.data);
      } else {
        results.createDriver = {
          success: false,
          error: 'Cannot create driver - missing companies'
        };
      }
    } catch (error) {
      console.error('Create driver error:', error);
      results.createDriver = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 5: Get specific driver details
      if (results.createDriver?.success) {
        const driverId = results.createDriver.driverId;
        console.log(`Testing: GET /Register/drivers/${driverId}/`);
        const driverRes = await axiosInstance.get(`/Register/drivers/${driverId}/`);
        results.getDriver = {
          success: true,
          data: driverRes.data
        };
      } else if (drivers.length > 0) {
        const driverId = drivers[0].id;
        console.log(`Testing: GET /Register/drivers/${driverId}/`);
        const driverRes = await axiosInstance.get(`/Register/drivers/${driverId}/`);
        results.getDriver = {
          success: true,
          data: driverRes.data
        };
      } else {
        results.getDriver = {
          success: false,
          error: 'No drivers available for testing'
        };
      }
    } catch (error) {
      console.error('Get driver error:', error);
      results.getDriver = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 6: Update driver profile
      if (results.getDriver?.success) {
        const driverId = results.getDriver.data.id;
        console.log(`Testing: PATCH /Register/drivers/${driverId}/`);
        const updateData = {
          driver_name: 'Updated Test Driver Profile',
          email: 'updated@example.com',
          mobile: '+966509876543'
        };
        
        const updateRes = await axiosInstance.patch(`/Register/drivers/${driverId}/`, updateData);
        results.updateDriver = {
          success: true,
          data: updateRes.data
        };
      } else {
        results.updateDriver = {
          success: false,
          error: 'Cannot test update - no driver available'
        };
      }
    } catch (error) {
      console.error('Update driver error:', error);
      results.updateDriver = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testDriverProfileSystem();
  }, []);

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  const calculateStatistics = () => {
    if (!drivers.length) return {};
    
    const stats = {
      total: drivers.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      withEmail: 0,
      withCompany: 0
    };

    drivers.forEach(driver => {
      switch (driver.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }
      
      if (driver.email) stats.withEmail++;
      if (driver.company) stats.withCompany++;
    });

    return stats;
  };

  const driverStats = calculateStatistics();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">👤 Enhanced Driver Profile System Test</h2>
          <button
            onClick={testDriverProfileSystem}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Retest APIs'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="ml-4 text-lg">Testing enhanced driver profile system...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Test Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.drivers?.success)}</div>
                  <div className="text-sm font-medium">Driver List</div>
                  <div className="text-xs text-gray-600">{testResults.drivers?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.companies?.success)}</div>
                  <div className="text-sm font-medium">Companies</div>
                  <div className="text-xs text-gray-600">{testResults.companies?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.vehicles?.success)}</div>
                  <div className="text-sm font-medium">Vehicles</div>
                  <div className="text-xs text-gray-600">{testResults.vehicles?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.createDriver?.success)}</div>
                  <div className="text-sm font-medium">Create Driver</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.getDriver?.success)}</div>
                  <div className="text-sm font-medium">Get Driver</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.updateDriver?.success)}</div>
                  <div className="text-sm font-medium">Update Driver</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
              </div>
            </div>

            {/* Driver Statistics */}
            {testResults.drivers?.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">👥 Driver Profile Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{driverStats.total}</div>
                    <div className="text-sm text-blue-600">Total Drivers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{driverStats.pending}</div>
                    <div className="text-sm text-yellow-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{driverStats.approved}</div>
                    <div className="text-sm text-green-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{driverStats.rejected}</div>
                    <div className="text-sm text-red-600">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{driverStats.withEmail}</div>
                    <div className="text-sm text-purple-600">With Email</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{driverStats.withCompany}</div>
                    <div className="text-sm text-indigo-600">With Company</div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Management */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.drivers?.success)}
                  <span className="ml-2">👥 Driver Management</span>
                </h3>
                {testResults.drivers?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.drivers.count} drivers</p>
                    {drivers.slice(0, 3).map((driver, index) => (
                      <p key={index} className="text-xs">
                        • {driver.driver_name} - {driver.status} ({driver.city})
                      </p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Driver listing working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load drivers</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.drivers?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Profile Creation */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.createDriver?.success)}
                  <span className="ml-2">➕ Profile Creation</span>
                </h3>
                {testResults.createDriver?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully created test driver</p>
                    <p className="text-xs">Name: Test Driver Profile Enhanced</p>
                    <p className="text-xs">Email: testprofile@example.com</p>
                    <p className="text-xs">ID: {testResults.createDriver.driverId}</p>
                    <p className="text-green-600 font-medium mt-2">Profile creation working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to create test driver</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.createDriver?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Profile Viewing */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.getDriver?.success)}
                  <span className="ml-2">👁️ Profile Viewing</span>
                </h3>
                {testResults.getDriver?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully retrieved driver profile</p>
                    <p className="text-xs">Name: {testResults.getDriver.data.driver_name}</p>
                    <p className="text-xs">Email: {testResults.getDriver.data.email || 'N/A'}</p>
                    <p className="text-xs">Status: {testResults.getDriver.data.status}</p>
                    <p className="text-green-600 font-medium mt-2">Profile viewing working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to retrieve driver profile</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.getDriver?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Profile Editing */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.updateDriver?.success)}
                  <span className="ml-2">✏️ Profile Editing</span>
                </h3>
                {testResults.updateDriver?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully updated driver profile</p>
                    <p className="text-xs">Updated Name: {testResults.updateDriver.data.driver_name}</p>
                    <p className="text-xs">Updated Email: {testResults.updateDriver.data.email}</p>
                    <p className="text-xs">Updated Phone: {testResults.updateDriver.data.mobile}</p>
                    <p className="text-green-600 font-medium mt-2">Profile editing working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to update driver profile</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.updateDriver?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">🚀 Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/adddriverform"
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm"
                >
                  ➕ Add New Driver
                </Link>
                <Link
                  to="/registration-management"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                >
                  👥 Driver List
                </Link>
                {drivers.length > 0 && (
                  <Link
                    to={`/profileedit/${drivers[0].id}`}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-sm"
                  >
                    ✏️ Edit First Driver
                  </Link>
                )}
                {drivers.length > 0 && (
                  <Link
                    to={`/driver-profile/${drivers[0].id}`}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded text-sm"
                  >
                    👁️ View First Driver
                  </Link>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Enhanced Driver Profile System Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>✅ Working Features:</strong></p>
                  <ul className="list-disc list-inside text-green-600">
                    {testResults.drivers?.success && <li>Enhanced Driver Listing with Statistics</li>}
                    {testResults.createDriver?.success && <li>Advanced Driver Profile Creation</li>}
                    {testResults.getDriver?.success && <li>Detailed Driver Profile Viewing</li>}
                    {testResults.updateDriver?.success && <li>Comprehensive Profile Editing</li>}
                    {testResults.companies?.success && <li>Company Integration</li>}
                    {testResults.vehicles?.success && <li>Vehicle Assignment</li>}
                  </ul>
                </div>
                <div>
                  <p><strong>🎯 Enhanced Features:</strong></p>
                  <ul className="list-disc list-inside text-blue-600">
                    <li>Modern Gradient UI Design</li>
                    <li>Real-time Form Validation</li>
                    <li>Progress Tracking</li>
                    <li>Toast Notifications</li>
                    <li>Responsive Mobile Design</li>
                    <li>Enhanced Error Handling</li>
                    <li>File Upload Support</li>
                    <li>Status Badge System</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverProfileTest;
