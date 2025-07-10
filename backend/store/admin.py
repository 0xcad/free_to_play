from django.contrib import admin

# Register your models here.
from .models import Item, ItemCategory, ItemPurchase

@admin.register(ItemCategory)
class ItemCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')
    search_fields = ('name',)

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'cost', 'category', 'description', 'quantity', 'is_available', 'is_visible')
    search_fields = ('name', 'slug', 'description')
    list_filter = ('category',)

    def get_is_available(self, obj):
        return obj.is_available

    def get_is_visible(self, obj):
        return obj.is_visible

@admin.register(ItemPurchase)
class ItemPurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'item', 'play_instance')
    search_fields = ('user__email', 'item__name', 'play_instance__name')
    list_filter = ('play_instance', 'item')
    raw_id_fields = ('user', 'item', 'play_instance')
