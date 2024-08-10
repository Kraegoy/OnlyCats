from django.urls import path
from .views import(
    home,
    login,
    signup,
    logout_view,
    experiment
)
urlpatterns = [
    path('', home, name='home'),  
    path('login', login, name='login'), 
    path('signup', signup, name='signup'),
    path('logout/', logout_view, name='logout'),
    path('experiment', experiment, name='experiment'),


]
