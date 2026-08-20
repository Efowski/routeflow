export interface DjangoAppModule {
  id: string;
  name: string;
  folderName: string;
  badge: string;
  description: string;
  models: string;
  serializers: string;
  views: string;
  urls: string;
  admin: string;
}

export const DJANGO_SAAS_APPS: DjangoAppModule[] = [
  {
    id: 'gyms',
    name: '1. Gyms & Sectors (Infrastruktura Ściany)',
    folderName: 'apps/gyms',
    badge: 'Aplikacja 1',
    description: 'Zarządzanie obiektem, podziałem na sektory, liniami stanowiskowymi i konfiguracją retencji ścian.',
    models: `
# apps/gyms/models.py
import uuid
from django.db import models

class SectorType(models.TextChoices):
    BOULDERING = 'bouldering', 'Bouldering'
    ROPE_WALL = 'rope_wall', 'Ściana Linowa'
    TRAINING = 'training', 'Strefa Treningowa'

class Sector(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120, verbose_name="Nazwa sektora")
    sector_type = models.CharField(max_length=20, choices=SectorType.choices, default=SectorType.BOULDERING)
    max_capacity = models.PositiveIntegerField(default=20, help_text="Maksymalna pojemność dróg")
    color_code = models.CharField(max_length=7, default="#3b82f6", help_text="Kod HEX koloru oznaczenia")
    target_rotation_days = models.PositiveIntegerField(default=45, help_text="Co ile dni sektor ma być wymieniany")
    
    last_reset_date = models.DateField(null=True, blank=True)
    next_scheduled_reset = models.DateField(null=True, blank=True)

    class Meta:
      verbose_name = "Sektor"
      verbose_name_plural = "Sektory"

    def __str__(self):
        return f"{self.name} ({self.get_sector_type_display()})"
`,
    serializers: `
# apps/gyms/serializers.py
from rest_framework import serializers
from .models import Sector

class SectorSerializer(serializers.ModelSerializer):
    active_routes_count = serializers.IntegerField(source='routes.filter(status="active").count', read_only=True)

    class Meta:
        model = Sector
        fields = [
            'id', 'name', 'sector_type', 'max_capacity',
            'color_code', 'target_rotation_days', 'last_reset_date',
            'next_scheduled_reset', 'active_routes_count'
        ]
`,
    views: `
# apps/gyms/views.py
from rest_framework import viewsets
from .models import Sector
from .serializers import SectorSerializer

class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
`,
    urls: `
# apps/gyms/urls.py
from rest_framework.routers import DefaultRouter
from .views import SectorViewSet

router = DefaultRouter()
router.register(r'sectors', SectorViewSet, basename='sector')
urlpatterns = router.urls
`,
    admin: `
# apps/gyms/admin.py
from django.contrib import admin
from .models import Sector

@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('name', 'sector_type', 'max_capacity', 'target_rotation_days', 'last_reset_date', 'next_scheduled_reset')
    list_filter = ('sector_type',)
    search_fields = ('name',)
`,
  },
  {
    id: 'routes',
    name: '2. Routes & QR Engine (Baza Dróg & Etykiety)',
    folderName: 'apps/routes',
    badge: 'Aplikacja 2',
    description: 'Baza wszystkich dróg/baldów, automatyczny generator kodów QR, wyceny oraz śledzenie przeterminowania.',
    models: `
# apps/routes/models.py
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.utils import timezone
from apps.gyms.models import Sector

class RouteType(models.TextChoices):
    BOULDER = 'boulder', 'Boulder'
    ROPE = 'rope', 'Lina'

class RouteStatus(models.TextChoices):
    ACTIVE = 'active', 'Aktywna'
    DEPRECATED = 'deprecated', 'Zdemontowana'

class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    route_type = models.CharField(max_length=10, choices=RouteType.choices, default=RouteType.BOULDER)
    grade = models.CharField(max_length=10, help_text="np. 6A, 7B+")
    v_grade = models.CharField(max_length=10, blank=True, null=True)
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, related_name='routes')
    wall_line_number = models.PositiveIntegerField(null=True, blank=True)
    hold_color = models.CharField(max_length=20)
    setter_name = models.CharField(max_length=100, default="Główny Setter")
    date_set = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=RouteStatus.choices, default=RouteStatus.ACTIVE)
    description = models.TextField(blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)

    @property
    def age_in_days(self):
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
`,
    serializers: `
# apps/routes/serializers.py
from rest_framework import serializers
from .models import Route

class RouteSerializer(serializers.ModelSerializer):
    age_days = serializers.ReadOnlyField(source='age_in_days')
    is_expired = serializers.ReadOnlyField()
    sector_name = serializers.CharField(source='sector.name', read_only=True)

    class Meta:
        model = Route
        fields = '__all__'
`,
    views: `
# apps/routes/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Route
from .serializers import RouteSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all().select_related('sector')
    serializer_class = RouteSerializer

    @action(detail=True, methods=['post'])
    def retire(self, request, pk=None):
        route = self.get_object()
        route.status = 'deprecated'
        route.save()
        return Response({'status': 'Droga została zdemontowana'})
`,
    urls: `
# apps/routes/urls.py
from rest_framework.routers import DefaultRouter
from .views import RouteViewSet

router = DefaultRouter()
router.register(r'routes', RouteViewSet, basename='route')
urlpatterns = router.urls
`,
    admin: `
# apps/routes/admin.py
from django.contrib import admin
from .models import Route

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'route_type', 'grade', 'sector', 'setter_name', 'status', 'date_set')
    list_filter = ('status', 'route_type', 'sector')
    search_fields = ('name', 'setter_name', 'grade')
`,
  },
  {
    id: 'setting',
    name: '3. Setting & Work Tasks (Planowanie & Zadania)',
    folderName: 'apps/setting',
    badge: 'Aplikacja 3',
    description: 'Zarządzanie setterami, harmonogram sesji resetu, przydział zadań (Kanban) oraz historia przestawień.',
    models: `
# apps/setting/models.py
import uuid
from django.conf import settings
from django.db import models
from apps.gyms.models import Sector

class SetterProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, default='Route Setter')
    specialties = models.CharField(max_length=255, help_text="np. Dachy, Połogi")
    avatar_url = models.URLField(blank=True)

class SettingSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150)
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE)
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('planned', 'Zaplanowana'),
        ('in_progress', 'W trakcie'),
        ('completed', 'Zakończona')
    ], default='planned')
    lead_setter = models.ForeignKey(SetterProfile, on_delete=models.SET_NULL, null=True)

class SetterTask(models.Model):
    session = models.ForeignKey(SettingSession, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    setter = models.ForeignKey(SetterProfile, on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    target_grade = models.CharField(max_length=10)
    hold_color = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=[
        ('todo', 'Do zrobienia'),
        ('in_progress', 'W trakcie kręcenia'),
        ('testing', 'Testy / Forsovanie'),
        ('done', 'Gotowe')
    ], default='todo')
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateField(default=timezone.now)

class ResetHistoryLog(models.Model):
    date = models.DateField(default=timezone.now)
    sector_name = models.CharField(max_length=120)
    lead_setter_name = models.CharField(max_length=120)
    routes_stripped = models.PositiveIntegerField()
    routes_set = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
`,
    serializers: `
# apps/setting/serializers.py
from rest_framework import serializers
from .models import SetterProfile, SettingSession, SetterTask, ResetHistoryLog

class SetterProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    class Meta:
        model = SetterProfile
        fields = '__all__'

class SetterTaskSerializer(serializers.ModelSerializer):
    setter_name = serializers.CharField(source='setter.user.get_full_name', read_only=True)
    class Meta:
        model = SetterTask
        fields = '__all__'
`,
    views: `
# apps/setting/views.py
from rest_framework import viewsets
from .models import SettingSession, SetterTask, ResetHistoryLog
from .serializers import SetterTaskSerializer

class SetterTaskViewSet(viewsets.ModelViewSet):
    queryset = SetterTask.objects.all()
    serializer_class = SetterTaskSerializer
`,
    urls: `
# apps/setting/urls.py
from rest_framework.routers import DefaultRouter
from .views import SetterTaskViewSet

router = DefaultRouter()
router.register(r'tasks', SetterTaskViewSet, basename='task')
urlpatterns = router.urls
`,
    admin: `
# apps/setting/admin.py
from django.contrib import admin
from .models import SetterProfile, SettingSession, SetterTask, ResetHistoryLog

@admin.register(SetterProfile)
class SetterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'specialties')
    search_fields = ('user__username', 'role')

@admin.register(SettingSession)
class SettingSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'sector', 'scheduled_date', 'status', 'lead_setter')
    list_filter = ('status', 'sector')

@admin.register(SetterTask)
class SetterTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'setter', 'target_grade', 'status', 'due_date', 'created_at')
    list_filter = ('status', 'setter')

@admin.register(ResetHistoryLog)
class ResetHistoryLogAdmin(admin.ModelAdmin):
    list_display = ('date', 'sector_name', 'lead_setter_name', 'routes_stripped', 'routes_set')
`,
  },
  {
    id: 'analytics',
    name: '4. Analytics & Climber Feedback (Analityka & Przejścia)',
    folderName: 'apps/analytics',
    badge: 'Aplikacja 4',
    description: 'Głosowanie nad konsensusem wycen, rejestracja przejść po skanowaniu QR, wskaźniki retencji i popularności.',
    models: `
# apps/analytics/models.py
import uuid
from django.db import models
from apps.routes.models import Route

class ClimberAscent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='ascents')
    climber_name = models.CharField(max_length=100)
    rating = models.PositiveSmallIntegerField(default=5, help_text="Gwiazdki 1-5")
    perceived_grade = models.CharField(max_length=10, help_text="Grade odczuty przez wspinacza")
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
`,
    serializers: `
# apps/analytics/serializers.py
from rest_framework import serializers
from .models import ClimberAscent

class ClimberAscentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClimberAscent
        fields = '__all__'
`,
    views: `
# apps/analytics/views.py
from rest_framework import viewsets
from .models import ClimberAscent
from .serializers import ClimberAscentSerializer

class ClimberAscentViewSet(viewsets.ModelViewSet):
    queryset = ClimberAscent.objects.all()
    serializer_class = ClimberAscentSerializer
`,
    urls: `
# apps/analytics/urls.py
from rest_framework.routers import DefaultRouter
from .views import ClimberAscentViewSet

router = DefaultRouter()
router.register(r'ascents', ClimberAscentViewSet, basename='ascent')
urlpatterns = router.urls
`,
    admin: `
# apps/analytics/admin.py
from django.contrib import admin
from .models import ClimberAscent

@admin.register(ClimberAscent)
class ClimberAscentAdmin(admin.ModelAdmin):
    list_display = ('climber_name', 'route', 'rating', 'perceived_grade', 'created_at')
    list_filter = ('rating',)
    search_fields = ('climber_name', 'comment')
`,
  },
  {
    id: 'accounts',
    name: '5. Accounts & JWT Authentication (Rejestracja & Logowanie Zarządców)',
    folderName: 'apps/accounts',
    badge: 'Aplikacja 5',
    description: 'Dedykowana aplikacja autentykacji, rejestracji zarządców obiektów, tokenów JWT, ról (Manager / Head Setter / Setter) oraz profilu użytkownika.',
    models: `
# apps/accounts/models.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

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
`,
    serializers: `
# apps/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'gym_name', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username') or validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'gym_manager'),
            gym_name=validated_data.get('gym_name', 'VertiGym'),
            password=validated_data['password']
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'name': self.user.get_full_name(),
            'role': self.user.role,
            'gym_name': self.user.gym_name,
        }
        return data
`,
    views: `
# apps/accounts/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserRegisterSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
`,
    urls: `
# apps/accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomLoginView, RegisterView, CurrentUserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomLoginView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('profile/', CurrentUserProfileView.as_view(), name='auth_profile'),
]
`,
    admin: `
# apps/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'gym_name', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'gym_name')
    ordering = ('email',)
`,
  },
];

