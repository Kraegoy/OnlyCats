const editProfileForm = document.getElementById('edit-profile-form-container');
const editProfileFormOverlay = document.getElementById('edit-profile-form-overlay');

const showEditProfileForm = () => {
    editProfileForm.style.display = 'block';
    editProfileFormOverlay.style.display = 'block';
}

const hideEditProfileForm = () => {
    editProfileForm.style.display = 'none';
    editProfileFormOverlay.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const profilePictureInput = document.getElementById('profile_picture');
    const profilePicturePreview = document.getElementById('profile_picture_preview');

    // Ensure the initial profile picture is displayed if available
    const initialSrc = profilePicturePreview.src;
    if (initialSrc) {
        profilePicturePreview.style.display = 'block';
    } else {
        profilePicturePreview.style.display = 'none';
    }

    profilePictureInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePicturePreview.src = e.target.result;
                profilePicturePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            // Reset to original image if no file is selected
            profilePicturePreview.src = initialSrc || '';
            profilePicturePreview.style.display = 'block'; 
        }
    });
});



function hidePostDetails(){
    const postDetails = document.querySelector('.post-details-container');
    const postDetailsOverlay = document.querySelector('.post-details-overlay');
    postDetails.style.display = 'none';
    postDetailsOverlay.style.display = 'none';
}

function showPostDetails(postId) {
    const postDetails = document.querySelector('.post-details-container');
    const postDetailsOverlay = document.querySelector('.post-details-overlay');
    postDetails.style.display = 'flex';
    postDetailsOverlay.style.display = 'block';
    event.preventDefault(); // Prevent default link behavior

    // Create an XMLHttpRequest object
    var xhr = new XMLHttpRequest();
    
    // Configure it: GET-request for the URL /ajax/post-details/{postId}/
    xhr.open('GET', '/ajax/post-details/' + postId + '/', true);
    
    // Set up a function to handle the response
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            var postDetails = JSON.parse(xhr.responseText);

            var postInfoHtml = `
                <div class="post-info">
                    <img src="${postDetails.user_profile_picture}" alt="User Profile Picture" class="post-profile-pic"/>
                    <p class="post-username">${postDetails.user}</p>
                    <p class="post-date">${formatTimeAgo(postDetails.created_at)}</p>
                    <p class="post-follow"><a href="#">Follow</a></p>
                    <span class="post-details-ellipsis"><i class="fas fa-ellipsis-h"></i></span>
                </div>
                <div class="post-caption">
                    <p class="caption-text" id="post-caption">${postDetails.caption}</p>
                </div>
            `;

            document.getElementById('post-info-container').innerHTML = postInfoHtml;

            // Update your page content
            document.getElementById('post-img-container').querySelector('img').src = postDetails.image;

            // Clear previous comments
            var commentsContainer = document.getElementById('post-comments-container');
            commentsContainer.innerHTML = '';

            // Add new comments
            postDetails.comments.forEach(function(comment) {
                var commentElement = document.createElement('div');
                commentElement.className = 'post-comment-container';
                commentElement.innerHTML = `
                    <div class="post-comment-user-details">
                        <img src="${comment.profile_picture}" alt="User Profile Picture" class="comment-profile-pic"/>
                        <span class="comment-text1">
                            <span class="comment-username">${comment.username}</span> ${comment.content}
                        </span>
                    </div>
                    <div class="comment-interactions-container">
                        <span class="comment-time">${formatTimeAgo(comment.created_at)}</span>
                        <span class="comment-like"><i class="far fa-heart"></i></span>
                        <span class="comment-reply"><i class="fas fa-reply"></i></span>
                        <span class="comment-like-counts">2m likes</span>
                    </div>
                `;
                commentsContainer.appendChild(commentElement);
            });

            // Show the post details container
        } else {
            console.error('Error fetching post details');
        }
    };
    
    // Send the request
    xhr.send();
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const then = new Date(dateString);
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 30) {
        const month = then.toLocaleString('default', { month: 'long' });
        const day = then.getDate();
        return `${month} ${day}`;
    } else if (days > 0) {
        return `${days}d ago`;
    } else if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return 'Just now';
    }
}
