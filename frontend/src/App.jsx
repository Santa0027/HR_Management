import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DriverManagement from './pages/Drivermanagement';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AddDriverForm from './pages/AddDriverForm';
import './App.css'
import Reg_ma_new_request from './pages/Reg-ma_new_request';
import Reg_ma_aprovel from './pages/Reg_ma_aprovel';
import Driver_mange_DrProfile from './pages/Driver_mange_DrProfile';
import Driver_mange_vehicle_info from './pages/Driver_mange_vehicle_info';
import Driver_manage_attachment from './pages/Driver_manage_attachment';
import Driver_mange_logs from './pages/Driver_mange_logs';
import Reg_ma_vehicle_registration from './pages/Reg_ma_vehicle_registration';
import Reg_ma_vehicle_list from './pages/Reg_ma_vehicle_list';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes inside Layout */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DriverManagement />} />
          <Route path="/registration-management" element={<Reg_ma_new_request />} />
          <Route path="/registration-management/aproval_status" element={<Reg_ma_aprovel />} />
          <Route path="/driver-management/Driver_profile" element={<Driver_mange_DrProfile />} />
          <Route path="/driver-management/vehicle_information" element={<Driver_mange_vehicle_info />} />
          <Route path="/driver-management/attachments" element={<Driver_manage_attachment />} />
          <Route path="/driver-management/logs" element={<Driver_mange_logs />} />
          <Route path="/vehicle-registration" element={<Reg_ma_vehicle_registration />} />
          <Route path="/vehicle-list" element={<Reg_ma_vehicle_list />} />
          {/* Add more protected routes here */}
          <Route path='/adddriverform' element={<AddDriverForm />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
