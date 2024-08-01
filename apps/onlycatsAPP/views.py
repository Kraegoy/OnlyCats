from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from apps.user.models import UserProfile
from apps.user.models import UserProfile
from django.core.exceptions import ValidationError

def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        first_name = request.POST['firstName']
        last_name = request.POST['lastName']
        email = request.POST['email']
        password = request.POST['password']
        confirm_password = request.POST['confirmPassword']
        
        if password != confirm_password:
            messages.error(request, "Passwords do not match!")
            return render(request, 'signup.html')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists!")
            return render(request, 'signup.html')
        
        # Create new user
        try:
            my_user = User.objects.create_user(username=username, email=email, password=password)
            my_user.first_name = first_name
            my_user.last_name = last_name
            my_user.save()
            UserProfile.objects.create(user=my_user)
            messages.success(request, "Account successfully created!")
            return redirect('login')
        
        except ValidationError as e:
            messages.error(request, f"Error: {e}")
            return render(request, 'signup.html')
    
    return render(request, 'signup.html')


def login(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data['username'] 
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                auth_login(request, user)
                return redirect('home')
    else:
        form = AuthenticationForm()
    
    return render(request, 'login.html', {'form': form})

@login_required
def home(request):
    username = request.user.username  # Directly access the username
    return render(request, 'home.html', {'username': username})

@login_required
def logout_view(request):
    logout(request)
    return redirect('login')