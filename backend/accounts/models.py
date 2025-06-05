from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    name = models.CharField(max_length=64, default='')
    email = models.EmailField(max_length=254, null=True, blank=True)
    is_participating = models.BooleanField(default=True)
    is_muted = models.BooleanField(default=False)

    is_active = models.BooleanField(default=False)

    # how much money they have
    balance = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

