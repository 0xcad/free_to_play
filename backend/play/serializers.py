from rest_framework import serializers
from .models import PlayInstance
from accounts.serializers import UserListSerializer
from django.utils import timezone
from datetime import timedelta

from store.serializers import ItemSerializer


class PlayInstanceSerializer(serializers.ModelSerializer):
    current_player = UserListSerializer(read_only=True)
    remaining_time = serializers.SerializerMethodField()
    #audience = UserListSerializer(many=True, read_only=True)
    inventory = serializers.SerializerMethodField()

    class Meta:
        model = PlayInstance
        exclude = ('id', 'is_active', 'audience')

    def get_remaining_time(self, obj):
        if obj.end_time:
           return max(obj.end_time - timezone.now(), timedelta(seconds=0)).total_seconds()
        else:
            return obj.remaining_time.total_seconds() if obj.remaining_time else None

    def get_inventory(self, obj):
        item_ids = [item.item.id for item in obj.purchased_items.filter(item__item_type='play')]
        return item_ids


class PlayInstanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayInstance
        exclude = ('id', 'is_active', 'audience')
