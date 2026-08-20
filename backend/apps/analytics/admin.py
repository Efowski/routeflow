from django.contrib import admin
from .models import ClimberAscent

@admin.register(ClimberAscent)
class ClimberAscentAdmin(admin.ModelAdmin):
    list_display = ('climber_name', 'route', 'rating', 'perceived_grade', 'created_at')
    list_filter = ('rating',)
    search_fields = ('climber_name', 'comment')
