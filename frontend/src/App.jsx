import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DriverManagement from './pages/Drivermanagement';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'
import Reg_ma_new_request from './pages/Reg-ma_new_request';
import Reg_ma_aprovel from './pages/Reg_ma_aprovel';

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
          <Route path="/registration-management/aproval_status" element={<Reg_ma_aprovel/>} />
          {/* Add more protected routes here */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
