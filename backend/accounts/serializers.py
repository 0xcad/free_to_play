from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User

'''
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        user = authenticate(**attrs)
        if user is None:
            raise serializers.ValidationError('Invalid credentials')
        return user
'''


'''
class CreateUserSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    participation = serializers.

    def validate(self, attrs):
'''

class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'email', 'is_participating']

class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()
    is_authenticated = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'is_participating', 'is_admin', 'is_authenticated']

    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser

    def get_is_authenticated(self, obj):
        return obj.is_active

class ResendEmailSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
