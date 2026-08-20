from rest_framework.routers import DefaultRouter
from .views import (
    SetterProfileViewSet,
    SettingSessionViewSet,
    SetterTaskViewSet,
    ResetHistoryLogViewSet
)

router = DefaultRouter()
router.register(r'setters', SetterProfileViewSet, basename='setter')
router.register(r'sessions', SettingSessionViewSet, basename='session')
router.register(r'tasks', SetterTaskViewSet, basename='task')
router.register(r'logs', ResetHistoryLogViewSet, basename='log')

urlpatterns = router.urls
