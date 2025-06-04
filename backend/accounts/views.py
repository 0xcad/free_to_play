from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    #LoginSerializer,
    CreateUserSerializer,
    UserSerializer,
    ResendEmailSerializer,
)
from rest_framework import permissions
from .models import User

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth import logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

def send_login_email(user):
    # TODO: pass an origin variable from the user
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    login_link = f'http://localhost:5173/auth?uid={uid}&token={token}'
    text_content = render_to_string(
        "emails/loginEmail.txt",
        context={"user": user, "login_link": login_link},
    )

    html_content = render_to_string(
        "emails/loginEmail.html",
        context={"user": user, "login_link": login_link},
    )

    msg = EmailMultiAlternatives(
        "Login to Free to Play",
        text_content,
        "freetoplay@gmail.com",
        [user.email],
        headers={"List-Unsubscribe": "<mailto:unsub@example.com>"},
    )

    # attach the HTML content to the email instance and send.
    msg.attach_alternative(html_content, "text/html")
    msg.send()


'''
TODO: Log a user in
TODO: oauth
TODO: email
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
        }, status=status.HTTP_200_OK)
'''

class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        });

class AllowInactiveUsers(permissions.BasePermission):
    """
    Custom permission to allow inactive users to access the API.
    """

    def has_permission(self, request, view):
        # Allow access to all users, including inactive ones
        return True

class LoginView(APIView):
    permission_classes = [AllowInactiveUsers]

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
            if default_token_generator.check_token(user, token):
                # activate the user!
                if (not user.is_active):
                    user.is_active = True
                    user.save()
                refresh = RefreshToken.for_user(user)

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                });
            return Response({"details": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"details": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

class ResendEmailView(APIView):
    permission_classes = [AllowInactiveUsers]

    def post(self, request):
        serializer = ResendEmailSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNoteExist:
                return Response({"details": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

            send_login_email(user)
            return Response({'details': 'Resent login email'}, status=status.HTTP_200_OK)
        else:
            return Response({"details": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken.objects.get(token=refresh_token)
            token.blacklist()
            return Response({"details": "Successfully logged out."}, status=status.HTTP_200_OK)
        except RefreshToken.DoesNotExist:
            return Response({"details": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)

'''
Create a user
Either email them a login code, or later, do oauth.
'''
class CreateUserView(APIView):
    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # get user if they exist, otherwise save
        data = serializer.validated_data
        try:
            user = User.objects.get(email=data['email'])

            if not user.is_active:
                user.name = data['name']
                user.is_participating = data['is_participating']
                user.save()

        except User.DoesNotExist:
            user = serializer.save()

        send_login_email(user)

        #refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            'details': 'Login link sent!',
            'user': user_data,
        }, status=status.HTTP_200_OK)



