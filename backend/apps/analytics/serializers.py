from rest_framework import serializers
from .models import ClimberAscent

class ClimberAscentSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source='route.name', read_only=True)
    official_grade = serializers.CharField(source='route.grade', read_only=True)

    class Meta:
        model = ClimberAscent
        fields = [
            'id',
            'route',
            'route_name',
            'official_grade',
            'climber_name',
            'rating',
            'perceived_grade',
            'comment',
            'created_at',
        ]
