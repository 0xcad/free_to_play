from django.db import models
from accounts.models import User
from play.models import PlayInstance

class ChatMessage(models.Model):
    play_instance = models.ForeignKey(PlayInstance, null=True, blank=False, on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=False, on_delete=models.SET_NULL)
    content = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_name}: {self.content[:50]}"

