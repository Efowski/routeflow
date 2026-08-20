from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import ClimberAscent
from .serializers import ClimberAscentSerializer

class ClimberAscentViewSet(viewsets.ModelViewSet):
    queryset = ClimberAscent.objects.all().select_related('route')
    serializer_class = ClimberAscentSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['route', 'rating', 'perceived_grade']
    search_fields = ['climber_name', 'comment', 'route__name']

    @action(detail=False, methods=['get'])
    def route_stats(self, request):
        """Zwraca statystyki popularności i wycen per droga."""
        stats = ClimberAscent.objects.values(
            'route__id',
            'route__name',
            'route__grade'
        ).annotate(
            avg_rating=Avg('rating'),
            total_ascents=Count('id')
        ).order_by('-total_ascents')
        
        return Response(stats)
