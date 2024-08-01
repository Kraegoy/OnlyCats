from django.shortcuts import render
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import UserProfile


def display_user_info(request):
    try:
        userProfile = UserProfile.objects.get(user=request.user)
        user_info = {
            'fullName': request.user.first_name + " " + request.user.last_name,
            'username': request.user.username,
            'profile_picture': userProfile.profile_picture.url if userProfile.profile_picture else '',
        }
        return JsonResponse({'success': True, 'user_info': user_info })
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'UserProfile does not exist'}, status=404)

def user_view(request):
    return render(request, 'user-profile.html')
