from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('dj_rest_auth.urls')),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    
    # API endpoints for the SaaS domain applications
    path('api/v1/gyms/', include('apps.gyms.urls')),
    path('api/v1/routes/', include('apps.routes.urls')),
    path('api/v1/setting/', include('apps.setting.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
