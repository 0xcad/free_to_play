from rest_framework import serializers
from .models import PlayInstance
from accounts.serializers import UserListSerializer

class PlayInstanceSerializer(serializers.ModelSerializer):
    freelance_score = serializers.SerializerMethodField()

    class Meta:
        model = PlayInstance
        exclude = ('id', 'is_active', 'audience', 'is_debug', 'name', 'created')

    def get_freelance_score(self, obj):
        return obj.freelance_score


class PlayInstanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayInstance
        exclude = ('id', 'is_active', 'audience')
