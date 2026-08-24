from django.core.exceptions import ValidationError
from rest_framework import serializers
from .models import SetterProfile, SettingSession, SetterTask, ResetHistoryLog

class SetterProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = SetterProfile
        fields = ['id', 'user', 'full_name', 'role', 'specialties', 'avatar_url']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def validate_user(self, user):
        request = self.context.get('request')
        if request and user.gym != request.user.gym:
            raise serializers.ValidationError('User must belong to your gym.')
        return user

class SetterTaskSerializer(serializers.ModelSerializer):
    setter_name = serializers.CharField(source='setter.user.username', read_only=True)

    class Meta:
        model = SetterTask
        fields = '__all__'

    def validate(self, attrs):
            session = attrs.get(
                'session',
                getattr(self.instance, 'session', None)
            )
            setter = attrs.get(
                'setter',
                getattr(self.instance, 'setter', None)
            )
    
            if session and setter:
                if setter.user.gym != session.sector.gym:
                    raise serializers.ValidationError({
                        'setter': (
                            'Setter must belong to the same gym '
                            'as the setting session.'
                        )
                    })
    
            return attrs
        

class SettingSessionSerializer(serializers.ModelSerializer):
    tasks = SetterTaskSerializer(many=True, read_only=True)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    lead_setter_name = serializers.CharField(source='lead_setter.user.username', read_only=True)

    class Meta:
        model = SettingSession
        fields = '__all__'

    def validate(self, attrs):
        sector = attrs.get('sector', getattr(self.instance, 'sector', None))
        lead_setter = attrs.get('lead_setter', getattr(self.instance, 'lead_setter', None))

        request = self.context.get('request')

        if request and sector:
            if sector.gym != request.user.gym:
                raise serializers.ValidationError({
                    'sector': 'Sector must belong to your gym.'
                })

        if sector and lead_setter:
            if lead_setter.user.gym != sector.gym:
                raise serializers.ValidationError({
                    'lead_setter': (
                        'Lead setter must belong to the same gym '
                        'as the setting session.'
                    )
                })
        return attrs


class ResetHistoryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResetHistoryLog
        fields = '__all__'

    def validate(self, attrs):
        session = attrs.get('session', getattr(self.instance, 'session', None))

        request = self.context.get('request')

        if request and session:
            if session.sector.gym != request.user.gym:
                raise serializers.ValidationError({
                'session': 'Session must belong to your gym.'
            })

        return attrs