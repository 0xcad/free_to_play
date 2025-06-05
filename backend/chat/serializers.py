from rest_framework import serializers
from .models import ChatMessage
from accounts.serializers import UserListSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserListSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'content', 'created']

    def validate_content(self, value):
        if not value:
            raise serializers.ValidationError("Message content cannot be blank")
        return value
