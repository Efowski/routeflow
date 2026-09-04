from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .permissions import IsGymManager
from .serializers import UserRegisterSerializer, CustomTokenObtainPairSerializer, CurrentUserSerializer, GymUserSeralizer

User = get_user_model()

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class GymUserListView(generics.ListAPIView):
    serializer_class = GymUserSeralizer
    permission_classes = [IsGymManager]

    def get_queryset(self):
        return User.objects.filter(
            gym=self.request.user.gym
        ).order_by('first_name', 'last_name', 'email')

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
