from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default='profile_pics/default.png')
    bio = models.TextField(max_length=500, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
      # ManyToMany fields to handle following and followers
    following = models.ManyToManyField(User, related_name='following_profiles', blank=True)
    followers = models.ManyToManyField(User, related_name='followers_profiles', blank=True)

    def __str__(self):
        return self.user.username
      
class UserPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    image = models.ImageField(upload_to='user_posts/')
    caption = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    def __str__(self):
        return f"Post by {self.user.username} on {self.created_at}"

    def add_like(self, user):
        if not self.likes.filter(id=user.id).exists():
            self.likes.add(user)

    def remove_like(self, user):
        if self.likes.filter(id=user.id).exists():
            self.likes.remove(user)

    def get_comments(self):
        return self.comments.all()
      

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(UserPost, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')

    def __str__(self):
        return f"Comment by {self.user.username} on {self.created_at}"
    
    def add_like(self, user):
        if not self.likes.filter(id=user.id).exists():
            self.likes.add(user)

    def remove_like(self, user):
        if self.likes.filter(id=user.id).exists():
            self.likes.remove(user)
    class Meta:
        ordering = ['created_at']