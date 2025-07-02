from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from functools import wraps
from django.http import JsonResponse


class IsAdminUser(BasePermission):
    """
    Permission class that allows access only to admin users.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsHRUser(BasePermission):
    """
    Permission class that allows access only to HR users.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'hr']
        )


class IsDriverUser(BasePermission):
    """
    Permission class that allows access only to driver users.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'driver'
        )


class IsStaffUser(BasePermission):
    """
    Permission class that allows access only to staff users.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'hr', 'staff']
        )


class IsAccountantUser(BasePermission):
    """
    Permission class that allows access only to accountant users.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'accountant']
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Permission class that allows owners of an object to edit it.
    Read permissions are allowed to any authenticated user.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated
        
        # Write permissions only to the owner of the object
        return obj.created_by == request.user or request.user.role == 'admin'


class IsDriverOwnerOrHR(BasePermission):
    """
    Permission class for driver-related objects.
    Drivers can only access their own data, HR and Admin can access all.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin and HR can access everything
        if request.user.role in ['admin', 'hr']:
            return True
        
        # Drivers can only access their own data
        if request.user.role == 'driver':
            # Check if the object has a driver field that matches the user
            if hasattr(obj, 'driver') and hasattr(obj.driver, 'user'):
                return obj.driver.user == request.user
            elif hasattr(obj, 'user'):
                return obj.user == request.user
        
        return False


class RoleBasedPermission(BasePermission):
    """
    Generic role-based permission class.
    Usage: RoleBasedPermission(['admin', 'hr'])
    """
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in self.allowed_roles
        )


# Decorator functions for view-based permissions
def admin_required(view_func):
    """
    Decorator that requires admin role for the view.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if request.user.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        return view_func(request, *args, **kwargs)
    return wrapper


def hr_required(view_func):
    """
    Decorator that requires HR or admin role for the view.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if request.user.role not in ['admin', 'hr']:
            return JsonResponse({'error': 'HR access required'}, status=403)
        
        return view_func(request, *args, **kwargs)
    return wrapper


def staff_required(view_func):
    """
    Decorator that requires staff, HR, or admin role for the view.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if request.user.role not in ['admin', 'hr', 'staff']:
            return JsonResponse({'error': 'Staff access required'}, status=403)
        
        return view_func(request, *args, **kwargs)
    return wrapper


def accountant_required(view_func):
    """
    Decorator that requires accountant or admin role for the view.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if request.user.role not in ['admin', 'accountant']:
            return JsonResponse({'error': 'Accountant access required'}, status=403)
        
        return view_func(request, *args, **kwargs)
    return wrapper


def role_required(allowed_roles):
    """
    Decorator factory that creates a decorator for specific roles.
    Usage: @role_required(['admin', 'hr'])
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({'error': 'Authentication required'}, status=401)
            
            if request.user.role not in allowed_roles:
                return JsonResponse({
                    'error': f'Access denied. Required roles: {", ".join(allowed_roles)}'
                }, status=403)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


# Permission checking utilities
def has_permission(user, required_role):
    """
    Utility function to check if user has required role.
    """
    if not user or not user.is_authenticated:
        return False
    
    role_hierarchy = {
        'admin': ['admin', 'hr', 'staff', 'driver', 'accountant'],
        'hr': ['hr', 'staff', 'driver'],
        'accountant': ['accountant'],
        'staff': ['staff'],
        'driver': ['driver']
    }
    
    user_permissions = role_hierarchy.get(user.role, [])
    return required_role in user_permissions


def can_access_driver_data(user, driver_user):
    """
    Check if user can access specific driver's data.
    """
    if user.role in ['admin', 'hr']:
        return True
    
    if user.role == 'driver' and user == driver_user:
        return True
    
    return False


def can_modify_financial_data(user):
    """
    Check if user can modify financial/accounting data.
    """
    return user.role in ['admin', 'accountant']


def can_view_financial_data(user):
    """
    Check if user can view financial/accounting data.
    """
    return user.role in ['admin', 'accountant', 'hr']


def get_user_accessible_companies(user):
    """
    Get list of companies the user can access based on their role.
    """
    if user.role == 'admin':
        # Admin can access all companies
        from company.models import Company
        return Company.objects.all()
    
    elif user.role in ['hr', 'staff']:
        # HR and staff can access companies they're assigned to
        # This would need to be implemented based on your company assignment logic
        return []
    
    elif user.role == 'driver':
        # Drivers can only access their assigned company
        if hasattr(user, 'driver_profile'):
            return [user.driver_profile.company] if user.driver_profile.company else []
        return []
    
    return []


def get_user_accessible_drivers(user):
    """
    Get list of drivers the user can access based on their role.
    """
    if user.role == 'admin':
        # Admin can access all drivers
        from drivers.models import Driver
        return Driver.objects.all()
    
    elif user.role == 'hr':
        # HR can access drivers in their companies
        companies = get_user_accessible_companies(user)
        from drivers.models import Driver
        return Driver.objects.filter(company__in=companies)
    
    elif user.role == 'driver':
        # Drivers can only access their own profile
        if hasattr(user, 'driver_profile'):
            return [user.driver_profile]
        return []
    
    return []
