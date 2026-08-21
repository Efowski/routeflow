from django.contrib import admin
from .models import Sector, Gym


@admin.register(Gym)

class GymAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('name', 'sector_type', 'max_capacity', 'target_rotation_days', 'last_reset_date', 'next_scheduled_reset')
    list_filter = ('sector_type',)
    search_fields = ('name',)


