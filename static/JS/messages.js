const chatUserInfo = document.querySelector('.loaded-chat-user-info');
const loadedChat = document.querySelector('.loaded-chat');
const messagesInput = document.querySelector('.messages-input-input');


let userInfo = true;


function showUserInfo(){
    if(userInfo){
        chatUserInfo.style.display = 'none';
        loadedChat.style.width ='67vw';
        messagesInput.style.width = "48vw";
        userInfo = false;
    }
    else{
        chatUserInfo.style.display = 'block';
        loadedChat.style.width ='42vw';
        messagesInput.style.width = "23vw";
        userInfo = true;

    }

}