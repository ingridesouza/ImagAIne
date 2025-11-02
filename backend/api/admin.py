from django.contrib import admin
from .models import Image

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('user', 'prompt', 'status', 'is_public', 'created_at')
    search_fields = ('prompt', 'user__username')
    list_filter = ('status', 'is_public', 'created_at')
    readonly_fields = ('created_at',)
