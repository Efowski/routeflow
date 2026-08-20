from rest_framework import serializers
from .models import Sector

class SectorSerializer(serializers.ModelSerializer):
    active_routes_count = serializers.SerializerMethodField()

    class Meta:
        model = Sector
        fields = [
            'id',
            'name',
            'sector_type',
            'max_capacity',
            'color_code',
            'target_rotation_days',
            'last_reset_date',
            'next_scheduled_reset',
            'active_routes_count',
        ]

    def get_active_routes_count(self, obj):
        if hasattr(obj, 'routes'):
            return obj.routes.filter(status='active').count()
        return 0
