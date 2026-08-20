from django.contrib import admin
from .models import Route

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'route_type', 'grade', 'sector', 'setter_name', 'status', 'date_set')
    list_filter = ('status', 'route_type', 'sector')
    search_fields = ('name', 'setter_name', 'grade')
