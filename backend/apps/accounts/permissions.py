from rest_framework import permissions


class IsGymManager(permissions.BasePermission):
    """
    Full access only for gym managers.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'gym_manager'
        )


class IsGymManagerOrHeadSetter(permissions.BasePermission):
    """
    Full access for gym managers and head setters.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ['gym_manager', 'head_setter']
        )


class IsGymStaffReadOnly(permissions.BasePermission):
    """
    Any authenticated gym user may read.
    Only gym managers and head setters may write.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.role in [
            'gym_manager',
            'head_setter',
        ]


class IsGymManagerOrReadOnly(permissions.BasePermission):
    """
    Any authenticated gym user may read.
    Only gym managers may write.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.role == 'gym_manager'


class IsGymManagerHeadSetterOrOwnTask(permissions.BasePermission):
    """
    Gym managers and head setters have full access.

    Route setters may read and update only their own tasks,
    but cannot create or delete tasks.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role in ['gym_manager', 'head_setter']:
            return True

        if request.user.role == 'route_setter':
            return request.method in ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST']

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role in ['gym_manager', 'head_setter']:
            return True

        if request.user.role == 'route_setter':
            return obj.setter.user_id == request.user.id

        return False


class IsGymManagerOrHeadSetterReadOnly(permissions.BasePermission):
    """
    Gym managers have full access.
    Head setters may read.
    Route setters have no access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role == 'gym_manager':
            return True

        if request.user.role == 'head_setter':
            return request.method in permissions.SAFE_METHODS

        return False