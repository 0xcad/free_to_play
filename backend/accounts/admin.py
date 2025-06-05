from django.contrib import admin

from .models import User
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_participating', 'is_active', 'balance')
    search_fields = ('name',)
