from rest_framework import viewsets, permissions
from .models import SetterProfile, SettingSession, SetterTask, ResetHistoryLog
from .serializers import (
    SetterProfileSerializer,
    SettingSessionSerializer,
    SetterTaskSerializer,
    ResetHistoryLogSerializer
)

class SetterProfileViewSet(viewsets.ModelViewSet):
    queryset = SetterProfile.objects.all().select_related('user')
    serializer_class = SetterProfileSerializer
    permission_classes = [permissions.AllowAny]

class SettingSessionViewSet(viewsets.ModelViewSet):
    queryset = SettingSession.objects.all().select_related('sector', 'lead_setter__user')
    serializer_class = SettingSessionSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['sector', 'status', 'scheduled_date']

class SetterTaskViewSet(viewsets.ModelViewSet):
    queryset = SetterTask.objects.all().select_related('setter__user', 'session')
    serializer_class = SetterTaskSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['status', 'setter', 'session']

class ResetHistoryLogViewSet(viewsets.ModelViewSet):
    queryset = ResetHistoryLog.objects.all()
    serializer_class = ResetHistoryLogSerializer
    permission_classes = [permissions.AllowAny]
    ordering_fields = ['date']
