from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    #LoginSerializer,
    CreateUserSerializer,
    UserSerializer,
    ResendEmailSerializer,
    GoogleAuthSerializer,
)
from play.serializers import PlayInstanceSerializer

from .permissions import AllowInactiveUsers, UserJoinedAudience, IsStaffOrSelf
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from .models import User
from play.models import PlayInstance

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth import logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render

from notifications.utils import send_notification
from .utils import get_user_data

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
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        headers={"List-Unsubscribe": "<mailto:unsub@example.com>"},
    )

    # attach the HTML content to the email instance and send.
    msg.attach_alternative(html_content, "text/html")
    msg.send()

def login_user(user):
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

class UserViewSet(viewsets.ModelViewSet):
    """
    Handles user creation, retrieval, updates, and custom actions:
      - create: anyone
      - retrieve: authenticated
      - partial_update: staff or self
      - destroy: disabled
      - list: staff only
      - me: get tokens for current user
      - login: activate user via uidb64/token
      - resend_email: resend login email
      - logout: blacklist refresh token

    mute:
    Mutes (PUT) or unmutes (DELETE) the user. The operation is idempotent. Only admin can mute users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action in ['create']:
            return CreateUserSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            perms = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update']:
            perms = [permissions.IsAuthenticated, IsStaffOrSelf]
        elif self.action in ['retrieve']:
            perms = [permissions.IsAuthenticated]
        elif self.action == 'destroy':
            perms = [permissions.DenyAll]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        If a user with the given email exists, update them if not active; otherwise create a new user.
        Then optionally add them to a game via join_code and send a login email.
        """
        try:
            email = request.data.get('email')
            user = User.objects.get(email=email)
            serializer = self.get_serializer(data=request.data, instance=user, partial=True)
            serializer.is_valid(raise_exception=True)
            if not user.is_active:
                user = serializer.save()
        except User.DoesNotExist:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
        except Exception:
            return Response({"details": "Invalid form"}, status=status.HTTP_400_BAD_REQUEST)

        # Add to game if join_code matches
        join_code = request.data.get('join_code')
        play_instance = PlayInstance.get_active()
        if join_code and play_instance and play_instance.join_code == join_code.strip():
            play_instance.add_user(user)

        # Send login link
        send_login_email(user)

        # Prepare response data
        user_data = UserSerializer(user).data
        user_data['is_authenticated'] = False

        return Response({
            'details': 'Login link sent!',
            'user': user_data,
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'DELETE not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })

    @action(
        detail=False,
        methods=['POST'],
        permission_classes=[AllowInactiveUsers]
    )
    def login(self, request):
        '''
        Either verify user via email link, or Google login
        '''
        method = request.data.get('method', 'email').lower()

        if method == 'email':
            try:
                uidb64 = request.data.get('uid')
                token = request.data.get('token')


                uid = urlsafe_base64_decode(uidb64).decode()
                user = User.objects.get(pk=uid)
                if default_token_generator.check_token(user, token):
                    return login_user(user)
                return Response({"details": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({"details": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)
        elif method == 'google':
            code = request.data.get('code')
            user_data = get_user_data(code)

            if type(user_data) == str:
                return Response({"details": "Error: " + user_data}, status=status.HTTP_400_BAD_REQUEST)

            email = user_data.get('email')
            name = user_data.get('name')
            user, created = User.objects.get_or_create(email=email, defaults={'name': name})
            if user.name != user_data.get('name'):
                user.name = user_data.get('name')
                user.save()
            return login_user(user)



    @action(detail=False,
            methods=["POST"],
            url_path="login/google",
            permission_classes=[AllowInactiveUsers])
    def login_with_google(self, request):
        """
        Handles Google login by verifying the token and creating or updating the user.
        """
        if request.data.get('credential'):
            # use `credential` as jwt token, parse that
            token = request.data.get('credential')
            import google.oauth2.id_token
            from google.auth.transport import requests as google_requests
            try:
                idinfo = google.oauth2.id_token.verify_oauth2_token(
                    token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
                )
                email = idinfo.get('email')
                name = idinfo.get('name')
                user, created = User.objects.get_or_create(email=email, defaults={'name': name})
                if user.name != name:
                    user.name = name
                    user.save()
                return login_user(user)
            except ValueError as e:
                return Response({"details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        # now what do we do here? do we redirect to the frontend?


    @action(detail=False, methods=['POST'], permission_classes=[AllowInactiveUsers])
    def resend_email(self, request):
        serializer = ResendEmailSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'details': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
            send_login_email(user)
            return Response({'details': 'Resent login email'}, status=status.HTTP_200_OK)
        return Response({'details': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        token_str = request.data.get('refresh_token')
        try:
            token = RefreshToken(token_str)
            token.blacklist()
            return Response({'details': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'details': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["PUT", "DELETE"], permission_classes=[permissions.IsAdminUser])
    def mute(self, request, *args, **kwargs):
        user = self.get_object()
        if user.is_staff:
            return Response({"details": "Cannot mute/unmute staff users"}, status=status.HTTP_403_FORBIDDEN)
        #user_pi = UserPlayInstance.objects.get_or_create(user=user, play_instance=PlayInstance.get_active())
        if request.method == "PUT":
            #user_pi.is_muted = True
            user.is_muted = True
            send_notification('accounts.User', 'muted', {'user_id': user.id, 'muted': True})
        else:
            #user_pi.is_muted = False
            user.is_muted = False
            send_notification('accounts.User', 'muted', {'user_id': user.id, 'muted': False})
        #user_pi.save()
        user.save()
        return Response(status=status.HTTP_200_OK)



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

