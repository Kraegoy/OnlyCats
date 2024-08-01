from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default='profile_pics/default.png')
    bio = models.TextField(max_length=500, blank=True)
    website = models.URLField(max_length=200, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
      # ManyToMany fields to handle following and followers
    following = models.ManyToManyField(User, related_name='following_profiles', blank=True)
    followers = models.ManyToManyField(User, related_name='followers_profiles', blank=True)

    def __str__(self):
        return self.user.username