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