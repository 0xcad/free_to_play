from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    name = models.CharField(max_length=64, default='')
    email = models.EmailField(max_length=254, null=True)
    is_participating = models.BooleanField(default=True)

    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.name

