from django.db import models

from accounts.models import User
import random

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
    join_code = models.CharField(max_length=15, blank=True, null=True)
    current_player = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, blank=True) # current player
    current_game_start = models.DateTimeField(null=True, blank=True) # timer
    audience = models.ManyToManyField(User, related_name='plays')

    @classmethod
    def get_active(cls):
        return cls.objects.get(is_active=True)

    @classmethod
    def generate_join_code(cls):
        # Generate a random six-digit integer
        return str(random.randint(100000, 999999))

    def __str__(self):
        s = self.name
        if self.is_debug:
            s = 'DEBUG: ' + s
        return s

    def save(self, *args, **kwargs):
        if self.join_code is None:
            self.join_code = self.generate_join_code()
        super(PlayInstance, self).save(*args, **kwargs)



