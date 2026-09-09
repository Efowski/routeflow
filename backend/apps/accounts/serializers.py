from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Gym


User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'role',
            'gym',
            'gym_name',
            'password',
        ]

    def create(self, validated_data):
        gym_name = validated_data.get('gym_name', 'VertiGym Warszawska')
        gym = validated_data.get('gym')

        if not gym:
            gym = Gym.objects.create(name=gym_name)

        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username') or validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'gym_manager'),
            gym=gym,
            gym_name=gym_name,
            password=validated_data['password'],
        )

        return user


class CurrentUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    gym_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'gym', 'gym_name']
        read_only_fields = [
            'id',
            'email',
            'name',
            'role',
            'gym',
            'gym_name',
        ]

    def get_name(self, obj):
        return obj.get_full_name()

    def get_gym_name(self, obj):
        return obj.gym.name if obj.gym else ''


class GymUserSeralizer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'name': self.user.get_full_name(),
            'role': self.user.role,
            'gym': str(self.user.gym.id) if self.user.gym else None,
            'gym_name': (
                self.user.gym.name
                if self.user.gym
                else self.user.gym_name
            ),
        }

        return data