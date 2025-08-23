from django.contrib import admin
from django.utils.html import format_html
from .models import Image

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('thumbnail', 'user', 'prompt', 'is_public', 'created_at')
    search_fields = ('prompt', 'user__username')
    list_filter = ('is_public', 'user', 'created_at')
    readonly_fields = ('created_at', 'image_url', 'thumbnail_display')
    list_per_page = 20

    fieldsets = (
        (None, {'fields': ('user', 'prompt')}),
        ('Image', {'fields': ('image_url', 'thumbnail_display')}),
        ('Status', {'fields': ('is_public', 'created_at')}),
    )

    def thumbnail(self, obj):
        if obj.image_url and obj.image_url != 'GENERATING':
            return format_html(f'<a href="{obj.image_url}" target="_blank"><img src="{obj.image_url}" width="80" /></a>')
        return "Generating..."
    thumbnail.short_description = 'Thumbnail'

    def thumbnail_display(self, obj):
        return self.thumbnail(obj)
    thumbnail_display.short_description = 'Image Preview'
