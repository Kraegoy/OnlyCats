from django.urls import path
from .views import(
    display_user_info,
    user_view,
)

urlpatterns = [
      path('display_user_info', display_user_info, name='display_user_info'),  
      path('user_view', user_view, name="user_view")

]
