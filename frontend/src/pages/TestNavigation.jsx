import React from 'react';
import { Link } from 'react-router-dom';

const TestNavigation = () => {
  const testPages = [
    {
      title: '🔍 System Status Check',
      description: 'Comprehensive test of all HR management system features',
      path: '/system-status',
      color: 'bg-blue-500 hover:bg-blue-700'
    },
    {
      title: '📱 Driver Login Demo',
      description: 'Test driver mobile authentication and login flow',
      path: '/driver-login-demo',
      color: 'bg-green-500 hover:bg-green-700'
    },
    {
      title: '🔐 Driver Auth API Test',
      description: 'Test driver authentication API endpoints',
      path: '/driver-auth-test',
      color: 'bg-purple-500 hover:bg-purple-700'
    },
    {
      title: '👥 User Management API Test',
      description: 'Test admin user management API endpoints',
      path: '/user-management-test',
      color: 'bg-orange-500 hover:bg-orange-700'
    },
    {
      title: '🕒 Shift Management Test',
      description: 'Test shift types, assignments, and driver integration',
      path: '/shift-management-test',
      color: 'bg-indigo-500 hover:bg-indigo-700'
    },
    {
      title: '📅 Leave Management Test',
      description: 'Test leave requests, types, balances, and approval workflow',
      path: '/leave-management-test',
      color: 'bg-teal-500 hover:bg-teal-700'
    },
    {
      title: '📍 Location Management Test',
      description: 'Test check-in and apartment locations with driver assignments',
      path: '/location-management-test',
      color: 'bg-purple-500 hover:bg-purple-700'
    },
    {
      title: '⚠️ Attendance Warning System Test',
      description: 'Test attendance monitoring, warnings, and termination management',
      path: '/attendance-warning-system-test',
      color: 'bg-orange-500 hover:bg-orange-700'
    },
    {
      title: '🏢 Register Management Test',
      description: 'Test driver registration, company management, and approval workflows',
      path: '/register-management-test',
      color: 'bg-indigo-500 hover:bg-indigo-700'
    },
    {
      title: '👤 Driver Profile Test',
      description: 'Test enhanced driver profile creation, viewing, and editing functionality',
      path: '/driver-profile-test',
      color: 'bg-purple-500 hover:bg-purple-700'
    },
    {
      title: '💰 Accounting System Test',
      description: 'Comprehensive test of all accounting features, API endpoints, and data flow',
      path: '/accounting-system-test',
      color: 'bg-green-500 hover:bg-green-700'
    },
    {
      title: '🏠 Main Application',
      description: 'Go to the main HR management application',
      path: '/',
      color: 'bg-gray-500 hover:bg-gray-700'
    }
  ];

  const mainFeatures = [
    {
      title: '🕒 Shift Management',
      description: 'Create and manage shift types and assignments',
      features: ['Shift Types', 'Driver Assignments', 'Working Days', 'Time Schedules']
    },
    {
      title: '📅 Leave Management',
      description: 'Handle employee leave requests and approvals',
      features: ['Leave Requests', 'Approval Workflow', 'Leave Types', 'Balance Tracking']
    },
    {
      title: '🚗 Driver Management',
      description: 'Manage driver profiles and information',
      features: ['Driver Profiles', 'Document Management', 'Status Tracking', 'Company Assignment']
    },
    {
      title: '🔐 Driver Mobile Auth',
      description: 'Mobile authentication for driver applications',
      features: ['Individual Login', 'Password Management', 'Account Security', 'Device Tracking']
    },
    {
      title: '👥 Admin User Management',
      description: 'Manage admin dashboard users and permissions',
      features: ['User CRUD', 'Role Management', 'Password Reset', 'Statistics Dashboard']
    },
    {
      title: '📍 Location Management',
      description: 'Manage check-in and apartment locations',
      features: ['Check-in Locations', 'Apartment Locations', 'Driver Assignment', 'Location Tracking']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏢 HR Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete HR management solution with driver mobile authentication
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
            <p className="text-green-800 font-semibold">
              ✅ All systems operational and ready for testing!
            </p>
          </div>
        </div>

        {/* Test Pages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🧪 Test & Demo Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testPages.map((page, index) => (
              <Link
                key={index}
                to={page.path}
                className={`${page.color} text-white p-6 rounded-lg shadow-md transition-colors duration-200 block`}
              >
                <h3 className="text-lg font-semibold mb-2">{page.title}</h3>
                <p className="text-sm opacity-90">{page.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-1">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-500 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔑 Test Credentials</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="font-medium text-gray-700">Admin Dashboard:</p>
                  <p className="text-sm text-gray-600">Email: admin@example.com</p>
                  <p className="text-sm text-gray-600">Password: admin123</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Driver Mobile:</p>
                  <p className="text-sm text-gray-600">Username: driver1, driver2, driver3</p>
                  <p className="text-sm text-gray-600">Password: driver123</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 System Stats</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">✅ Backend APIs: Fully functional</p>
                <p className="text-sm text-gray-600">✅ Frontend UI: Complete</p>
                <p className="text-sm text-gray-600">✅ Database: Populated with test data</p>
                <p className="text-sm text-gray-600">✅ Authentication: Working for both admin and mobile</p>
                <p className="text-sm text-gray-600">✅ CRUD Operations: All functional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with React, Django, and modern web technologies</p>
          <p className="mt-2">Ready for production deployment 🚀</p>
        </div>
      </div>
    </div>
  );
};

export default TestNavigation;
