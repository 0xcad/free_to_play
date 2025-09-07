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

class ItemMixin(serializers.Serializer):
    verified = serializers.SerializerMethodField()
    has_superchat = serializers.SerializerMethodField()

    def get_verified(self, obj):
        return obj.all_purchased_items.filter(play_instance__is_active=True, item__slug='verified').count()

    def get_has_superchat(self, obj):
        return obj.all_purchased_items.filter(play_instance__is_active=True, item__slug='super-chat').exists()

class UserSerializer(ItemMixin, serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()
    is_authenticated = serializers.SerializerMethodField()
    is_joined = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'is_participating', 'is_admin', 'is_authenticated',
                  'balance', 'spent',
                  'is_joined', 'is_muted', 'has_played',
                  'verified', 'has_superchat']

    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser

    def get_is_authenticated(self, obj):
        return obj.is_active

    def get_is_joined(self, obj):
        return obj.is_joined

class ResendEmailSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

class UserListSerializer(ItemMixin, serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'is_admin', 'is_muted', 'has_played',
                  'verified', 'has_superchat']

    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser

class GoogleAuthSerializer(serializers.Serializer):
    code = serializers.CharField(required=False)
    error = serializers.CharField(required=False)
