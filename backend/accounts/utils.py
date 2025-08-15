from django.conf import settings
from django.shortcuts import redirect
from django.core.exceptions import ValidationError
from urllib.parse import urlencode
from typing import Dict, Any
import requests
import jwt

from google_auth_oauthlib.flow import Flow
from django.conf import settings
from django.http import JsonResponse


def get_user_data(code):
    REDIRECT_URI = f'{settings.FRONTEND_URL}/auth/'

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [REDIRECT_URI],
            }
        },
        scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]
    )
    flow.redirect_uri = REDIRECT_URI

    try:
        flow.fetch_token(code=code)
    except Exception as e:
        return str(e)
    credentials = flow.credentials
    access_token = credentials.token

    response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    if response.status_code != 200:
        return "Failed to fetch user info"

    user_info = response.json()
    return user_info




'''
    access_token = google_get_access_token(code=code, redirect_uri=redirect_uri)
    user_data = google_get_user_info(access_token=access_token)

    # Creates user in DB if first time login
    User.objects.get_or_create(
        username = user_data['email'],
        email = user_data['email'],
        first_name = user_data.get('given_name'),
        last_name = user_data.get('family_name')
    )

    profile_data = {
        'email': user_data['email'],
        'first_name': user_data.get('given_name'),
        'last_name': user_data.get('family_name'),
    }
    return profile_data
'''
