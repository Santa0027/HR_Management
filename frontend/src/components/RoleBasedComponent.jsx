import React from 'react';
import { useAuth } from '../context/AuthContext';

const RoleBasedComponent = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [], 
  fallback = null 
}) => {
  const { user, hasRole, hasPermission } = useAuth();

  if (!user) {
    return fallback;
  }

  // Check if user has any of the required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return fallback;
    }
  }

  // Check if user has any of the required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission));
    if (!hasRequiredPermission) {
      return fallback;
    }
  }

  return children;
};

export default RoleBasedComponent;
