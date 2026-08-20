from rest_framework.routers import DefaultRouter
from .views import SectorViewSet

router = DefaultRouter()
router.register(r'sectors', SectorViewSet, basename='sector')

urlpatterns = router.urls
