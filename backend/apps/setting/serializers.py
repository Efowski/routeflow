from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.db import transaction
from apps.accounts.models import CustomUser
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


class SetterWithUserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )
    user_role = serializers.ChoiceField(
        choices=['head_setter', 'route_setter'],
    )
    setter_role = serializers.CharField(max_length=50)
    specialties = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate_email(self, email):
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                'User with this email already exists.'
            )
        return email

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']

        email = validated_data['email']
        first_name = validated_data['first_name']
        last_name = validated_data.get('last_name', '')
        password = validated_data['password']
        user_role = validated_data['user_role']
        setter_role = validated_data['setter_role']
        specialties = validated_data.get('specialties', '')

        user = CustomUser.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=user_role,
            gym=request.user.gym,
            gym_name=request.user.gym.name if request.user.gym else '',
        )

        return SetterProfile.objects.create(
            user=user,
            role=setter_role,
            specialties=specialties,
        )


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

    def create(self, validated_data):
        session = validated_data['session']
        validated_data['sector'] = session.sector
        validated_data['sector_name'] = session.sector.name

        return super().create(validated_data)


    def update(self, instance, validated_data):
        session = validated_data.get('session', instance.session)
        validated_data['sector'] = session.sector
        validated_data['sector_name'] = session.sector.name

        return super().update(instance, validated_data)
        

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

        target_route_count = attrs.get('target_route_count', getattr(self.instance, 'target_route_count', 0))
        target_grade_breakdown = attrs.get('target_grade_breakdown', getattr(self.instance, 'target_grade_breakdown', {}))

        total_planed_routes = sum(target_grade_breakdown.values())

        if total_planed_routes != target_route_count:
            raise ValidationError({
                'target_grade_breakdown': (
                    f'Suma dróg w rozkładzie wycen musi wynosić'
                    f'{target_route_count}. Obecnie wynosi'
                    f'{total_planed_routes}'
                )
            })
        new_status = attrs.get('status')

        if self.instance and new_status:
            current_status = self.instance.status

            allowed_transitions = {
                'planned': {'in_progress'},
                'in_progress': {'completed'},
                'completed': set(),
            }

            if (
                new_status != current_status
                and new_status not in allowed_transitions[current_status]
            ):
                raise serializers.ValidationError({
                    'status': (
                        f'Nieprawidłowa zmiana statusu: '
                        f'{current_status} → {new_status}.'
                    )
                })
                
        return attrs


class ResetHistoryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResetHistoryLog
        fields = '__all__'

    def validate(self, attrs):
        session = attrs.get(
            'session',
            getattr(self.instance, 'session', None)
        )
        request = self.context.get('request')

        if request and session:
            if session.sector.gym != request.user.gym:
                raise serializers.ValidationError({
                    'session': 'Session must belong to your gym.'
                })

        return attrs

    def create(self, validated_data):
        session = validated_data['session']

        validated_data['sector_name'] = session.sector.name

        if session.lead_setter:
            user = session.lead_setter.user
            validated_data['lead_setter_name'] = (
                user.get_full_name() or user.username
            )
        else:
            validated_data['lead_setter_name'] = ''

        return super().create(validated_data)