from django.utils import timezone

from django.db import transaction
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from rest_framework import viewsets, permissions
from .models import SetterProfile, SettingSession, SetterTask, ResetHistoryLog
from .serializers import (
    SetterProfileSerializer,
    SettingSessionSerializer,
    SetterTaskSerializer,
    ResetHistoryLogSerializer
)
from apps.routes.models import Route
from apps.routes.serializers import RouteSerializer


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



    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        task = self.get_object()

        if task.created_route:
            return Response(
                {'detail': 'To zadanie zostało już opublikowane jako droga.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not task.sector:
            return Response(
                {'detail': 'To zadanie nie ma przypisanego sektora.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            route = Route.objects.create(
                name=task.title,
                route_type=task.route_type,
                grade=task.target_grade,
                sector=task.sector,
                hold_color=task.hold_color,
                setter=task.setter,
                date_set=timezone.now().date(),
                status='active',
                description=task.description,
            )

            

            task.created_route = route
            task.status = 'done'
            task.save(update_fields=['created_route', 'status'])

        return Response(
            {
                'task': SetterTaskSerializer(task).data,
                'route': RouteSerializer(route).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        user = self.request.user

        return SetterTask.objects.filter(session__sector__gym=user.gym).select_related('setter__user', 'session__sector')


                                                                                       
class ResetHistoryLogViewSet(viewsets.ModelViewSet):
     
    serializer_class = ResetHistoryLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ['date']

    def get_queryset(self):
        user = self.request.user

        return ResetHistoryLog.objects.filter(session__sector__gym=user.gym).select_related(
    'session__sector',
    'session__lead_setter__user',
)

