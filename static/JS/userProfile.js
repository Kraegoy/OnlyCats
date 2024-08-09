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



function createCommentElement(comment) {
    var commentElement = document.createElement('div');
    commentElement.className = 'post-comment-container';

    var userDetail = document.createElement('div');
    userDetail.className = 'post-comment-user-details';

    var userImg = document.createElement('img');
    userImg.src = comment.profile_picture;
    userImg.alt = 'User Profile Picture';
    userImg.className = 'comment-profile-pic';

    var userText = document.createElement('span');
    userText.className = 'comment-text1';

    var username = document.createElement('span');
    username.className = 'comment-username';
    username.textContent = comment.user;

    userText.appendChild(username);
    userText.appendChild(document.createTextNode(' ' + comment.content));

    userDetail.appendChild(userImg);
    userDetail.appendChild(userText);

    var interactions = document.createElement('div');
    interactions.className = 'comment-interactions-container';

    var commentTime = document.createElement('span');
    commentTime.className = 'comment-time';
    commentTime.textContent = formatTimeAgo(comment.created_at);
    interactions.appendChild(commentTime);

    var likeSpan = document.createElement('span');
    likeSpan.className = 'comment-like';
    likeSpan.innerHTML = '<i class="far fa-heart"></i>';
    interactions.appendChild(likeSpan);

    var replySpan = document.createElement('span');
    replySpan.className = 'comment-reply';
    replySpan.innerHTML = '<i class="fas fa-reply"></i>';
    interactions.appendChild(replySpan);

    var likeCountSpan = document.createElement('span');
    likeCountSpan.className = 'comment-like-counts';
    likeCountSpan.textContent = '2m likes'; // Update with actual like count if needed
    interactions.appendChild(likeCountSpan);

    var repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies-container';

    // Recursively create and append replies
    if (comment.replies) {
        comment.replies.forEach(function(reply) {
            var replyElement = createCommentElement(reply);
            repliesContainer.appendChild(replyElement);
        });
    }

    // Append user details, interactions, and replies to comment element
    commentElement.appendChild(userDetail);
    commentElement.appendChild(interactions);
    commentElement.appendChild(repliesContainer);

    return commentElement;
}

function showPostDetails(postId, event) {
    if (event) {
        event.preventDefault(); // Prevent default link behavior
    }

    const postDetails = document.querySelector('.post-details-container');
    const postDetailsOverlay = document.querySelector('.post-details-overlay');
    postDetails.style.display = 'flex';
    postDetailsOverlay.style.display = 'block';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', `/ajax/post-details/${postId}/`, true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            var postDetailsData = JSON.parse(xhr.responseText);

            var postInfoHtml = `
                <div class="post-info">
                    <img src="${postDetailsData.user_profile_picture}" alt="User Profile Picture" class="post-profile-pic"/>
                    <p class="post-username">${postDetailsData.user}</p>
                    <p class="post-date">${formatTimeAgo(postDetailsData.created_at)}</p>
                    <p class="post-follow"><a href="#">Follow</a></p>
                    <span class="post-details-ellipsis"><i class="fas fa-ellipsis-h"></i></span>
                </div>
                <div class="post-caption">
                    <p class="caption-text">${postDetailsData.caption}</p>
                </div>
            `;

            var interactToPost = `
                <div class="interact-buttons">
                    <span class="like-counts" id="like-count-${postDetailsData.id}">${postDetailsData.likes} likes</span>
                    <span class="like-button" data-post-id="${postDetailsData.id}">
                        <i class="${postDetailsData.liked ? 'far fa-heart' : 'fas fa-heart'}"></i>
                    </span>
                    <span class="comment-button"><i class="far fa-comment"></i></span>
                </div>
                <textarea placeholder="Add a comment..." class="comment-input"></textarea>
            `;

            document.getElementById('post-info-container').innerHTML = postInfoHtml;
            document.getElementById('interact-to-post').innerHTML = interactToPost;
            document.getElementById('post-img-container').querySelector('img').src = postDetailsData.image;

            // Clear previous comments
            var commentsContainer = document.getElementById('post-comments-container');
            commentsContainer.innerHTML = '';

            // Add new comments
            postDetailsData.comments.forEach(function(comment) {
                if (!comment.parent) { // Only parent comments
                    var commentElement = createCommentElement(comment);
                    commentsContainer.appendChild(commentElement);
                }
            });

            // Add event listener to the like button
            document.querySelector('.like-button').addEventListener('click', function() {
                handleLike(postDetailsData.id);
            });

        } else {
            console.error('Error fetching post details');
        }
    };
    xhr.send();
}

function getCsrfToken() {
    const csrfTokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfTokenElement ? csrfTokenElement.value : '';
}

document.addEventListener('click', function(event) {
    const likeButton = event.target.closest('.like-button');
    if (likeButton) {
        const postId = likeButton.getAttribute('data-post-id');
        handleLike(postId);
    }
});

function handleLike(postId) {
    if (!postId) {
        console.error('Invalid post ID');
        return;
    }

    fetch(`/like-post/${postId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({})
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.text().then(text => {
                throw new Error(`Server error: ${text}`);
            });
        }
    })
    .then(data => {
        const likeCountElement = document.getElementById(`like-count-${postId}`);
        const likeButton = document.querySelector(`[data-post-id="${postId}"] i`);

        if (data.liked) {
            likeCountElement.textContent = `${data.likes_count} likes`;
            likeButton.className = 'fas fa-heart'; // Filled heart icon
        } else {
            likeCountElement.textContent = `${data.likes_count} likes`;
            likeButton.className = 'far fa-heart'; // Outline heart icon
        }
    })
    .catch(error => console.error('Error liking the post:', error));
}
