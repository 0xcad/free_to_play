from rest_framework import serializers
from .models import ChatMessage
from accounts.serializers import UserListSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    created = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ')
    read_aloud = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'user_id', 'content', 'created', 'read_aloud', 'system']

    def validate_content(self, value):
        if not value:
            raise serializers.ValidationError("Message content cannot be blank")
        return value

    def get_read_aloud(self, obj):
        return obj.user.has_superchat

class CreateChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['content']

    def validate_content(self, value):
        if not value:
            raise serializers.ValidationError("Message content cannot be blank")
        return value
