from rest_framework import viewsets, permissions
from .models import Sector
from .serializers import SectorSerializer

class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ['name', 'sector_type']
    ordering_fields = ['name', 'last_reset_date']
