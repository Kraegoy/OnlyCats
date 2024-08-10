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
    
const searchView = document.querySelector('.search-container');

function showMessages(){
    messages = true;
    messagesContainer.style.marginTop = '-20vh';
    navBar.style.display = "none";
    searchView.style.display = 'none';
}

function hideMessages(){
    messages = false;
    navBar.style.display = "block";
    messagesContainer.style.marginTop = '100vh';
}

function showSearchView(mobile=false){
    const searchView = document.querySelector('.search-container');
    searchView.style.display = 'block';
    document.body.style.overflow = 'hidden';

    if(mobile){
        const nav_search_container = document.querySelector('.nav-search');
        nav_search_container.classList.add('nav-search-mobile');
        nav_search_container.style.display = 'block';
        const nav_search_input = document.querySelector('.toshowlater');
        nav_search_input.style.display = 'block';
    }

}


document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-user-input');
    const resultsContainer = document.getElementById('search-results-container');

    searchInput.addEventListener('input', function() {
        const query = searchInput.value;
        if (query.length === 0) {
            resultsContainer.innerHTML = ''; 
            
            // Create a temporary container to hold the HTML string
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = `
                <div class="cat">
                    <div class="ear ear--left"></div>
                    <div class="ear ear--right"></div>
                    <div class="face">
                        <div class="eye eye--left">
                            <div class="eye-pupil"></div>
                        </div>
                        <div class="eye eye--right">
                            <div class="eye-pupil"></div>
                        </div>
                        <div class="muzzle"></div>
                    </div>
                </div>
                <div class="search-caption">
                    Searching User...
                </div>
            `;
        
            // Append the temporary container's content to resultsContainer
            resultsContainer.appendChild(tempDiv); 
            return;
        }
        

        

        fetch(`/search_users/?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                resultsContainer.innerHTML = ''; 

                if(data.results.length === 0){
                    resultsContainer.innerHTML = ''; 
                    
                    const caption = document.createElement('div');
                    caption.classList.add('search-caption'); 
                    caption.textContent = 'No user found';
                    
                    resultsContainer.appendChild(caption); 
                    return;
                }

                data.results.forEach(user => {
                    const search_result = document.createElement('div');
                    search_result.classList.add('search-result');

                    const user_result = document.createElement('a');
                    user_result.classList.add('user-result');
                    user_result.href = `/user/${user.id}`;
                    search_result.appendChild(user_result);

                    const user_profile_pic = document.createElement('img');
                    user_profile_pic.src = ` /media/${user.userprofile__profile_picture}`; 
                    user_profile_pic.classList.add('search-profile-pic');
                    user_result.appendChild(user_profile_pic); // Append to user_result

                    const user_info = document.createElement('div');
                    user_info.classList.add('search-username');
                    
                    const username = document.createElement('div');
                    username.classList.add('username1');
                    username.textContent = `${user.first_name} ${user.last_name}`; // Correct the property access
                    user_info.appendChild(username);

                    const username_light = document.createElement('div');
                    username_light.classList.add('username-light');
                    username_light.textContent = `${user.username}`;
                    user_info.appendChild(username_light);

                    const followingStatus = user.is_following ? 'Following' : '';

                    if (followingStatus) {
                        const following = document.createElement('div');
                        following.classList.add('username-light');
                        following.textContent = followingStatus;
                        user_info.appendChild(following);
                    }

                    user_result.appendChild(user_info); // Append to user_result
                    resultsContainer.appendChild(search_result); // Append to resultsContainer
                });
            });
    });
});


function hideSearchView(){

    const searchView = document.querySelector('.search-container');
    const nav_search_input = document.querySelector('.nav-search-mobile');
    if(nav_search_input){
        nav_search_input.style.display = 'none';
    }

    searchView.style.display = 'none';
    document.body.style.overflow = 'scroll';
}