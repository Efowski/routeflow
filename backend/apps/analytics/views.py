from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import ClimberAscent
from .serializers import ClimberAscentSerializer
from apps.accounts.permissions import IsGymManagerOrHeadSetter

class ClimberAscentViewSet(viewsets.ModelViewSet):
     
    serializer_class = ClimberAscentSerializer
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]


        return [IsGymManagerOrHeadSetter()]
    filterset_fields = ['route', 'rating', 'perceived_grade']
    search_fields = ['climber_name', 'comment', 'route__name']


    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return ClimberAscent.objects.none()

        return ClimberAscent.objects.filter(
            route__sector__gym=user.gym
        ).select_related('route')

    @action(detail=False, methods=['get'])
    def route_stats(self, request):
        """Zwraca statystyki popularności i wycen per droga."""
        stats = self.get_queryset().values(
        'route__id',
        'route__name',
        'route__grade'
    ).annotate(
        avg_rating=Avg('rating'),
        total_ascents=Count('id')
    ).order_by('-total_ascents')
          
        
        return Response(stats)
