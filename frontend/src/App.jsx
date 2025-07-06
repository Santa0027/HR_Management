// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Public pages
import LoginPage from './pages/LoginPage';
import TestLogin from './pages/TestLogin';
import DriverLoginDemo from './pages/DriverLoginDemo';
import DriverAuthTest from './pages/DriverAuthTest';
import UserManagementTest from './pages/UserManagementTest';
import SystemStatusCheck from './pages/SystemStatusCheck';
import TestNavigation from './pages/TestNavigation';
import ShiftManagementTest from './pages/ShiftManagementTest';
import LeaveManagementTest from './pages/LeaveManagementTest';
import LocationManagement from './pages/LocationManagement';
import LocationManagementTest from './pages/LocationManagementTest';
import AttendanceWarningSystem from './pages/AttendanceWarningSystem';
import AttendanceWarningSystemTest from './pages/AttendanceWarningSystemTest';
import RegisterManagementDashboard from './pages/RegisterManagementDashboard';
import RegisterManagementTest from './pages/RegisterManagementTest';
import DriverProfileTest from './pages/DriverProfileTest';

// Layout and protection
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Dashboard
import DriverManagement from './pages/Drivermanagement';

// Registration Management
import Reg_ma_new_request from './pages/Reg-ma_new_request';
import Reg_ma_aprovel from './pages/Reg_ma_aprovel';
import DriverProfile from './pages/Driverapproal';
import DriverProfileEditDelete from './pages/Reg_ma_driver_information';
import Reg_ma_vehicle_registration from './pages/Reg_ma_vehicle_registration';
import Reg_ma_vehicle_list from './pages/Reg_ma_vehicle_list';
import Reg_ma_platform_list from './pages/Reg_ma_platform_list';
import CompanyRegistrationForm from './pages/Reg_ma_company_form';
import CompanyProfile from './pages/Reg_ma_company_profile';
import EditCompany from './pages/EditCompany';

// Driver Management
import AddDriverForm from './pages/AddDriverForm';
import Driver_mange_DrProfile from './pages/Driver_mange_DrProfile';
import Driver_mange_vehicle_info from './pages/Driver_mange_vehicle_info';
import Driver_manage_attachment from './pages/Driver_manage_attachment';
import Driver_mange_logs from './pages/Driver_mange_logs';

// Vehicle Details
import VehicleProfile from './pages/VehicleProfile';
import VehicleEdit from './pages/VehicleEdit';
import PendingApprovalTabContent from './pages/Reg_ma_vehicle_approval';

// HR & Attendance
import AttendanceDashboard from './pages/AttendanceDashboard';
import HRDashboard from './pages/HRDashboard';
import WarningLetters from './pages/WarningLetter';
import TerminationManagement from './pages/TerminationLetter';

// Accounting
import AccountingDashboard from './pages/AccountingDashboard';
import TransactionManagement from './pages/TransactionManagement';
import IncomeManagement from './pages/IncomeManagement';
import ExpenseManagement from './pages/ExpenseManagement';

// Admin Management
import AdminUserManagement from './pages/AdminUserManagement';
import DriverAuthentication from './pages/DriverAuthentication';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test-login" element={<TestLogin />} />
        <Route path="/driver-login-demo" element={<DriverLoginDemo />} />
        <Route path="/driver-auth-test" element={<DriverAuthTest />} />
        <Route path="/user-management-test" element={<UserManagementTest />} />
        <Route path="/system-status" element={<SystemStatusCheck />} />
        <Route path="/test-nav" element={<TestNavigation />} />
        <Route path="/shift-management-test" element={<ShiftManagementTest />} />
        <Route path="/leave-management-test" element={<LeaveManagementTest />} />
        <Route path="/location-management" element={<LocationManagement />} />
        <Route path="/location-management-test" element={<LocationManagementTest />} />
        <Route path="/attendance-warning-system" element={<AttendanceWarningSystem />} />
        <Route path="/attendance-warning-system-test" element={<AttendanceWarningSystemTest />} />
        <Route path="/register-management-dashboard" element={<RegisterManagementDashboard />} />
        <Route path="/register-management-test" element={<RegisterManagementTest />} />
        <Route path="/driver-profile-test" element={<DriverProfileTest />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<DriverManagement />} />

          {/* Registration Management */}
          <Route path="/registration-management" element={<Reg_ma_new_request />} />
          <Route path="/registration-management/aproval_status" element={<Reg_ma_aprovel />} />
          <Route path="/registration-management/aproval_status/driver/:id" element={<DriverProfile />} />
          <Route path="/profileedit/:driverId" element={<DriverProfileEditDelete />} />
          <Route path="/vehicle-registration" element={<Reg_ma_vehicle_registration />} />
          <Route path="/vehicle-registration/:id" element={<Reg_ma_vehicle_registration />} />
          <Route path="/vehicle-list" element={<Reg_ma_vehicle_list />} />
          <Route path="/platform-list" element={<Reg_ma_platform_list />} />
          <Route path="/company-list" element={<Reg_ma_platform_list />} />
          <Route path="/company-profile/:id" element={<CompanyProfile />} />
          <Route path="/company-registration" element={<CompanyRegistrationForm />} />
          <Route path="/company-registration/:id" element={<CompanyRegistrationForm />} />
          <Route path="/company/:id/edit" element={<EditCompany />} />

          {/* Driver Management */}
          <Route path="/driver-management/Driver_profile/:id" element={<Driver_mange_DrProfile />} />
          <Route path="/driver-profile/:id" element={<Driver_mange_DrProfile />} />
          <Route path="/driver-management/vehicle_information" element={<Driver_mange_vehicle_info />} />
          <Route path="/driver-management/attachments" element={<Driver_manage_attachment />} />
          <Route path="/driver-management/logs" element={<Driver_mange_logs />} />
          <Route path="/adddriverform" element={<AddDriverForm />} />

          {/* Vehicle Details */}
          <Route path="/vehicles/:id" element={<VehicleProfile />} />
          <Route path="/vehicle-profile/:id" element={<VehicleProfile />} />
          <Route path="/vehicles/:id/edit" element={<VehicleEdit />} />
          <Route path="/vehicleapprovel" element={<VehicleProfile />} />

          {/* HR & Attendance - HR and Admin only */}
          <Route
            path="/AttendanceDashboard"
            element={
              <ProtectedRoute requiredPermissions={['can_view_attendance']}>
                <AttendanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/HRDashboard"
            element={
              <ProtectedRoute requiredPermissions={['can_view_hr']}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warningletter"
            element={
              <ProtectedRoute requiredPermissions={['can_manage_hr']}>
                <WarningLetters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/terminationletter"
            element={
              <ProtectedRoute requiredPermissions={['can_manage_hr']}>
                <TerminationManagement />
              </ProtectedRoute>
            }
          />

          {/* Accounting - Accountant and Admin only */}
          <Route
            path="/accounting"
            element={
              <ProtectedRoute requiredPermissions={['can_view_accounting']}>
                <AccountingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/transactions"
            element={
              <ProtectedRoute>
                <TransactionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/income"
            element={
              <ProtectedRoute>
                <IncomeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/expenses"
            element={
              <ProtectedRoute>
                <ExpenseManagement />
              </ProtectedRoute>
            }
          />

          {/* Admin Management - Admin only */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredPermissions={['can_manage_users']}>
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/driver-auth"
            element={
              <ProtectedRoute requiredPermissions={['can_manage_drivers']}>
                <DriverAuthentication />
              </ProtectedRoute>
            }
          />

        </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
