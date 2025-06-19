import React from 'react';
import { Navigate } from 'react-router-dom';


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');

  // If token is missing, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, allow access to children
  return children;
};

export default ProtectedRoute;
