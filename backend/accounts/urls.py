from django.urls import path

from . import views

app_name = 'accounts'
urlpatterns = [
    path('', views.UserView.as_view(), name='user'),
    path('login/<uidb64>/<token>', views.LoginView.as_view(), name='login'),
    path('resend-email', views.ResendEmailView.as_view(), name='resend-email'),
	path('create', views.CreateUserView.as_view(), name='create'),
	path('logout', views.LogoutView.as_view(), name='logout'),

    path('qr-code', views.qr_code, name='qr-code'),
]
