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
    
    serializer_class = SettingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['sector', 'status', 'scheduled_date']

    def get_queryset(self):
        user = self.request.user

        return SettingSession.objects.filter(sector__gym=user.gym).select_related('sector', 'lead_setter__user')

class SetterTaskViewSet(viewsets.ModelViewSet):
     
    serializer_class = SetterTaskSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['status', 'setter', 'session']

    def get_queryset(self):
        user = self.request.user

        return SetterTask.objects.filter(session__sector__gym=user.gym).select_related('setter__user', 'session'


                                                                                       )
class ResetHistoryLogViewSet(viewsets.ModelViewSet):
     
    serializer_class = ResetHistoryLogSerializer
    permission_classes = [permissions.AllowAny]
    ordering_fields = ['date']

    def get_queryset(self):
        user = self.request.user

        return ResetHistoryLog.objects.filter(session__sector__gym=user.gym) 

