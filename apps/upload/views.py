from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from apps.user.models import UserProfile, UserPost
from django.contrib.auth.models import User


@login_required
def upload_photo(request):
    if request.method == 'POST':
        # Handle file upload
        photo = request.FILES.get('photo')
        caption = request.POST.get('caption')
        user = request.user
        # Ensure the user profile exists
        userProfile = UserProfile.objects.filter(user=request.user).first()

        # Create a new UserPost
        UserPost.objects.create(user=request.user, image=photo, caption=caption)

        # Prepare user_info
        user_info = {
            'fullName': user.first_name + " " + user.last_name,
            'username': user.username,
            'profile_picture': userProfile.profile_picture.url if userProfile.profile_picture else '',
            'bio': userProfile.bio,
            'followers_count': userProfile.followers.count(),
            'following_count': userProfile.following.count(),
            'birth_date': userProfile.birth_date,
            'location': userProfile.location,

        }   
            # Redirect or render success message
        return render(request, 'home.html', {"user_info": user_info})
    
    # Prepare user_info for the GET request
    userProfile = UserProfile.objects.filter(user=request.user).first()

    # Render the upload form
    return render(request, 'home.html')

