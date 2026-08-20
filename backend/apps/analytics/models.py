import uuid
from django.db import models
from apps.routes.models import Route

class ClimberAscent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='ascents', verbose_name="Droga")
    climber_name = models.CharField(max_length=100, default="Anonimowy Wspinacz", verbose_name="Wspinacz")
    rating = models.PositiveSmallIntegerField(default=5, help_text="Ocena jakości 1-5 gwiazdek")
    perceived_grade = models.CharField(max_length=10, help_text="Grade zdaniem wspinacza")
    comment = models.TextField(blank=True, verbose_name="Komentarz / Feedback dla settera")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data przejścia")

    class Meta:
        verbose_name = "Przejście i Ocena Drogi"
        verbose_name_plural = "Przejścia i Analityka Popularności"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.climber_name} - {self.route.name} ({self.rating}★)"
