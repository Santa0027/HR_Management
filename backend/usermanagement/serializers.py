from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, DriverAuthentication

User = get_user_model()
from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'is_active', 'is_staff', 'is_superuser',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer with additional information"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'role_display', 'is_active', 'is_staff',
            'is_superuser', 'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'password', 'confirm_password', 'first_name',
            'last_name', 'phone', 'role', 'is_active', 'is_staff'
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating existing users"""

    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'phone', 'role',
            'is_active', 'is_staff'
        ]

    def validate_email(self, value):
        """Prevent email changes for now"""
        if self.instance and self.instance.email != value:
            raise serializers.ValidationError("Email cannot be changed")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password (Admin only)"""
    new_password = serializers.CharField(min_length=8, max_length=128)
    confirm_password = serializers.CharField(min_length=8, max_length=128)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'password', 'first_name', 'last_name', 'phone', 'role'
        ]  # ✅ no 'username' field here

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)

# auth/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD  # use email instead of username

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user with this email")

        credentials = {
            'username': user.username,  # SimpleJWT expects username
            'password': password,
        }

        user = authenticate(**credentials)

        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        data = super().validate(credentials)
        data['email'] = user.email
        return data


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    permissions = serializers.ListField(source='permissions_list', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'role_display', 'is_active', 'is_staff',
            'last_login_at', 'login_attempts', 'is_locked', 'permissions',
            'created_at', 'updated_at', 'password'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_login_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class DriverAuthenticationSerializer(serializers.ModelSerializer):
    """Serializer for driver authentication management"""
    driver_name = serializers.CharField(source='driver.name', read_only=True)
    driver_mobile = serializers.CharField(source='driver.mobile', read_only=True)
    driver_iqama = serializers.CharField(source='driver.iqama', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_locked_status = serializers.BooleanField(source='is_locked', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = DriverAuthentication
        fields = [
            'id', 'driver', 'driver_name', 'driver_mobile', 'driver_iqama',
            'username', 'status', 'status_display', 'device_id', 'device_info',
            'last_login_at', 'login_attempts', 'is_locked_status', 'locked_until',
            'created_at', 'updated_at', 'password'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_login_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        driver_auth = super().create(validated_data)
        if password:
            from django.contrib.auth.hashers import make_password
            driver_auth.password_hash = make_password(password)
            driver_auth.save()
        return driver_auth

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        driver_auth = super().update(instance, validated_data)
        if password:
            from django.contrib.auth.hashers import make_password
            driver_auth.password_hash = make_password(password)
            driver_auth.save()
        return driver_auth
