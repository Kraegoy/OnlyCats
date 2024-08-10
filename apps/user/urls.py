from django.urls import path
from .views import(
    user_view,
    edit_profile,
    follow_user,
    search_users,
    ajax_post_details,
    like_post,
    like_comment,
    add_comment,
)

urlpatterns = [
    path('user/<int:id>/', user_view, name='user_view'),
    path('edit_profile', edit_profile, name='edit_profile'),
    path('follow_user/<int:id>/', follow_user, name='follow_user'),
    path('ajax/post-details/<int:id>/', ajax_post_details, name='ajax_post_details'),
    path('search_users/', search_users, name='search_users'),
    path('like-post/<int:post_id>/', like_post, name='like_post'),
    path('like-comment/<int:comment_id>/', like_comment, name='like_comment'),
    path('ajax/add-comment/<int:post_id>/', add_comment, name='add_comment'),



]
