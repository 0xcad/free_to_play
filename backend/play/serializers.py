from rest_framework import serializers
from .models import PlayInstance
from accounts.serializers import UserListSerializer
from django.utils import timezone
from datetime import timedelta


class PlayInstanceSerializer(serializers.ModelSerializer):
    current_player = UserListSerializer(read_only=True)
    remaining_time = serializers.SerializerMethodField()
    #audience = UserListSerializer(many=True, read_only=True)

    class Meta:
        model = PlayInstance
        exclude = ('id', 'is_active', 'audience')

    def get_remaining_time(self, obj):
        if obj.end_time:
           return max(obj.end_time - timezone.now(), timedelta(seconds=0)).total_seconds()
        else:
            return obj.remaining_time.total_seconds() if obj.remaining_time else None

class PlayInstanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayInstance
        exclude = ('id', 'is_active', 'audience')
