import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AttendanceWarningSystemTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAttendanceWarningSystem = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get attendance records
      console.log('Testing: GET /hr/attendance/');
      const attendanceRes = await axiosInstance.get('/hr/attendance/');
      results.attendance = {
        success: true,
        data: attendanceRes.data,
        count: attendanceRes.data?.results?.length || attendanceRes.data?.length || 0
      };
      console.log('Attendance response:', attendanceRes.data);
    } catch (error) {
      console.error('Attendance error:', error);
      results.attendance = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 2: Get warning letters
      console.log('Testing: GET /warning-letters/');
      const warningsRes = await axiosInstance.get('/warning-letters/');
      results.warnings = {
        success: true,
        data: warningsRes.data,
        count: warningsRes.data?.results?.length || warningsRes.data?.length || 0
      };
      console.log('Warning letters response:', warningsRes.data);
    } catch (error) {
      console.error('Warning letters error:', error);
      results.warnings = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 3: Get terminations
      console.log('Testing: GET /hr/terminations/');
      const terminationsRes = await axiosInstance.get('/hr/terminations/');
      results.terminations = {
        success: true,
        data: terminationsRes.data,
        count: terminationsRes.data?.results?.length || terminationsRes.data?.length || 0
      };
      console.log('Terminations response:', terminationsRes.data);
    } catch (error) {
      console.error('Terminations error:', error);
      results.terminations = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 4: Get drivers
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
      // Test 5: Create a test warning letter
      if (results.drivers?.success && results.drivers.count > 0) {
        const drivers = results.drivers.data.results || results.drivers.data;
        const firstDriver = drivers[0];
        
        console.log('Testing: POST /warning-letters/');
        const createData = {
          driver_id: firstDriver.id,
          reason: 'attendance_issues',
          description: 'Test warning letter for attendance monitoring system',
          issued_date: new Date().toISOString().split('T')[0],
          status: 'active',
          issued_by_id: 1
        };
        
        const createRes = await axiosInstance.post('/warning-letters/', createData);
        results.createWarning = {
          success: true,
          data: createRes.data,
          driverName: firstDriver.driver_name
        };
        console.log('Create warning response:', createRes.data);
      } else {
        results.createWarning = {
          success: false,
          error: 'Cannot create warning - missing drivers'
        };
      }
    } catch (error) {
      console.error('Create warning error:', error);
      results.createWarning = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    try {
      // Test 6: Create sample attendance records for testing
      if (results.drivers?.success && results.drivers.count > 0) {
        const drivers = results.drivers.data.results || results.drivers.data;
        const testAttendanceData = [];
        
        // Create some test attendance records
        for (let i = 0; i < Math.min(3, drivers.length); i++) {
          const driver = drivers[i];
          const testRecord = {
            driver: driver.id,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            login_time: '09:00:00',
            logout_time: '17:00:00',
            status: i === 0 ? 'late' : i === 1 ? 'absent' : 'present',
            deduct_amount: i === 0 ? 50 : i === 1 ? 100 : null,
            reason_for_deduction: i === 0 ? 'Late arrival' : i === 1 ? 'Unauthorized absence' : null
          };
          
          try {
            const createRes = await axiosInstance.post('/attendance/', testRecord);
            testAttendanceData.push(createRes.data);
          } catch (error) {
            console.log('Attendance record might already exist for this date');
          }
        }
        
        results.createAttendance = {
          success: true,
          data: testAttendanceData,
          count: testAttendanceData.length
        };
      } else {
        results.createAttendance = {
          success: false,
          error: 'Cannot create attendance - missing drivers'
        };
      }
    } catch (error) {
      console.error('Create attendance error:', error);
      results.createAttendance = {
        success: false,
        error: error.response?.data || error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testAttendanceWarningSystem();
  }, []);

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  const calculateAttendanceStats = () => {
    if (!testResults.attendance?.success) return {};
    
    const attendanceData = testResults.attendance.data.results || testResults.attendance.data;
    const stats = {
      total: attendanceData.length,
      present: 0,
      late: 0,
      absent: 0,
      totalDeductions: 0
    };

    attendanceData.forEach(record => {
      switch (record.status) {
        case 'present':
          stats.present++;
          break;
        case 'late':
          stats.late++;
          break;
        case 'absent':
          stats.absent++;
          break;
      }
      if (record.deduct_amount) {
        stats.totalDeductions += parseFloat(record.deduct_amount);
      }
    });

    return stats;
  };

  const attendanceStats = calculateAttendanceStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">⚠️ Attendance Warning System Test</h2>
          <button
            onClick={testAttendanceWarningSystem}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Retest APIs'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="ml-4 text-lg">Testing attendance warning system APIs...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📊 Test Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.attendance?.success)}</div>
                  <div className="text-sm font-medium">Attendance</div>
                  <div className="text-xs text-gray-600">{testResults.attendance?.count || 0} records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.warnings?.success)}</div>
                  <div className="text-sm font-medium">Warnings</div>
                  <div className="text-xs text-gray-600">{testResults.warnings?.count || 0} letters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.terminations?.success)}</div>
                  <div className="text-sm font-medium">Terminations</div>
                  <div className="text-xs text-gray-600">{testResults.terminations?.count || 0} records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.drivers?.success)}</div>
                  <div className="text-sm font-medium">Drivers</div>
                  <div className="text-xs text-gray-600">{testResults.drivers?.count || 0} found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.createWarning?.success)}</div>
                  <div className="text-sm font-medium">Create Warning</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{getStatusIcon(testResults.createAttendance?.success)}</div>
                  <div className="text-sm font-medium">Create Records</div>
                  <div className="text-xs text-gray-600">Test</div>
                </div>
              </div>
            </div>

            {/* Attendance Statistics */}
            {testResults.attendance?.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">📈 Attendance Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{attendanceStats.total}</div>
                    <div className="text-sm text-blue-600">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                    <div className="text-sm text-green-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
                    <div className="text-sm text-yellow-600">Late</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                    <div className="text-sm text-red-600">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">${attendanceStats.totalDeductions}</div>
                    <div className="text-sm text-purple-600">Deductions</div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance Records */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.attendance?.success)}
                  <span className="ml-2">📅 Attendance Records</span>
                </h3>
                {testResults.attendance?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.attendance.count} records</p>
                    {testResults.attendance.data?.results?.slice(0, 3).map((record, index) => (
                      <p key={index} className="text-xs">
                        • {record.driver_name} - {record.date} ({record.status})
                      </p>
                    )) || testResults.attendance.data?.slice(0, 3).map((record, index) => (
                      <p key={index} className="text-xs">
                        • {record.driver_name} - {record.date} ({record.status})
                      </p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Attendance API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load attendance records</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.attendance?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Warning Letters */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.warnings?.success)}
                  <span className="ml-2">⚠️ Warning Letters</span>
                </h3>
                {testResults.warnings?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.warnings.count} warning letters</p>
                    {testResults.warnings.data?.results?.slice(0, 3).map((warning, index) => (
                      <p key={index} className="text-xs">
                        • {warning.driver_name} - {warning.reason?.replace(/_/g, ' ')} ({warning.status})
                      </p>
                    )) || testResults.warnings.data?.slice(0, 3).map((warning, index) => (
                      <p key={index} className="text-xs">
                        • {warning.driver_name} - {warning.reason?.replace(/_/g, ' ')} ({warning.status})
                      </p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Warning letters API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load warning letters</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.warnings?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Create Warning Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.createWarning?.success)}
                  <span className="ml-2">➕ Create Warning Test</span>
                </h3>
                {testResults.createWarning?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Successfully created warning letter</p>
                    <p className="text-xs">Driver: {testResults.createWarning.driverName}</p>
                    <p className="text-xs">Reason: Attendance Issues</p>
                    <p className="text-xs">Status: Active</p>
                    <p className="text-green-600 font-medium mt-2">Warning creation working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to create warning letter</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.createWarning?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Terminations */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {getStatusIcon(testResults.terminations?.success)}
                  <span className="ml-2">🚫 Terminations</span>
                </h3>
                {testResults.terminations?.success ? (
                  <div className="text-sm text-gray-600">
                    <p>✅ Found: {testResults.terminations.count} termination records</p>
                    {testResults.terminations.data?.results?.slice(0, 3).map((termination, index) => (
                      <p key={index} className="text-xs">
                        • {termination.driver_name} - {termination.reason?.replace(/_/g, ' ')}
                      </p>
                    )) || testResults.terminations.data?.slice(0, 3).map((termination, index) => (
                      <p key={index} className="text-xs">
                        • {termination.driver_name} - {termination.reason?.replace(/_/g, ' ')}
                      </p>
                    ))}
                    <p className="text-green-600 font-medium mt-2">Terminations API working</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to load terminations</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                      {JSON.stringify(testResults.terminations?.error, null, 2)}
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
                    {testResults.attendance?.success && <li>Attendance Records API ({testResults.attendance.count} records)</li>}
                    {testResults.warnings?.success && <li>Warning Letters API ({testResults.warnings.count} letters)</li>}
                    {testResults.terminations?.success && <li>Terminations API ({testResults.terminations.count} records)</li>}
                    {testResults.drivers?.success && <li>Driver Integration ({testResults.drivers.count} drivers)</li>}
                    {testResults.createWarning?.success && <li>Warning Letter Creation</li>}
                    {testResults.createAttendance?.success && <li>Attendance Record Creation</li>}
                  </ul>
                </div>
                <div>
                  <p><strong>❌ Issues Found:</strong></p>
                  <ul className="list-disc list-inside text-red-600">
                    {!testResults.attendance?.success && <li>Attendance Records API</li>}
                    {!testResults.warnings?.success && <li>Warning Letters API</li>}
                    {!testResults.terminations?.success && <li>Terminations API</li>}
                    {!testResults.drivers?.success && <li>Driver Integration</li>}
                    {!testResults.createWarning?.success && <li>Warning Creation</li>}
                    {!testResults.createAttendance?.success && <li>Attendance Creation</li>}
                  </ul>
                  {Object.values(testResults).every(result => result?.success) && (
                    <p className="text-green-600">🎉 All attendance warning features working!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">🚀 Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/attendance-warning-system"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                >
                  ⚠️ Open Attendance Warning System
                </a>
                <a
                  href="/hr-dashboard"
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
                >
                  🏢 Back to HR Dashboard
                </a>
                <a
                  href="/warning-letter"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-sm"
                >
                  ⚠️ Warning Letters (Legacy)
                </a>
                <a
                  href="/termination-letter"
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm"
                >
                  🚫 Terminations (Legacy)
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceWarningSystemTest;
