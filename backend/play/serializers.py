from rest_framework import serializers
from .models import PlayInstance
from accounts.serializers import UserListSerializer


class PlayInstanceSerializer(serializers.ModelSerializer):
    current_player = UserListSerializer(read_only=True)

    class Meta:
        model = PlayInstance
        exclude = ('id', 'is_active',)
