from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import UserProfile, UserPost, Comment
from django.contrib.auth.decorators import login_required
from datetime import datetime
from django.db.models import Q


@login_required
def follow_user(request, id):
    user_to_follow = get_object_or_404(User, id=id)
    user_to_follow_profile = get_object_or_404(UserProfile, user=user_to_follow)
    
    # Get the current user's profile
    current_user_profile = get_object_or_404(UserProfile, user=request.user)
    
    # Add the user to the current user's following list if not already following
    if user_to_follow_profile not in current_user_profile.following.all():
        current_user_profile.following.add(user_to_follow)
        current_user_profile.save()
    
    # Add the current user to the user_to_follow's followers list if not already a follower
    if current_user_profile not in user_to_follow_profile.followers.all():
        user_to_follow_profile.followers.add(request.user)
        user_to_follow_profile.save()
    
    # Redirect to the referring page or a default page
    referrer_url = request.META.get('HTTP_REFERER', ' ') 
    return redirect(referrer_url)

def user_view(request, id):
    user = get_object_or_404(User, id=id)
    userProfile = UserProfile.objects.get(user=user)
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
    my_following = request.user.userprofile.following.all()

    posts = get_user_posts(user)
    posts_counts = posts.count()

    return render(request, 'user-profile.html', {'user': user, 'user_info': user_info, 'posts': posts, 'posts_counts': posts_counts, 'my_following': my_following})


def get_user_posts(user):
    # Ensure that user is a User object
    if not isinstance(user, User):
        raise ValueError("The provided argument is not a valid User object.")

    # Query all posts related to the given user
    posts = UserPost.objects.filter(user=user).order_by('-created_at')

    return posts

def ajax_post_details(request, id):
    if request.method == 'GET':
        userPost = get_object_or_404(UserPost, id=id)
        comments = userPost.comments.select_related('user__userprofile').prefetch_related('replies').all()
        
        comments_data = []
        for comment in comments:
            replies_data = [
                {
                    'username': reply.user.username,
                    'content': reply.content,
                    'created_at': reply.created_at,
                    'profile_picture': reply.user.userprofile.profile_picture.url if reply.user.userprofile.profile_picture else ''
                }
                for reply in comment.replies.all()
            ]
            comments_data.append({
                'username': comment.user.username,
                'content': comment.content,
                'created_at': comment.created_at,
                'profile_picture': comment.user.userprofile.profile_picture.url if comment.user.userprofile.profile_picture else '',
                'replies': replies_data
            })
        
        post_info = {
            'image': userPost.image.url,
            'caption': userPost.caption,
            'created_at': userPost.created_at,
            'updated_at': userPost.updated_at,
            'user_profile_picture': userPost.user.userprofile.profile_picture.url if userPost.user.userprofile.profile_picture else '',
            'user': userPost.user.username,
            'comments': comments_data,  # Include replies in comments data
        }
        return JsonResponse(post_info)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

def edit_profile(request):
    if request.method == 'POST':
        user_profile = UserProfile.objects.get(user=request.user)
        profile_picture_file = request.FILES.get('profile_picture')
        if profile_picture_file:
            user_profile.profile_picture = request.FILES.get('profile_picture')
        user_profile.bio = request.POST.get('bio')
        user_profile.location = request.POST.get('location')
        
        birth_date_str = request.POST.get('birth_date')
        if birth_date_str:
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        else:
            birth_date = None 
        
        user_profile.birth_date = birth_date
        user_profile.save()
        
        user = request.user
        user_info = {
            'fullName': user.first_name + " " + user.last_name,
            'username': user.username,
            'profile_picture': user_profile.profile_picture.url if user_profile.profile_picture else '',
            'location': user_profile.location,
            'birth_date': user_profile.birth_date,
            'bio': user_profile.bio,
            'followers_count': user_profile.followers.count(),
            'following_count': user_profile.following.count(),
        }
        posts = get_user_posts(user)

        posts_counts = posts.count()
        return render(request, 'user-profile.html', {'user': user, 'user_info': user_info, 'posts': posts, 'posts_counts': posts_counts})
    return render(request, 'user-profile.html', {'user': user, 'user_info': user_info, 'posts': posts, 'posts_counts': posts_counts})

@login_required
def search_users(request):
    if 'q' in request.GET:
        query = request.GET['q']
        
        # Create a Q object to filter by username, first_name, and last_name
        search_filter = Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query)
        
        # Fetch users and related UserProfile data
        users = User.objects.select_related('userprofile').filter(search_filter)
        following_ids = request.user.userprofile.following.values_list('id', flat=True)
        user_list = list(users.values('id', 'username', 'first_name', 'last_name', 'userprofile__profile_picture'))
        
        # Attach following status to each user
        for user in user_list:
            user['is_following'] = user['id'] in following_ids

        return JsonResponse({'results': user_list})
    return JsonResponse({'results': []})