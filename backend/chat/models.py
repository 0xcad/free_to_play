from django.db import models

class ChatMessage(models.Model):
    username = models.CharField(max_length=255)
    # TODO: add user foreign key here, none true
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_name}: {self.content[:50]}"

