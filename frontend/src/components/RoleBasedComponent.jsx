import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Component that conditionally renders children based on user roles and permissions
 */
const RoleBasedComponent = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [], 
  fallback = null,
  requireAll = false // If true, user must have ALL roles/permissions, not just one
}) => {
  const { user, canAccess, hasAnyRole, hasPermission } = useAuth();

  if (!user) {
    return fallback;
  }

  // Check roles
  if (requiredRoles.length > 0) {
    if (requireAll) {
      // User must have ALL required roles
      const hasAllRoles = requiredRoles.every(role => user.role === role);
      if (!hasAllRoles) return fallback;
    } else {
      // User must have at least ONE required role
      if (!hasAnyRole(requiredRoles)) return fallback;
    }
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    if (requireAll) {
      // User must have ALL required permissions
      const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
      if (!hasAllPermissions) return fallback;
    } else {
      // User must have at least ONE required permission
      const hasAnyPermission = requiredPermissions.some(permission => hasPermission(permission));
      if (!hasAnyPermission) return fallback;
    }
  }

  return children;
};

/**
 * Higher-order component for role-based rendering
 */
export const withRoleAccess = (WrappedComponent, requiredRoles = [], requiredPermissions = []) => {
  return function RoleProtectedComponent(props) {
    return (
      <RoleBasedComponent 
        requiredRoles={requiredRoles} 
        requiredPermissions={requiredPermissions}
        fallback={
          <div className="text-center p-4">
            <p className="text-gray-600">You don't have permission to view this content.</p>
          </div>
        }
      >
        <WrappedComponent {...props} />
      </RoleBasedComponent>
    );
  };
};

/**
 * Specific role-based components for common use cases
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredRoles={['admin']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const HROnly = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredRoles={['admin', 'hr']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const AccountantOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredRoles={['admin', 'accountant']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const DriverOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredRoles={['driver']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const ManagementOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredRoles={['admin', 'management']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const StaffOnly = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredRoles={['admin', 'hr', 'staff']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

/**
 * Permission-based components
 */
export const CanManageUsers = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredPermissions={['can_manage_users']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const CanManageDrivers = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredPermissions={['can_manage_drivers']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const CanViewDrivers = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredPermissions={['can_view_drivers']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const CanManageAccounting = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredPermissions={['can_manage_accounting']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const CanViewAccounting = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredPermissions={['can_view_accounting']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const CanApproveExpenses = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredPermissions={['can_approve_expenses']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const CanGenerateReports = ({ children, fallback = null }) => (
  <RoleBasedComponent requiredPermissions={['can_generate_reports']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

/**
 * Hook for conditional rendering in components
 */
export const useRoleAccess = () => {
  const { user, hasRole, hasAnyRole, hasPermission, canAccess } = useAuth();

  return {
    user,
    hasRole,
    hasAnyRole,
    hasPermission,
    canAccess,
    isAdmin: () => hasRole('admin'),
    isHR: () => hasAnyRole(['admin', 'hr']),
    isAccountant: () => hasAnyRole(['admin', 'accountant']),
    isDriver: () => hasRole('driver'),
    isManagement: () => hasAnyRole(['admin', 'management']),
    isStaff: () => hasAnyRole(['admin', 'hr', 'staff']),
  };
};

export default RoleBasedComponent;
