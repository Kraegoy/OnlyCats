from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from .models import UserProfile, UserPost, Comment
from django.contrib.auth.decorators import login_required
from datetime import datetime
from django.db.models import Q
from django.views.decorators.http import require_POST
import json
from django.utils.dateformat import format



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


def ajax_post_details(request, id):
    if request.method == 'GET':
        userPost = get_object_or_404(UserPost, id=id)

        def serialize_comment(comment):
            # Log to verify the replies
            replies = comment.replies.all()
            
            liked = comment.likes.filter(id=user.id).exists()

            return {
                'id': comment.id,
                'user': comment.user.username,
                'profile_picture': comment.user.userprofile.profile_picture.url if comment.user.userprofile.profile_picture else '',
                'content': comment.content,
                'created_at': comment.created_at.isoformat(),  # ISO 8601 format
                'liked': liked,
                'likes': comment.likes.count(),
                'replies': [serialize_comment(reply) for reply in replies]  # Recursively serialize replies
            }

        comments = userPost.comments.filter(parent__isnull=True)  # Only parent comments
        user = request.user
        if userPost.likes.filter(id=user.id).exists():
            liked = False
        else:
            liked = True


        post_info = {
            'id': userPost.id,
            'image': userPost.image.url,
            'caption': userPost.caption,
            'created_at': userPost.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': userPost.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'user_profile_picture': userPost.user.userprofile.profile_picture.url if userPost.user.userprofile.profile_picture else '',
            'user': userPost.user.username,
            'comments': [serialize_comment(comment) for comment in comments],
            'likes': userPost.likes.count(),
            'liked': liked
        }


        return JsonResponse(post_info)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)



@require_POST
def like_post(request, post_id):
    post = get_object_or_404(UserPost, id=post_id)
    user = request.user

    if user.is_authenticated:
        if post.likes.filter(id=user.id).exists():
            post.remove_like(user)
            liked = False
        else:
            post.add_like(user)
            liked = True

        # Return JSON response with updated like count and status
        return JsonResponse({
            'liked': liked,
            'likes_count': post.likes.count()
        })
    else:
        return JsonResponse({'error': 'User not authenticated'}, status=401)


@require_POST
def like_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    user = request.user

    if user.is_authenticated:
        if comment.likes.filter(id=user.id).exists():
            comment.remove_like(user)
            liked = False
        else:
            comment.add_like(user)
            liked = True

        # Return JSON response with updated like count and status
        return JsonResponse({
            'liked': liked,
            'likes_count': comment.likes.count()
        })
        
    else:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
@login_required
@require_POST
def add_comment(request, post_id):
    try:
        data = json.loads(request.body)
        content = data.get('content', '')

        if not content.strip():
            return JsonResponse({'error': 'Comment cannot be empty'}, status=400)

        post = get_object_or_404(UserPost, id=post_id)
        comment = Comment.objects.create(
            user=request.user,
            post=post,
            content=content,
            parent=None
        )

        # Fetch the user profile and handle the case where it might not exist
        try:
            userprofile = comment.user.userprofile
            profile_picture_url = userprofile.profile_picture.url if userprofile.profile_picture else ''
        except UserProfile.DoesNotExist:
            profile_picture_url = ''  # Default to empty if UserProfile does not exist

        comment_data = {
            'id': comment.id,
            'user': comment.user.username,
            'profile_picture': profile_picture_url,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'likes': comment.likes.count(),
            'liked': request.user in comment.likes.all()
        }

        return JsonResponse({'comment': comment_data})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
