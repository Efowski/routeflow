from rest_framework import viewsets 
from .models import Sector
from .serializers import SectorSerializer

from apps.accounts.permissions import IsGymManagerOrReadOnly

class SectorViewSet(viewsets.ModelViewSet):
     
    serializer_class = SectorSerializer
    permission_classes = [IsGymManagerOrReadOnly]
    search_fields = ['name', 'sector_type']
    ordering_fields = ['name', 'last_reset_date']

    def get_queryset(self):
        return Sector.objects.filter(gym=self.request.user.gym)

    def perform_create(self, serializer):
        serializer.save(gym=self.request.user.gym)