import os
from .base import *  # noqa: F401,F403

DEBUG = True

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

SERVE_MEDIA = True

SECRET_KEY = 'django-insecure-=^kmgeir6j3ymf)_r3&u6icu!$vrxvog9&evus-c+kq7g2s81q'

ALLOWED_HOSTS = ['*']

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://172.26.34.73:3000',
    'http://freetoplay.tech',
    'https://freetoplay.tech',
]
