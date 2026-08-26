import re
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
            'setter',
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

    def validate_sector(self, sector):
        request = self.context.get('request')

        if request and sector.gym != request.user.gym:
            raise serializers.ValidationError(
            'Sector must belong to your gym.'
        )

        return sector

    def validate_setter(self, setter):
        request = self.context.get('request')
        if request and setter.user.gym != request.user.gym:
            raise serializers.ValidationError(
            'Setter must belong to your gym.'
        )
        return setter
    

    def validate_grade(self, value):
        pattern = r'^[3-9][ABCabc]?\+?$'

        if not re.fullmatch(pattern, value):
            raise serializers.ValidationError(
                'Podaj poprawną wycenę francuską, np. 6A, 6C+, 7B+.'
            )

        return value.upper()

    def validate_v_grade(self, value):
        if not value:
            return value

        pattern = r'^V([0-9]|1[0-7])$'

        if not re.fullmatch(pattern, value.upper()):
            raise serializers.ValidationError(
                'Podaj poprawną wycenę V-Grade, np. V3, V7.'
            )

        return value.upper()

        