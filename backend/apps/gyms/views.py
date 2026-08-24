from rest_framework import viewsets, permissions
from .models import Sector
from .serializers import SectorSerializer

class SectorViewSet(viewsets.ModelViewSet):
     
    serializer_class = SectorSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'sector_type']
    ordering_fields = ['name', 'last_reset_date']

    def get_queryset(self):
        return Sector.objects.filter(gym=self.request.user.gym)

    def perform_create(self, serializer):
        serializer.save(gym=self.request.user.gym)