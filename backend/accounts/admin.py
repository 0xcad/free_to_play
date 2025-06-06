from django.contrib import admin

from .models import User
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_participating', 'is_active', 'balance', 'spent', 'get_plays')
    search_fields = ('name',)

    def get_plays(self, obj):
        return ", ".join([play.name for play in obj.plays.all()])
    get_plays.short_description = 'Plays'
