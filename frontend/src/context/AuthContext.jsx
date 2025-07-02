// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is still authenticated on app load
    try {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        // Clear any stale data
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    try {
      // Store user data and tokens
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("access_token", userData.access || userData.token);
      localStorage.setItem("refresh_token", userData.refresh);
      setUser(userData);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all stored data
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user || !role) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user || !roles || !Array.isArray(roles)) return false;
    return roles.includes(user.role);
  };

  const hasPermission = (permission) => {
    if (!user || !permission || !user.permissions) return false;
    return user.permissions[permission] === true;
  };

  const canAccess = (requiredRoles = [], requiredPermissions = []) => {
    if (!user) return false;

    // Check roles
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return false;
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      return requiredPermissions.some(permission => hasPermission(permission));
    }

    return true;
  };

  const isAdmin = () => {
    try {
      return hasRole('admin');
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  const isHR = () => {
    try {
      return hasAnyRole(['admin', 'hr']);
    } catch (error) {
      console.error('Error checking HR role:', error);
      return false;
    }
  };

  const isAccountant = () => {
    try {
      return hasAnyRole(['admin', 'accountant']);
    } catch (error) {
      console.error('Error checking accountant role:', error);
      return false;
    }
  };

  const isDriver = () => {
    try {
      return hasRole('driver');
    } catch (error) {
      console.error('Error checking driver role:', error);
      return false;
    }
  };

  const isManagement = () => {
    try {
      return hasAnyRole(['admin', 'management']);
    } catch (error) {
      console.error('Error checking management role:', error);
      return false;
    }
  };

  const isStaff = () => {
    try {
      return hasAnyRole(['admin', 'hr', 'staff']);
    } catch (error) {
      console.error('Error checking staff role:', error);
      return false;
    }
  };

  // Role-based access helpers
  const canManageUsers = () => hasPermission('can_manage_users');
  const canManageDrivers = () => hasPermission('can_manage_drivers');
  const canViewDrivers = () => hasPermission('can_view_drivers');
  const canManageCompanies = () => hasPermission('can_manage_companies');
  const canViewCompanies = () => hasPermission('can_view_companies');
  const canManageVehicles = () => hasPermission('can_manage_vehicles');
  const canViewVehicles = () => hasPermission('can_view_vehicles');
  const canManageAttendance = () => hasPermission('can_manage_attendance');
  const canViewAttendance = () => hasPermission('can_view_attendance');
  const canManageHR = () => hasPermission('can_manage_hr');
  const canViewHR = () => hasPermission('can_view_hr');
  const canManageAccounting = () => hasPermission('can_manage_accounting');
  const canViewAccounting = () => hasPermission('can_view_accounting');
  const canManagePayroll = () => hasPermission('can_manage_payroll');
  const canViewPayroll = () => hasPermission('can_view_payroll');
  const canGenerateReports = () => hasPermission('can_generate_reports');
  const canApproveExpenses = () => hasPermission('can_approve_expenses');

  const value = {
    user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    hasPermission,
    canAccess,
    isAdmin,
    isHR,
    isAccountant,
    isDriver,
    isManagement,
    isStaff,
    canManageUsers,
    canManageDrivers,
    canViewDrivers,
    canManageCompanies,
    canViewCompanies,
    canManageVehicles,
    canViewVehicles,
    canManageAttendance,
    canViewAttendance,
    canManageHR,
    canViewHR,
    canManageAccounting,
    canViewAccounting,
    canManagePayroll,
    canViewPayroll,
    canGenerateReports,
    canApproveExpenses,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
    // Return a fallback context instead of throwing
    return {
      user: null,
      isLoading: false,
      login: () => {},
      logout: () => {},
      hasRole: () => false,
      hasAnyRole: () => false,
      hasPermission: () => false,
      canAccess: () => false,
      isAdmin: () => false,
      isHR: () => false,
      isAccountant: () => false,
      isDriver: () => false,
      isManagement: () => false,
      isStaff: () => false,
      canManageUsers: () => false,
      canManageDrivers: () => false,
      canViewDrivers: () => false,
      canManageCompanies: () => false,
      canViewCompanies: () => false,
      canManageVehicles: () => false,
      canViewVehicles: () => false,
      canManageAttendance: () => false,
      canViewAttendance: () => false,
      canManageHR: () => false,
      canViewHR: () => false,
      canManageAccounting: () => false,
      canViewAccounting: () => false,
      canManagePayroll: () => false,
      canViewPayroll: () => false,
      canGenerateReports: () => false,
      canApproveExpenses: () => false,
    };
  }
  return context;
};
