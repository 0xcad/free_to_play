from django.db import models

from accounts.models import User

class PlayInstance(models.Model):
    name = models.CharField(max_length=255, null=True)
    is_debug = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('running', 'Running'),
        ('finished', 'Finished'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='waiting')

    # all api routes point to active game
    is_active = models.BooleanField(default=False)

    # game things
    current_player = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, blank=True) # current player
    current_game_start = models.DateTimeField(null=True, blank=True) # timer

    @classmethod
    def get_active(cls):
        return cls.objects.get(is_active=True)

    def __str__(self):
        s = self.name
        if self.is_debug:
            s = 'DEBUG: ' + s
        return s

