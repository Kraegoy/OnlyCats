const chatUserInfo = document.querySelector('.loaded-chat-user-info');
const loadedChat = document.querySelector('.loaded-chat');
const messagesInput = document.querySelector('.messages-input-input');

let userInfo = true;

function showUserInfo() {
    if (userInfo) {
        chatUserInfo.classList.remove('show');
        chatUserInfo.classList.add('hide');
        loadedChat.style.width = '67vw';
        userInfo = false;
    } else {
        chatUserInfo.classList.remove('hide');
        chatUserInfo.classList.add('show');
        loadedChat.style.width = '42vw';
        userInfo = true;
    }
}

// Ensure the correct styles are applied when the window is resized
window.addEventListener('resize', function() {
    if (window.innerWidth <= 647) {
        chatUserInfo.classList.remove('show');
        chatUserInfo.classList.add('hide');
        loadedChat.style.width = '100vw'; 
    } else {
        if (userInfo) {
            chatUserInfo.classList.remove('hide');
            chatUserInfo.classList.add('show');
            loadedChat.style.width = '42vw';
        } else {
            chatUserInfo.classList.remove('show');
            chatUserInfo.classList.add('hide');
            loadedChat.style.width = '67vw';
        }
    }
});
