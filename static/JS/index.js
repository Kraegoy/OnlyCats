let lastScrollTop = 0;
const navBar = document.querySelector('.nav-bar-container');
const sideContent = document.querySelector('.side-content');
const messagesContainer = document.querySelector('.messages-container');
let messages = false;

if(messages){
    navBar.classList.add('hidden');
}
    navBar.classList.remove('hidden');

    window.addEventListener('scroll', () => {
        if(!messages){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
            if (scrollTop > lastScrollTop) {
                // Scroll down
                navBar.classList.add('hidden');
                sideContent.style.top = "3em";
            } else {
                // Scroll up
                navBar.classList.remove('hidden');
                sideContent.style.top = "5em"
            }
            lastScrollTop = scrollTop;
        }
        
    });
    

function showMessages(){
    messages = true;
    messagesContainer.style.marginTop = '-20vh';
    navBar.style.display = "none";
 
}

function hideMessages(){
    messages = false;
    navBar.style.display = "block";
    messagesContainer.style.marginTop = '100vh';
}

const user_info_container = document.querySelector('.loggedin-user-profile');

function displayUserInfo(){
    fetch('display_user_info')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then( user_info => {
        
            const profile_pic = document.createElement('img')
            profile_pic.src = user_info.user_info.profile_picture
            profile_pic.alt = "user profile picture"

            const loggedin_username = document.createElement('span')
            loggedin_username.classList.add('loggedin-username')
            loggedin_username.textContent = `@ ${user_info.user_info.username}`

            const loggedin_user_fName = document.createElement('span')
            loggedin_user_fName.classList.add('loggedin-full-name')
            loggedin_user_fName.textContent = user_info.user_info.fullName

            user_info_container.appendChild(profile_pic)
            user_info_container.appendChild(loggedin_username)
            user_info_container.appendChild(loggedin_user_fName)
        }
    )
}

displayUserInfo()