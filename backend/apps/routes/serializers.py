from rest_framework import serializers
from .models import Route

class RouteSerializer(serializers.ModelSerializer):
    age_days = serializers.ReadOnlyField(source='age_in_days')
    is_expired = serializers.ReadOnlyField()
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    rating_average = serializers.SerializerMethodField()
    ascent_count = serializers.SerializerMethodField()

    class Meta:
        model = Route
        fields = [
            'id',
            'name',
            'route_type',
            'grade',
            'v_grade',
            'sector',
            'sector_name',
            'wall_line_number',
            'hold_color',
            'setter_name',
            'date_set',
            'status',
            'description',
            'qr_code',
            'age_days',
            'is_expired',
            'rating_average',
            'ascent_count',
        ]

    def get_rating_average(self, obj):
        if hasattr(obj, 'ascents') and obj.ascents.exists():
            ratings = [a.rating for a in obj.ascents.all()]
            return round(sum(ratings) / len(ratings), 1)
        return 5.0

    def get_ascent_count(self, obj):
        if hasattr(obj, 'ascents'):
            return obj.ascents.count()
        return 0
