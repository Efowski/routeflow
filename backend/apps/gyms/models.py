import uuid
from django.db import models


class Gym(models.Model):
    name = models.CharField(max_length=150)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

class SectorType(models.TextChoices):
    BOULDERING = 'bouldering', 'Bouldering'
    ROPE_WALL = 'rope_wall', 'Ściana Linowa'
    TRAINING = 'training', 'Strefa Treningowa'

class Sector(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120, verbose_name="Nazwa sektora")
    sector_type = models.CharField(
        max_length=20,
        choices=SectorType.choices,
        default=SectorType.BOULDERING,
        verbose_name="Typ sektora"
    )
    max_capacity = models.PositiveIntegerField(
        default=20,
        help_text="Maksymalna optymalna pojemność dróg/baldów"
    )
    color_code = models.CharField(
        max_length=7,
        default="#3b82f6",
        help_text="Kod HEX koloru oznaczającego sektor"
    )
    target_rotation_days = models.PositiveIntegerField(
        default=45,
        help_text="Docelowy okres rotacji sektora w dniach"
    )
    last_reset_date = models.DateField(null=True, blank=True, verbose_name="Ostatni reset")
    next_scheduled_reset = models.DateField(null=True, blank=True, verbose_name="Zaplanowany reset")

    class Meta:
        verbose_name = "Sektor"
        verbose_name_plural = "Sektory"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_sector_type_display()})"
