// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Public pages
import LoginPage from './pages/LoginPage';

// Layout and protection
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

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
          <Route path="/vehicle-list" element={<Reg_ma_vehicle_list />} />
          <Route path="/platform-list" element={<Reg_ma_platform_list />} />
          <Route path="/company-profile/:id" element={<CompanyProfile />} />
          <Route path="/company-registration" element={<CompanyRegistrationForm />} />
          <Route path="/company/:id/edit" element={<EditCompany />} />

          {/* Driver Management */}
          <Route path="/driver-management/Driver_profile/:id" element={<Driver_mange_DrProfile />} />
          <Route path="/driver-management/vehicle_information" element={<Driver_mange_vehicle_info />} />
          <Route path="/driver-management/attachments" element={<Driver_manage_attachment />} />
          <Route path="/driver-management/logs" element={<Driver_mange_logs />} />
          <Route path="/adddriverform" element={<AddDriverForm />} />

          {/* Vehicle Details */}
          <Route path="/vehicles/:id" element={<VehicleProfile />} />
          <Route path="/vehicles/:id/edit" element={<VehicleEdit />} />
          <Route path="/vehicleapprovel" element={<PendingApprovalTabContent />} />

          {/* HR & Attendance */}
          <Route path="/AttendanceDashboard" element={<AttendanceDashboard />} />
          <Route path="/HRDashboard" element={<HRDashboard />} />
          <Route path="/warningletter" element={<WarningLetters />} />
          <Route path="/terminationletter" element={<TerminationManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
