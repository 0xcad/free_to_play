import os
from .base import *  # noqa: F401,F403

DEBUG = True
SECRET_KEY = os.getenv("SECRET_KEY")

# FTP Constants ----------------------------------------------

FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://freetoplay.tech')
BACKEND_URL = os.getenv('BACKEND_URL', 'https://api.freetoplay.tech')

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", 'smtp.gmail.com')
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

SERVE_MEDIA = False

# TODO: change production database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

ALLOWED_HOSTS = [BACKEND_URL.replace("https://","")]
CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    BACKEND_URL,
]
CSRF_TRUSTED_ORIGINS = [
    BACKEND_URL,
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
