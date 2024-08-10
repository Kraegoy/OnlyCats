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

    // Ensure that `then` is not a future date
    if (now < then) {
        return 'In the future';
    }

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
    var like_class = comment.liked ? 'fas fa-heart' : 'far fa-heart';
    likeSpan.className = 'comment-like';
    likeSpan.innerHTML = `<i class="${like_class}"></i>`;  // like button

    
    likeSpan.setAttribute('data-post-id', comment.id);
    interactions.appendChild(likeSpan);


    var replySpan = document.createElement('span');
    replySpan.className = 'comment-reply';
    replySpan.innerHTML = '<i class="fas fa-reply"></i>';
    interactions.appendChild(replySpan);

    var likeCountSpan = document.createElement('span');
    likeCountSpan.className = 'comment-like-counts';
    likeCountSpan.setAttribute('id', `like-count-${comment.id}`);
    if (comment.likes > 0 && comment.likes > 1) {
    likeCountSpan.textContent = `${comment.likes} likes`;    // like counts span
    }
    if (comment.likes == 1) {
        likeCountSpan.textContent = `${comment.likes} like`;    // like counts span
    }
    interactions.appendChild(likeCountSpan);

    var repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies-container';



    // Recursively create and append replies
    if (Array.isArray(comment.replies)) {
        comment.replies.forEach(function(reply) {
            var replyElement = createCommentElement(reply);
            repliesContainer.appendChild(replyElement);
           
        });
    }

    likeSpan.addEventListener('click', function() {
        handleCommentLike(comment.id);
    });
    

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
                <div class="post-comments-container1" id="post-comments-container1">
                    <span class="emoji-post-button">
                        <img src="/media/logos/cat-emoji.svg" alt="Emoji Icon" class="cat-emoji"/>
                        <span class="emoji-close-button"><i class="fas fa-times"></i></span>
                    </span>     
                    <div placeholder="Add a comment..." class="comment-input" style="overflow-y:scroll;"></div>
                    <span class="comment-post-button">Post</span>
                </div>
            `;

            

            document.getElementById('post-info-container').innerHTML = postInfoHtml;
            document.getElementById('interact-to-post').innerHTML = interactToPost;
            document.getElementById('post-img-container').querySelector('img').src = postDetailsData.image;

            // Clear previous comments
            var commentsContainer = document.getElementById('post-comments-container');
            commentsContainer.innerHTML = '';

            const commentInput = document.querySelector('.comment-input');
            const commentPostButton = document.querySelector('.comment-post-button');

           
            // Initialize EmojiOneArea after content is inserted
            $(document).ready(function() {
                $(".comment-input").emojioneArea({
                    pickerPosition: "top",
                    emojiPlaceholder: ":smile_cat:",
                    events: {
                        initialized: function() {
                            // Store EmojiOneArea instance in window object
                            window.commentInput = $(this).data("emojioneArea");
                            console.log('EmojiOneArea initialized:', window.commentInput); 
                                                     
                        }
                    }
                });

                

                // Function to clear text
                function clearEmojiOneArea() {
                    var editor = $('.comment-input').data('emojioneArea');
                    if (editor) {
                        editor.setText('');
                    }
                }
            
                // for comment post button
                const commentPostButton = document.querySelector('.comment-post-button');
                if (commentPostButton) {
                    commentPostButton.addEventListener('click', function() {
                        handleCommentSubmission(postDetailsData.id);
                        clearEmojiOneArea();
                    });
                } else {
                    console.error('Comment post button not found.');
                }

                document.addEventListener('keydown', function(event) {
                    // Check if Enter key is pressed
                    if (event.key === 'Enter') {
                        // Check if an editable element or input field is focused
                        if (document.activeElement.matches('.emojionearea-editor')) {
                            // Your code here
                            console.log('Enter key pressed in focused element');
                            // Prevent the default action if needed
                            event.preventDefault();
                            handleCommentSubmission(postDetailsData.id);
                            clearEmojiOneArea();
                        }
                    }
                });

               

                           

                
            });

            

            // Add new comments
            postDetailsData.comments.forEach(function(comment) {
                if (!comment.parent) { // Only parent comments
                    var commentElement = createCommentElement(comment);
                    commentsContainer.appendChild(commentElement);
                }
            });

            // Add event listener to the like button
            document.querySelector('.like-button').addEventListener('click', function() {
                handlePostLike(postDetailsData.id);
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


function handlePostLike(postId) {
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


function handleCommentLike(commentId) {
    if (!commentId) {
        console.error('Invalid post ID');
        return;
    }

    fetch(`/like-comment/${commentId}/`, {
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
        const likeCountElement = document.getElementById(`like-count-${commentId}`);
        const likeButton = document.querySelector(`[data-post-id="${commentId}"] i`);

       // Update the like count display
        if (data.likes_count == 1) {
            likeCountElement.textContent = `${data.likes_count} like`;
        } else if (data.likes_count > 1) {
            likeCountElement.textContent = `${data.likes_count} likes`;
        } else {
            likeCountElement.textContent = ``;
        }

        // Update the like button icon
        if (data.liked) {
            likeButton.className = 'fas fa-heart'; // Filled heart icon
        } else {
            likeButton.className = 'far fa-heart'; // Outline heart icon
        }
    })
    .catch(error => console.error('Error liking the post:', error));
}


function saveComment(postId, content) {
    return fetch(`/ajax/add-comment/${postId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken('csrftoken') // CSRF token for security
        },
        body: JSON.stringify({
            content: content
        })
    })
    .then(response => response.json());
}


function updateComments(newComments) {
    const commentsContainer = document.querySelector('.post-comments-container');

    // Append new comments
    newComments.forEach(function(comment) {
        if (!comment.parent) { // Only parent comments
            var commentElement = createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
        }
    });
}

function handleCommentSubmission(postId) {
    const commentInput = document.querySelector('.emojionearea-editor');
    const content = commentInput.textContent.trim(); // Get the content from the div

    if (content === '') {
        return;
    }

    saveComment(postId, content) // Pass the content and postId to saveComment function
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Update comments with the new comment
                updateComments([data.comment]); // Assuming the server returns the new comment only
                commentInput.textContent = ''; // Clear the comment input
            }
        })
        .catch(error => console.error('Error:', error));
}
