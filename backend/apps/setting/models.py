import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError


from django.contrib.auth.models import User
from apps.gyms.models import Sector
 


class SetterProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='setter_profile')
    role = models.CharField(max_length=50, default='Head Route Setter')
    specialties = models.CharField(max_length=255, help_text="np. Dachy, Połogi, Dyno")
    avatar_url = models.URLField(blank=True, default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80")

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.role})"

class SettingSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150, verbose_name="Tytuł sesji resetowej")
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, related_name='setting_sessions')
    scheduled_date = models.DateField(verbose_name="Planowana data")
    status = models.CharField(
        max_length=20,
        choices=[
            ('planned', 'Zaplanowana'),
            ('in_progress', 'W trakcie'),
            ('completed', 'Zakończona')
        ],
        default='planned'
    )
    lead_setter = models.ForeignKey(
        SetterProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='led_sessions'
    )
    target_route_count = models.PositiveIntegerField(default=0, verbose_name='Docelowa liczba dróg')
    target_grade_breakdown = models.JSONField(
    default=dict,
    blank=True,
    verbose_name="Planowany rozkład wycen",
        )
    notes = models.TextField(blank=True, verbose_name="Wskazówki i koncepcja")


    def clean(self):
        super().clean()
        if self.lead_setter and self.sector:
            if self.lead_setter.user.gym != self.sector.gym:
                raise ValidationError({
                    'lead_setter': ('Lead setter must belong to the same gym '
                        'as the setting session.')
                })

 
    def __str__(self):
        return f"{self.title} - {self.sector.name} ({self.scheduled_date})"

    

class SetterTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        SettingSession,
        on_delete=models.CASCADE,
        related_name='tasks' 
        
    )
    setter = models.ForeignKey(SetterProfile, on_delete=models.CASCADE, related_name='assigned_tasks')
    title = models.CharField(max_length=120, verbose_name="Zadanie / Prototyp")
    target_grade = models.CharField(max_length=10, verbose_name="Docelowa wycena")
    hold_color = models.CharField(max_length=20, verbose_name="Kolor chwytów")
    created_route = models.OneToOneField('routes.Route', on_delete=models.SET_NULL, blank=True, null=True, related_name='source_task')
    route_type = models.CharField(max_length=20, choices=[
        ('boulder', 'Boulder'),
        ('rope', 'Rope'),
    ],
    default='boulder',)
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT, null=True, blank=True, related_name='setter_tasks' )
    sector_name = models.CharField(max_length=100, default="Sektor Główny")
    status = models.CharField(
        max_length=20,
        choices=[
            ('todo', 'Do kręcenia'),
            ('in_progress', 'W trakcie'),
            ('testing', 'Forsovanie / Testy'),
            ('done', 'Gotowe')
        ],
        default='todo'
    )
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True, verbose_name="Termin wykonania")
    created_at = models.DateField(auto_now_add=True, verbose_name="Data utworzenia")


    def clean(self):
        super().clean()

        if self.session_id and self.setter_id:
            if self.setter.user.gym != self.session.sector.gym:
                raise ValidationError({
                    'setter': (
                    'Setter must belong to the same gym '
                    'as the setting session.'
                )
                })

    def __str__(self):
        return f"{self.title} ({self.target_grade}) - {self.setter.user.username}"

class ResetHistoryLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(default=timezone.now, verbose_name="Data resetu")
    session = models.ForeignKey(SettingSession, on_delete=models.PROTECT, related_name='reset_history_logs')
    sector_name = models.CharField(max_length=120, verbose_name="Sektor")
    lead_setter_name = models.CharField(max_length=120, verbose_name="Szef resetu")
    routes_stripped = models.PositiveIntegerField(verbose_name="Odkręcone drogi")
    routes_set = models.PositiveIntegerField(verbose_name="Nakręcone nowe drogi")
    notes = models.TextField(blank=True, verbose_name="Notatki i uwagi")

    class Meta:
        verbose_name = "Log Resetu"
        verbose_name_plural = "Historia Wymian Dróg"
        ordering = ['-date']
