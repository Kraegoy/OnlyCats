from django.contrib import admin
from .models import UserProfile, UserPost, Comment

class CommentInline(admin.TabularInline):  # or admin.StackedInline
    model = Comment
    extra = 1  # Number of empty forms to display by default

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'profile_picture', 'bio', 'birth_date', 'location')
    search_fields = ('user__username', 'bio', 'website', 'location')
    list_filter = ('birth_date', 'location')

class UserPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'image', 'caption', 'created_at', 'updated_at')
    search_fields = ('user__username', 'caption')
    list_filter = ('created_at', 'updated_at')
    inlines = [CommentInline]  # Add the inline model for comments

class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'content', 'created_at')
    search_fields = ('user__username', 'content')
    list_filter = ('created_at', 'post')

# Register your models here
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(UserPost, UserPostAdmin)
admin.site.register(Comment, CommentAdmin)
