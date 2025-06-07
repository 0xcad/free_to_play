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
from play.serializers import PlayInstanceSerializer

from .permissions import AllowInactiveUsers, UserJoinedAudience
from rest_framework import permissions
from .models import User
from play.models import PlayInstance

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth import logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render

from django.conf import settings

def send_login_email(user):
    # TODO: pass an origin variable from the user
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    login_link = f'{settings.FRONTEND_URL}/auth?uid={uid}&token={token}'
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

                play_instance_data = {}
                if user.is_joined:
                    play_instance = PlayInstance.get_active()
                    play_instance_data = PlayInstanceSerializer(play_instance).data

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                    'play_instance': play_instance_data
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
        # if the user exists, update them if not active
        try:
            email = request.data['email']
            user = User.objects.get(email=email)
            serializer = CreateUserSerializer(data=request.data, instance=user, partial=True)
            serializer.is_valid(raise_exception=True)
            if not user.is_active:
                user = serializer.save()
        # otherwise create a new user
        except User.DoesNotExist:
            serializer = CreateUserSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
        except:
            return Response({"details": "Invalid form"}, status=HTTP_400_BAD_REQUEST)

        # add the user to the current game, if they have a join code
        join_code = request.data.get('join_code')
        play_instance = PlayInstance.get_active()
        if join_code and play_instance and play_instance.join_code == join_code.strip():
            play_instance.audience.add(user)

        send_login_email(user)

        #refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        user_data['is_authenticated'] = False
        print(user_data)

        return Response({
            'details': 'Login link sent!',
            'user': user_data,
        }, status=status.HTTP_200_OK)

class JoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        join_code = request.data.get('join_code')
        if request.user.is_joined:
            return Response({"details": "Already in active play"}, status=status.HTTP_200_OK)

        play_instance = PlayInstance.get_active()
        if join_code and play_instance and play_instance.join_code == join_code.strip():
            play_instance.audience.add(request.user)
            return Response({"details": "Successfully joined the current play!"}, status=status.HTTP_200_OK)
        else:
            return Response({"details": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)



from urllib.parse import quote
import qrcode
from io import BytesIO
import base64

def qr_code(request):
    play_instance = PlayInstance.get_active()
    if not play_instance.join_code:
        play_instance.join_code = PlayInstance.generate_join_code()
        play_instance.save()

    encoded_code = quote(play_instance.join_code)
    login_link = f'{settings.FRONTEND_URL}/auth/login?join_code={encoded_code}'

    # make the qr code
    qr = qrcode.QRCode(version=1, box_size=10, border=1)
    qr.add_data(login_link)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    return render(request, 'accounts/qr_code.html', {
        'qr_code': img_str,
        'login_link': login_link,
    })

