from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    name = models.CharField(max_length=64, default='')
    email = models.EmailField(max_length=254, unique=True, null=True)
    is_participating = models.BooleanField(default=True)
    is_muted = models.BooleanField(default=False)
    has_played = models.BooleanField(default=False)

    is_active = models.BooleanField(default=False)

    # how much money they have
    balance = models.PositiveIntegerField(default=0)
    spent = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    username = None

    def __str__(self):
        return self.name

    @property
    def is_joined(self):
        return bool(self.plays.filter(is_active=True))

    @property
    def inventory(self):
        return self.all_purchased_items.filter(play_instance__is_active=True, item__item_type="user")

    '''
    def get_play_user(self):
        return self.play_user.filter(play_instance__is_active=True).first()

    @property
    def is_muted(self):
        play_user = self.get_play_user()
        if play_user:
            return play_user.is_muted
        return False
    '''
