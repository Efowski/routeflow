from rest_framework import serializers
from .models import SetterProfile, SettingSession, SetterTask, ResetHistoryLog

class SetterProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = SetterProfile
        fields = ['id', 'user', 'full_name', 'role', 'specialties', 'avatar_url']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

class SetterTaskSerializer(serializers.ModelSerializer):
    setter_name = serializers.CharField(source='setter.user.username', read_only=True)

    class Meta:
        model = SetterTask
        fields = '__all__'

class SettingSessionSerializer(serializers.ModelSerializer):
    tasks = SetterTaskSerializer(many=True, read_only=True)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    lead_setter_name = serializers.CharField(source='lead_setter.user.username', read_only=True)

    class Meta:
        model = SettingSession
        fields = '__all__'

class ResetHistoryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResetHistoryLog
        fields = '__all__'
