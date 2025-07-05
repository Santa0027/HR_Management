import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const RegisterManagementTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testRegisterManagementSystem = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get drivers
      console.log('Testing: GET /Register/drivers/');
      const driversRes = await axiosInstance.get('/Register/drivers/');
      results.drivers = {
        success: true,
        data: driversRes.data,
        count: driversRes.data?.results?.length || driversRes.data?.length || 0
      };
      console.log('Drivers response:', driversRes.data);
    } catch (error) {
      console.error('Drivers error:', error);
      results.drivers = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 2: Get companies
      console.log('Testing: GET /companies/');
      const companiesRes = await axiosInstance.get('/companies/');
      results.companies = {
        success: true,
        data: companiesRes.data,
        count: companiesRes.data?.results?.length || companiesRes.data?.length || 0
      };
      console.log('Companies response:', companiesRes.data);
    } catch (error) {
      console.error('Companies error:', error);
      results.companies = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 3: Get vehicle registrations
      console.log('Testing: GET /vehicle-registrations/');
      const vehiclesRes = await axiosInstance.get('/vehicle-registrations/');
      results.vehicles = {
        success: true,
        data: vehiclesRes.data,
        count: vehiclesRes.data?.results?.length || vehiclesRes.data?.length || 0
      };
      console.log('Vehicle registrations response:', vehiclesRes.data);
    } catch (error) {
      console.error('Vehicle registrations error:', error);
      results.vehicles = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 4: Create a test driver registration
      if (results.companies?.success && results.companies.count > 0) {
        const companies = results.companies.data.results || results.companies.data;
        const firstCompany = companies[0];
        
        console.log('Testing: POST /Register/drivers/');
        const testDriverData = {
          driver_name: 'Test Driver Registration',
          email: 'testdriver@example.com',
          mobile: '+966501234567',
          iqama: 'TEST123456789',
          city: 'Riyadh',
          company: firstCompany.id,
          status: 'pending'
        };
        
        const createRes = await axiosInstance.post('/Register/drivers/', testDriverData);
        results.createDriver = {
          success: true,
          data: createRes.data,
          companyName: firstCompany.company_name
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
      // Test 5: Test driver approval workflow
      if (results.drivers?.success && results.drivers.count > 0) {
        const drivers = results.drivers.data.results || results.drivers.data;
        const pendingDriver = drivers.find(d => d.status === 'pending');
        
        if (pendingDriver) {
          console.log('Testing: PATCH /Register/drivers/{id}/ (approval)');
          const approvalRes = await axiosInstance.patch(`/Register/drivers/${pendingDriver.id}/`, {
            status: 'approved',
            approval_notes: 'Test approval via automated testing'
          });
          
          results.approveDriver = {
            success: true,
            data: approvalRes.data,
            driverName: pendingDriver.driver_name
          };
          console.log('Approve driver response:', approvalRes.data);
        } else {
          results.approveDriver = {
            success: false,
            error: 'No pending drivers found for approval test'
          };
        }
      } else {
        results.approveDriver = {
          success: false,
          error: 'Cannot test approval - missing drivers'
        };
      }
    } catch (error) {
      console.error('Approve driver error:', error);
      results.approveDriver = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 6: Create a test vehicle registration
      if (results.drivers?.success && results.drivers.count > 0) {
        const drivers = results.drivers.data.results || results.drivers.data;
        const firstDriver = drivers[0];
        
        console.log('Testing: POST /vehicle-registrations/');
        const testVehicleData = {
          vehicle_name: 'Test Vehicle Registration',
          vehicle_type: 'Car',
          license_plate: 'TEST-123',
          driver_id: firstDriver.id,
          approval_status: 'PENDING'
        };
        
        const createVehicleRes = await axiosInstance.post('/vehicle-registrations/', testVehicleData);
        results.createVehicle = {
          success: true,
          data: createVehicleRes.data,
          driverName: firstDriver.driver_name
        };
        console.log('Create vehicle response:', createVehicleRes.data);
      } else {
        results.createVehicle = {
          success: false,
          error: 'Cannot create vehicle - missing drivers'
        };
      }
    } catch (error) {
      console.error('Create vehicle error:', error);
      results.createVehicle = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testRegisterManagementSystem();
  }, []);

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  const calculateStatistics = () => {
    if (!testResults.drivers?.success) return {};
    
    const driversData = testResults.drivers.data.results || testResults.drivers.data;
    const stats = {
      total: driversData.length,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    driversData.forEach(driver => {
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
    });

    return stats;
  };

  const driverStats = calculateStatistics();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏢 Register Management System Test</h2>
          <button
            onClick={testRegisterManagementSystem}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Retest APIs'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="ml-4 text-lg">Testing register management APIs...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Test Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.drivers?.success)}</div>
                  <div className="text-sm font-medium">Drivers</div>
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
                  <div className="text-2xl">{getStatusIcon(testResults.approveDriver?.success)}</div>
                  <div className="text-sm font-medium">Approve Driver</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.createVehicle?.success)}</div>
                  <div className="text-sm font-medium">Create Vehicle</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
              </div>
            </div>

            {/* Driver Statistics */}
            {testResults.drivers?.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">👥 Driver Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </div>
              </div>
            )}

            {/* Detailed Results */}
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
                    {testResults.drivers.data?.results?.slice(0, 3).map((driver, index) => (
                      <p key={index} className="text-xs">
                        • {driver.driver_name} - {driver.status} ({driver.city})
                      </p>
                    )) || testResults.drivers.data?.slice(0, 3).map((driver, index) => (
                      <p key={index} className="text-xs">
                        • {driver.driver_name} - {driver.status} ({driver.city})
                      </p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Driver API working</p>
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

              {/* Company Management */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.companies?.success)}
                  <span className="ml-2">🏢 Company Management</span>
                </h3>
                {testResults.companies?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.companies.count} companies</p>
                    {testResults.companies.data?.results?.slice(0, 3).map((company, index) => (
                      <p key={index} className="text-xs">
                        • {company.company_name} - {company.is_active ? 'Active' : 'Inactive'}
                      </p>
                    )) || testResults.companies.data?.slice(0, 3).map((company, index) => (
                      <p key={index} className="text-xs">
                        • {company.company_name} - {company.is_active ? 'Active' : 'Inactive'}
                      </p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Company API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load companies</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.companies?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Create Driver Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.createDriver?.success)}
                  <span className="ml-2">➕ Create Driver Test</span>
                </h3>
                {testResults.createDriver?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully created test driver</p>
                    <p className="text-xs">Name: Test Driver Registration</p>
                    <p className="text-xs">Company: {testResults.createDriver.companyName}</p>
                    <p className="text-xs">Status: Pending</p>
                    <p className="text-green-600 font-medium mt-2">Driver creation working</p>
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

              {/* Approval Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.approveDriver?.success)}
                  <span className="ml-2">✅ Approval Test</span>
                </h3>
                {testResults.approveDriver?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully approved driver</p>
                    <p className="text-xs">Driver: {testResults.approveDriver.driverName}</p>
                    <p className="text-xs">Status: Approved</p>
                    <p className="text-xs">Notes: Test approval</p>
                    <p className="text-green-600 font-medium mt-2">Approval workflow working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to test approval</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.approveDriver?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Test Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>✅ Working Components:</strong></p>
                  <ul className="list-disc list-inside text-green-600">
                    {testResults.drivers?.success && <li>Driver Management API ({testResults.drivers.count} drivers)</li>}
                    {testResults.companies?.success && <li>Company Management API ({testResults.companies.count} companies)</li>}
                    {testResults.vehicles?.success && <li>Vehicle Registration API ({testResults.vehicles.count} vehicles)</li>}
                    {testResults.createDriver?.success && <li>Driver Registration</li>}
                    {testResults.approveDriver?.success && <li>Driver Approval Workflow</li>}
                    {testResults.createVehicle?.success && <li>Vehicle Registration</li>}
                  </ul>
                </div>
                <div>
                  <p><strong>❌ Issues Found:</strong></p>
                  <ul className="list-disc list-inside text-red-600">
                    {!testResults.drivers?.success && <li>Driver Management API</li>}
                    {!testResults.companies?.success && <li>Company Management API</li>}
                    {!testResults.vehicles?.success && <li>Vehicle Registration API</li>}
                    {!testResults.createDriver?.success && <li>Driver Registration</li>}
                    {!testResults.approveDriver?.success && <li>Driver Approval Workflow</li>}
                    {!testResults.createVehicle?.success && <li>Vehicle Registration</li>}
                  </ul>
                  {Object.values(testResults).every(result => result?.success) && (
                    <p className="text-green-600">🎉 All register management features working!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">🚀 Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/register-management-dashboard"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                >
                  🏢 Register Management Dashboard
                </a>
                <a
                  href="/registration-management"
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm"
                >
                  👥 Driver Registration
                </a>
                <a
                  href="/registration-management/aproval_status"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-sm"
                >
                  ✅ Driver Approvals
                </a>
                <a
                  href="/company-registration"
                  className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-sm"
                >
                  🏢 Company Registration
                </a>
                <a
                  href="/vehicle-registration"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded text-sm"
                >
                  🚗 Vehicle Registration
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterManagementTest;
