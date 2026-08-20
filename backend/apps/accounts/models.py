import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    GYM_MANAGER = 'gym_manager', 'Manager Obiektu'
    HEAD_SETTER = 'head_setter', 'Główny Setter'
    ROUTE_SETTER = 'route_setter', 'Route Setter'

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name="Adres E-mail")
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.GYM_MANAGER)
    gym_name = models.CharField(max_length=150, default="VertiGym Warszawska", verbose_name="Nazwa Ściany")
    phone = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = "Użytkownik / Zarządca"
        verbose_name_plural = "Użytkownicy i Zarządcy"

    def __str__(self):
        return f"{self.get_full_name() or self.email} ({self.get_role_display()})"
