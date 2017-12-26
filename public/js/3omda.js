var searchbar = document.getElementById('search');
var posts = document.querySelectorAll('.posts');
console.log("ahmed");
searchbar.addEventListener('keyup',function (e) {
    console.log("ramy");
    const term=e.target.value.toLowerCase();

    for (var i = 0, len = posts.length; i < len; i++) {
        console.log(i);
        if (posts[i].textContent.toLocaleLowerCase().indexOf(term)!=-1)
        {
            posts[i].style.display='block';

        }
        else{
            posts[i].style.display='none'
        }
    }

})