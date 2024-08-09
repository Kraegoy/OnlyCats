from django.urls import path
from .views import(
    user_view,
    edit_profile,
    follow_user,
    search_users,
    ajax_post_details,
)

urlpatterns = [
    path('user/<int:id>/', user_view, name='user_view'),
    path('edit_profile', edit_profile, name='edit_profile'),
    path('follow_user/<int:id>/', follow_user, name='follow_user'),
    path('ajax/post-details/<int:id>/', ajax_post_details, name='ajax_post_details'),
    path('search_users/', search_users, name='search_users'),


]
