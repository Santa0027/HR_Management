import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const ShiftManagementTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testShiftManagement = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get shift types
      console.log('Testing: GET /hr/shift-types/');
      const shiftTypesRes = await axiosInstance.get('/hr/shift-types/');
      results.shiftTypes = {
        success: true,
        data: shiftTypesRes.data,
        count: shiftTypesRes.data?.results?.length || shiftTypesRes.data?.length || 0
      };
      console.log('Shift types response:', shiftTypesRes.data);
    } catch (error) {
      console.error('Shift types error:', error);
      results.shiftTypes = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 2: Get shift assignments
      console.log('Testing: GET /hr/shift-assignments/');
      const assignmentsRes = await axiosInstance.get('/hr/shift-assignments/');
      results.assignments = {
        success: true,
        data: assignmentsRes.data,
        count: assignmentsRes.data?.results?.length || assignmentsRes.data?.length || 0
      };
      console.log('Assignments response:', assignmentsRes.data);
    } catch (error) {
      console.error('Assignments error:', error);
      results.assignments = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 3: Get drivers
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
      // Test 4: Create a test shift assignment (if we have drivers and shift types)
      if (results.drivers?.success && results.shiftTypes?.success && 
          results.drivers.count > 0 && results.shiftTypes.count > 0) {
        
        const firstDriver = results.drivers.data.results?.[0] || results.drivers.data[0];
        const firstShiftType = results.shiftTypes.data.results?.[0] || results.shiftTypes.data[0];
        
        console.log('Testing: POST /shift-assignments/');
        const createData = {
          driver: firstDriver.id,
          shift_type: firstShiftType.id,
          start_date: '2025-07-05',
          working_days: ['monday', 'tuesday', 'wednesday'],
          notes: 'Test assignment from frontend',
          is_active: true
        };
        
        const createRes = await axiosInstance.post('/hr/shift-assignments/', createData);
        results.createAssignment = {
          success: true,
          data: createRes.data,
          driverName: firstDriver.driver_name,
          shiftName: firstShiftType.name
        };
        console.log('Create assignment response:', createRes.data);
      } else {
        results.createAssignment = {
          success: false,
          error: 'Cannot create assignment - missing drivers or shift types'
        };
      }
    } catch (error) {
      console.error('Create assignment error:', error);
      results.createAssignment = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testShiftManagement();
  }, []);

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🕒 Shift Management Test</h2>
          <button
            onClick={testShiftManagement}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Retest APIs'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="ml-4 text-lg">Testing shift management APIs...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Test Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.shiftTypes?.success)}</div>
                  <div className="text-sm font-medium">Shift Types</div>
                  <div className="text-xs text-gray-600">{testResults.shiftTypes?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.assignments?.success)}</div>
                  <div className="text-sm font-medium">Assignments</div>
                  <div className="text-xs text-gray-600">{testResults.assignments?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.drivers?.success)}</div>
                  <div className="text-sm font-medium">Drivers</div>
                  <div className="text-xs text-gray-600">{testResults.drivers?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.createAssignment?.success)}</div>
                  <div className="text-sm font-medium">Create Test</div>
                  <div className="text-xs text-gray-600">Assignment</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift Types */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.shiftTypes?.success)}
                  <span className="ml-2">Shift Types</span>
                </h3>
                {testResults.shiftTypes?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.shiftTypes.count} shift types</p>
                    {testResults.shiftTypes.data?.results?.slice(0, 3).map((shift, index) => (
                      <p key={index} className="text-xs">• {shift.name} ({shift.shift_type})</p>
                    )) || testResults.shiftTypes.data?.slice(0, 3).map((shift, index) => (
                      <p key={index} className="text-xs">• {shift.name} ({shift.shift_type})</p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">API working correctly</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load shift types</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.shiftTypes?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Drivers */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.drivers?.success)}
                  <span className="ml-2">Drivers</span>
                </h3>
                {testResults.drivers?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.drivers.count} drivers</p>
                    {testResults.drivers.data?.results?.slice(0, 3).map((driver, index) => (
                      <p key={index} className="text-xs">• {driver.driver_name} (ID: {driver.id})</p>
                    )) || testResults.drivers.data?.slice(0, 3).map((driver, index) => (
                      <p key={index} className="text-xs">• {driver.driver_name} (ID: {driver.id})</p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Drivers available for assignment</p>
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

              {/* Assignments */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.assignments?.success)}
                  <span className="ml-2">Shift Assignments</span>
                </h3>
                {testResults.assignments?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.assignments.count} assignments</p>
                    {testResults.assignments.data?.results?.slice(0, 3).map((assignment, index) => (
                      <p key={index} className="text-xs">• {assignment.driver_name} → {assignment.shift_name}</p>
                    )) || testResults.assignments.data?.slice(0, 3).map((assignment, index) => (
                      <p key={index} className="text-xs">• {assignment.driver_name} → {assignment.shift_name}</p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Assignment system working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load assignments</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.assignments?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Create Assignment Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.createAssignment?.success)}
                  <span className="ml-2">Create Assignment Test</span>
                </h3>
                {testResults.createAssignment?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully created assignment</p>
                    <p className="text-xs">Driver: {testResults.createAssignment.driverName}</p>
                    <p className="text-xs">Shift: {testResults.createAssignment.shiftName}</p>
                    <p className="text-xs">Days: Monday, Tuesday, Wednesday</p>
                    <p className="text-green-600 font-medium mt-2">Assignment creation working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to create assignment</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.createAssignment?.error, null, 2)}
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
                    {testResults.shiftTypes?.success && <li>Shift Types API ({testResults.shiftTypes.count} types)</li>}
                    {testResults.drivers?.success && <li>Drivers API ({testResults.drivers.count} drivers)</li>}
                    {testResults.assignments?.success && <li>Assignments API ({testResults.assignments.count} assignments)</li>}
                    {testResults.createAssignment?.success && <li>Assignment Creation</li>}
                  </ul>
                </div>
                <div>
                  <p><strong>❌ Issues Found:</strong></p>
                  <ul className="list-disc list-inside text-red-600">
                    {!testResults.shiftTypes?.success && <li>Shift Types API</li>}
                    {!testResults.drivers?.success && <li>Drivers API</li>}
                    {!testResults.assignments?.success && <li>Assignments API</li>}
                    {!testResults.createAssignment?.success && <li>Assignment Creation</li>}
                  </ul>
                  {Object.values(testResults).every(result => result?.success) && (
                    <p className="text-green-600">🎉 All shift management features working!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagementTest;
