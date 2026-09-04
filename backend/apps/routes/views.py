from rest_framework import viewsets, status 
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Route
from .serializers import RouteSerializer
from apps.accounts.permissions import IsGymStaffReadOnly



class RouteViewSet(viewsets.ModelViewSet):
    
    serializer_class = RouteSerializer
    permission_classes = [IsGymStaffReadOnly]
    filterset_fields = ['sector', 'route_type', 'status', 'grade', 'hold_color']
    search_fields = ['name', 'setter_name', 'description']
    ordering_fields = ['date_set', 'grade', 'name']
    def get_queryset(self):
        return Route.objects.filter(
        sector__gym=self.request.user.gym
    ).select_related('sector')

    @action(detail=True, methods=['post'])
    def retire(self, request, pk=None):
        """Oznacza drogę jako zdemontowaną / retired."""
        route = self.get_object()
        route.status = 'deprecated'
        route.save()
        return Response({'status': 'Droga została pomyślnie zdemontowana'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Zwraca listę przeterminowanych dróg wymagających wymiany."""
        routes = [r for r in self.get_queryset().filter(status='active') if r.is_expired]
        serializer = self.get_serializer(routes, many=True)
        return Response(serializer.data)
