from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase
from django.urls import reverse

from .models import (
    
    Sector,
    SetterProfile,
    SettingSession,
    SetterTask,
    ResetHistoryLog,
)
from apps.gyms.models import Gym

User = get_user_model()


class CrossGymValidationTests(TestCase):

    def setUp(self):
        self.gym_a = Gym.objects.create(name='Gym A')
        self.gym_b = Gym.objects.create(name='Gym B')

        self.user_a = User.objects.create(username='setter-a',email='setter-a@test.com', password='Olus1enka', gym=self.gym_a)
        self.user_b = User.objects.create(username='setter-b',email='setter-b@test.com', password='Olus1enka', gym=self.gym_b)

        self.setter_a = SetterProfile.objects.create(user=self.user_a, role='Head Route Setter', specialties='Dyno')
        self.setter_b = SetterProfile.objects.create(user=self.user_b, role='Route Setter', specialties='Dachy')

        self.sector_a = Sector.objects.create(name='Sector A', gym=self.gym_a)

        

    


    def test_setting_session_rejects_setter_from_another_gym(self):
        session = SettingSession(title='Gym Test', sector=self.sector_a, scheduled_date='2026-08-23', lead_setter=self.setter_b)
        with self.assertRaises(ValidationError):
            session.full_clean()


    def test_setter_task_rejects_setter_from_another_gym(self):
        session = SettingSession.objects.create(title='Gym A Session', sector=self.sector_a, scheduled_date='2026-08-23', lead_setter=self.setter_a)

        task = SetterTask(session=session, setter=self.setter_b, title='Cross gym task',
        target_grade='6A',
        hold_color='Blue',
        sector_name='Sector A')

        with self.assertRaises(ValidationError):
            task.full_clean()
        def test_setting_session_accepts_setter_from_same_gym(self):
            session = SettingSession(
        title='Valid session',
        sector=self.sector_a,
        scheduled_date='2026-08-23',
        lead_setter=self.setter_a,
    )

        session.full_clean()


def test_setter_task_accepts_setter_from_same_gym(self):
    session = SettingSession.objects.create(
        title='Gym A session',
        sector=self.sector_a,
        scheduled_date='2026-08-23',
        lead_setter=self.setter_a,
    )

    task = SetterTask(
        session=session,
        setter=self.setter_a,
        title='Valid task',
        target_grade='6A',
        hold_color='Blue',
        sector_name='Sector A',
    )

    task.full_clean()



class SettingSessionViewSetTest(APITestCase):
    def setUp(self):
        self.gym_a = Gym.objects.create(name='Gym A')
        self.gym_b = Gym.objects.create(name='Gym B')

        self.user_a = User.objects.create_user(
            username='user-a',
            email='user-a@test.com',
            password='testpass123',
            gym=self.gym_a,
        )

        self.user_b = User.objects.create_user(
            username='user-b',
            email='user-b@test.com',
            password='testpass123',
            gym=self.gym_b,
        )

        self.setter_a = SetterProfile.objects.create(
            user=self.user_a,
            role='Head Route Setter',
            specialties='Dyno',
        )

        self.setter_b = SetterProfile.objects.create(
            user=self.user_b,
            role='Head Route Setter',
            specialties='Dachy',
        )

        self.sector_a = Sector.objects.create(
            name='Sector A',
            gym=self.gym_a,
        )

        self.sector_b = Sector.objects.create(
            name='Sector B',
            gym=self.gym_b,
        )

        self.session_a = SettingSession.objects.create(
            title='Session A',
            sector=self.sector_a,
            scheduled_date='2026-08-23',
            lead_setter=self.setter_a,
        )
        self.task_b = SetterTask.objects.create(
            session=self.session_b,
            setter=self.setter_b,
            title='Task B',
            target_grade='6B',
            hold_color='Red',
            sector_name='Sector B',
        )
        
        self.log_a = ResetHistoryLog.objects.create(
            session=self.session_a,
            sector_name='Sector A',
            lead_setter_name='setter-a',
            routes_stripped=5,
            routes_set=6,
        )
        
        self.log_b = ResetHistoryLog.objects.create(
            session=self.session_b,
            sector_name='Sector B',
            lead_setter_name='setter-b',
            routes_stripped=4,
            routes_set=5,
        )

        self.session_b = SettingSession.objects.create(
            title='Session B',
            sector=self.sector_b,
            scheduled_date='2026-08-23',
            lead_setter=self.setter_b,
        )
        self.task_a = SetterTask.objects.create(
            session=self.session_a,
            setter=self.setter_a,
            title='Task A',
            target_grade='6A',
            hold_color='Blue',
            sector_name='Sector A',
        )

def test_user_only_sees_sessions_from_own_gym(self):
    self.client.force_authenticate(user=self.user_a)

    url = reverse('settingsession-list')
    response = self.client.get(url)

    self.assertEqual(response.status_code, 200)

    session_ids = [item['id'] for item in response.data]

    self.assertIn(str(self.session_a.id), session_ids)
    self.assertNotIn(str(self.session_b.id), session_ids)


def test_user_only_sees_tasks_from_own_gym(self):
    self.client.force_authenticate(user=self.user_a)

    url = reverse('settertask-list')
    response = self.client.get(url)

    self.assertEqual(response.status_code, 200)

    task_ids = [item['id'] for item in response.data]

    self.assertIn(str(self.task_a.id), task_ids)
    self.assertNotIn(str(self.task_b.id), task_ids)

def test_user_only_sees_reset_logs_from_own_gym(self):
    self.client.force_authenticate(user=self.user_a)

    url = reverse('resethistorylog-list')
    response = self.client.get(url)

    self.assertEqual(response.status_code, 200)

    log_ids = [item['id'] for item in response.data]

    self.assertIn(str(self.log_a.id), log_ids)
    self.assertNotIn(str(self.log_b.id), log_ids)