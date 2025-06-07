from rest_framework import permissions

class AllowInactiveUsers(permissions.BasePermission):
    """
    Custom permission to allow inactive users to access the API.
    """

    def has_permission(self, request, view):
        # Allow access to all users, including inactive ones
        return True


class UserJoinedAudience(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_joined
