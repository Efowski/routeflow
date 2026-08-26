from datetime import date
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.utils import timezone
from apps.gyms.models import Sector
from apps.setting.models import SetterProfile

class RouteType(models.TextChoices):
    BOULDER = 'boulder', 'Boulder'
    ROPE = 'rope', 'Lina'

class RouteStatus(models.TextChoices):
    ACTIVE = 'active', 'Aktywna'
    DEPRECATED = 'deprecated', 'Zdemontowana'

class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120, verbose_name="Nazwa / Tytuł drogi")
    route_type = models.CharField(
        max_length=10,
        choices=RouteType.choices,
        default=RouteType.BOULDER,
        verbose_name="Typ"
    )
    grade = models.CharField(max_length=10, help_text="Wycena francuska np. 6A, 7B+")
    v_grade = models.CharField(max_length=10, blank=True, null=True, help_text="Wycena V-Grade np. V3, V7")
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, related_name='routes', verbose_name="Sektor")
    wall_line_number = models.PositiveIntegerField(null=True, blank=True, verbose_name="Numer linii / stanowiska")
    hold_color = models.CharField(max_length=30, verbose_name="Kolor chwytów")
    setter = models.ForeignKey(SetterProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='routes')
    setter_name = models.CharField(max_length=100, default="Główny Setter", verbose_name="Autor / Setter")
    date_set = models.DateField(default=date.today, verbose_name="Data nakręcenia")
    status = models.CharField(
        max_length=20,
        choices=RouteStatus.choices,
        default=RouteStatus.ACTIVE,
        verbose_name="Status"
    )
    description = models.TextField(blank=True, verbose_name="Opis i charakterystyka")
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True, verbose_name="Kod QR")

    class Meta:
        verbose_name = "Droga / Boulder"
        verbose_name_plural = "Baza Dróg i Baldów"
        ordering = ['-date_set']

    def __str__(self):
        return f"{self.name} ({self.grade}) - {self.sector.name}"

    @property
    def age_in_days(self):
        if not self.date_set:
            return 0
        return (timezone.now().date() - self.date_set).days

    @property
    def is_expired(self):
        limit = 45 if self.route_type == RouteType.BOULDER else 90
        return self.age_in_days >= limit

    def generate_qr(self):
        qr_url = f"https://vertigym.app/r/{self.id}"
        img = qrcode.make(qr_url)
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        self.qr_code.save(f"qr_{self.id}.png", File(buffer), save=False)

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new or not self.qr_code:
            self.generate_qr()
            super().save(update_fields=['qr_code'])
