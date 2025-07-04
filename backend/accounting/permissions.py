# my_app/permissions.py (Replace 'my_app' with the actual name of your Django app)
from rest_framework import permissions

class IsAdminOrAccountantOrManagement(permissions.BasePermission):
    """
    Custom permission to allow access only to users who are:
    - Django staff (is_staff=True, often used for admin)
    - Have an 'is_accountant' custom field set to True
    - Have an 'is_management' custom field set to True

    This permission assumes your custom User model (or a profile linked to it)
    has boolean fields named 'is_accountant' and 'is_management'.
    Adjust the checks (e.g., `request.user.is_accountant`) if your role
    logic is implemented differently (e.g., through groups or a separate role model).
    """

    def has_permission(self, request, view):
        """
        Check if the user has permission to access the view.
        """
        # Ensure the user is authenticated first
        if not request.user.is_authenticated:
            return False

        # Check if the authenticated user has any of the required roles
        # You need to ensure these attributes (is_staff, is_accountant, is_management)
        # exist on your User model.
        # For 'is_staff', it's a built-in Django User attribute.
        # For 'is_accountant' and 'is_management', these are custom attributes
        # you would add to your custom User model or a related profile model.
        return (request.user.is_staff or
                getattr(request.user, 'is_accountant', False) or
                getattr(request.user, 'is_management', False))

    # If you need object-level permissions (e.g., only an admin can delete *any* income,
    # but a user can only edit *their own* income), you would implement has_object_permission.
    # For a general access control like "admin/accountant/management can access bank accounts",
    # has_permission is usually sufficient.
    # def has_object_permission(self, request, view, obj):
    #     """
    #     Check if the user has permission to interact with a specific object.
    #     """
    #     # Example: Allow read-only for anyone with permission, but only owner can edit/delete
    #     if request.method in permissions.SAFE_METHODS:
    #         return True
    #     # For this specific permission, we might just defer to has_permission
    #     # or add more granular object-level checks if needed.
    #     return self.has_permission(request, view)
