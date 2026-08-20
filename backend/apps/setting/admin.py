from django.contrib import admin
from .models import SetterProfile, SettingSession, SetterTask, ResetHistoryLog

@admin.register(SetterProfile)
class SetterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'specialties')
    search_fields = ('user__username', 'role')

@admin.register(SettingSession)
class SettingSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'sector', 'scheduled_date', 'status', 'lead_setter')
    list_filter = ('status', 'sector')

@admin.register(SetterTask)
class SetterTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'setter', 'target_grade', 'status', 'due_date', 'created_at')
    list_filter = ('status', 'setter')

@admin.register(ResetHistoryLog)
class ResetHistoryLogAdmin(admin.ModelAdmin):
    list_display = ('date', 'sector_name', 'lead_setter_name', 'routes_stripped', 'routes_set')
