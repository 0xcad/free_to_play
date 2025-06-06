from django.contrib import admin
from .models import PlayInstance

@admin.register(PlayInstance)
class PlayInstanceAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'status', 'is_debug', 'join_code')
    search_fields = ('name', 'is_active', 'is_debug')
    ordering = ('is_active', '-created')
