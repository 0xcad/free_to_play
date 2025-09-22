from django.db import models

from accounts.models import User
import random
from django.utils import timezone
from datetime import timedelta

from django.core.cache import cache
from django.db.models import Sum

class PlayInstance(models.Model):
    '''
    Stores all the logic for a play. So you'd create one of these for each performance
    '''
    name = models.CharField(max_length=255, null=True)
    is_debug = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    stream_url = models.URLField(max_length=255, blank=True, null=True)

    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('running', 'Running'),
        ('finished', 'Finished'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='waiting')

    # all api routes point to active game
    is_active = models.BooleanField(default=False)

    # game things
    audience = models.ManyToManyField(User, related_name='plays')
    join_code = models.CharField(max_length=15, blank=True, null=True)
    current_player = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, blank=True) # current player

    @property
    def freelance_score(self):
        cache_key = f'freelance_score_{self.id}'
        score = cache.get(cache_key)
        if score is None:
            score = self.audience.aggregate(total=Sum('freelance_index'))['total'] * 25 or 0
            cache.set(cache_key, score, timeout=10)
        return score

    @classmethod
    def get_active(cls):
        try:
            return cls.objects.get(is_active=True)
        except cls.DoesNotExist:
            active_play = cls.objects.create(name="Debug", is_active=True, is_debug=True)
            return active_play

    @classmethod
    def generate_join_code(cls):
        # Generate a random six-digit integer
        return str(random.randint(100000, 999999))

    def add_user(self, user):
        """
        Add a user to the play instance audience.
        """
        if not self.audience.filter(id=user.id).exists():
            self.audience.add(user)
            # TODO? UserPlayInstance.create(user=user, play_instance=self)

    def __str__(self):
        s = self.name
        if self.is_debug:
            s = 'DEBUG: ' + s
        return s

    def save(self, *args, **kwargs):
        if self.join_code is None:
            self.join_code = self.generate_join_code()
        super(PlayInstance, self).save(*args, **kwargs)

'''
Going away with this for now because if it's just is_muted and has_played, those should really be global attributes of the user.
IN the future though, if there's more properties we want to add for the user in the current play, maybe if balance doesn't transfer over, etc, bring this back.
class UserPlayInstance(models.Model):
    # For a given performance/instance of a play, this stores user data
    # So users can see multiple plays, and these reset between shows

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='play_user')
    play_instance = models.ForeignKey(PlayInstance, on_delete=models.CASCADE, related_name='play_users')
    is_muted = models.BooleanField(default=False)
    has_played = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'play_instance')

    def __str__(self):
        return f"{self.user.email} in {self.play_instance.name}"
'''


