from rest_framework import viewsets, permissions
from .models import SetterProfile, SettingSession, SetterTask, ResetHistoryLog
from .serializers import (
    SetterProfileSerializer,
    SettingSessionSerializer,
    SetterTaskSerializer,
    ResetHistoryLogSerializer
)

class SetterProfileViewSet(viewsets.ModelViewSet):
    
    serializer_class = SetterProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SetterProfile.objects.filter(user__gym=self.request.user.gym).select_related('user')

class SettingSessionViewSet(viewsets.ModelViewSet):
    
    serializer_class = SettingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['sector', 'status', 'scheduled_date']

    def get_queryset(self):
        user = self.request.user

        return SettingSession.objects.filter(sector__gym=user.gym).select_related('sector', 'lead_setter__user')

class SetterTaskViewSet(viewsets.ModelViewSet):
     
    serializer_class = SetterTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'setter', 'session']

    def get_queryset(self):
        user = self.request.user

        return SetterTask.objects.filter(session__sector__gym=user.gym).select_related('setter__user', 'session__sector')


                                                                                       
class ResetHistoryLogViewSet(viewsets.ModelViewSet):
     
    serializer_class = ResetHistoryLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ['date']

    def get_queryset(self):
        user = self.request.user

        return ResetHistoryLog.objects.filter(session__sector__gym=user.gym).select_related('session__sector') 

