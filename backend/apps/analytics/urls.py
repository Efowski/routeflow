from rest_framework.routers import DefaultRouter
from .views import ClimberAscentViewSet

router = DefaultRouter()
router.register(r'ascents', ClimberAscentViewSet, basename='ascent')

urlpatterns = router.urls
