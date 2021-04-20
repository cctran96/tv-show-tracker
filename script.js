const localURL = 'http://localhost:3000/favorites/'
const commentURL = 'http://localhost:3000/comments'
const imgNotFound = 'https://st3.depositphotos.com/1322515/35964/v/600/depositphotos_359648638-stock-illustration-image-available-icon.jpg'

// initializes favorites menu
fetchFavorites().then(data => data.forEach(show => pinFavorites(show))).catch(catchFavoritesError())

// current user and previous search result
let currentUser = {
    "id": 6,
    "name": "ShaquilleOatmeal",
    "pic": "https://avatars.sched.co/a/55/6166123/avatar.jpg?5f4"
  }
let previousSearch = ''

// selectors
const searchBar = document.querySelector('#search-bar')
const searchInput = document.querySelector('#search')
const pinnedShows = document.querySelector('#tv-shows')
const showInfo = document.querySelector('#show-info')

// adds event listener to the searchbar
searchBar.addEventListener('submit', handleSubmit)

// populates search results on page
function handleSubmit(e) {
    e.preventDefault()

    showInfo.innerHTML = ''
    previousSearch = searchInput.value
    fetchShowSearchResults(searchInput.value)
    .then(data => data.forEach(show => showInfo.appendChild(searchResults(show.show))))

    e.target.reset()
}

// returns a new div containing a show details
function searchResults(show) {
    const container = document.createElement('div')
    const text = document.createElement('div')
    const img = document.createElement('img')
    const showName = document.createElement('h3')
    const showGenre = document.createElement('h3')
    const showRating = document.createElement('h3')
    const showLanguage = document.createElement('h3')
    const showRun = document.createElement('h3')
    const button = document.createElement('button')

    let genre = `${(show.genres.length > 1)? 'Genres:' : 'Genre:'} ${(show.genres.length)? show.genres.join(', ') : 'Unavailable'}`
    let language = `Language: ${show.language}`
    let runtime = `${(show.runtime)? show.runtime + ' minutes': 'Unavailable'}`
    runtime = `Runtime: ${(show.averageRuntime)? Math.round(show.averageRuntime/10)*10 + ' minutes': runtime}`
    let image = (show.image)? show.image.medium : imgNotFound
    let rating = `Rating: ${(show.rating.average)? show.rating.average : 'Unavailable'}`

    container.classList = 'card'
    text.classList = 'text'
    img.src = image
    img.classList = show.id
    img.addEventListener('click', event => showDetails(show.id))
    showName.innerText = show.name
    showGenre.innerText = genre
    showRating.innerText = rating
    showLanguage.innerText = language
    showRun.innerText = runtime
    changeButtonText(button, show.id)
    button.classList = show.id
    button.id = show.name
    button.addEventListener('click', handleFavorites)
    text.append(showName, showGenre, showRating, showLanguage, showRun, button)
    container.append(img, text)
    
    return container
}

// searches through favorites list and edits the pin button text correctly on search result
function changeButtonText(button, showId) {
    fetchFavorites().then(shows => {
        for (let i = 0; i < shows.length; i++) {
            if (shows[i].showId == showId) {
                button.innerText = 'Remove from favorites'
                break
            } else {
                button.innerText = 'Pin to Favorites'
            }
        }
    }).catch(button.innerText = 'Pin to Favorites')
}

// appends a show's details to the information pane
function showDetails(id) {
    fetchShowDetails(id)
    .then(details => {
        showInfo.innerText = ''
        showInfo.appendChild(searchResults(details))
        
        let parser = new DOMParser()
        let summary = parser.parseFromString(details.summary, 'text/html').querySelector('p')

        createBackButton()

        let castHeader = document.createElement('h2')
        castHeader.innerText = 'Cast'

        let castList = document.createElement('ul')
        details._embedded.cast.forEach(castMember => {
            castList.appendChild(createCastMemberCard(castMember))
        })

        showInfo.append(summary, commentDetails(id), castHeader, castList)
    })
}

// returns a new li element containg cast member details
function createCastMemberCard(castMember) {
    let li = document.createElement('li')

    let img = document.createElement('img')
    img.src = castMember.person.image.medium

    let text = document.createElement('p')
    text.innerHTML = `<em>${castMember.person.name}</em><br>as ${castMember.character.name}`

    li.appendChild(img)
    li.appendChild(text)

    return li
}

// fetch search results for a given show title
function fetchShowSearchResults(searchString) {
    const showSearchEndpoint = 'http://api.tvmaze.com/search/shows?q='
    return fetch(showSearchEndpoint + searchString).then(resp => resp.json())
}

// fetch details of a given show including cast members from tvmaze
function fetchShowDetails(id) {
    const castURL = `http://api.tvmaze.com/shows/${id}?embed=cast`
    return fetch(castURL).then(r => r.json())
}

// fetch favorites 
function fetchFavorites() {
    return fetch(localURL).then(r => r.json())
}
// creates li element for a favorite show and appends it to sidebar
function pinFavorites(favorites) {
    const li = document.createElement('li')
    const button = document.createElement('button')
    button.innerText = 'X'
    button.addEventListener('click', unpinFromSide)
    li.innerText = favorites.name
    li.classList = favorites.showId
    li.id = favorites.id
    li.addEventListener('click', event => {
        if (event.target.classList.contains(favorites.showId)) {
            showDetails(favorites.showId)
            previousSearch = 'emptysearch'
        }
    })
    li.appendChild(button)
    pinnedShows.appendChild(li)
}

// displays an error message on sidebar when unable to fetch favorites from local server
function catchFavoritesError() {
    const pinnedShows = document.querySelector('#tv-shows')
    const h4 = document.createElement('h4')
    h4.innerText = 'Unable to load favorites. Please check the server and refresh the page.'
    pinnedShows.replaceWith(h4, pinnedShows)
}

// 
function handleFavorites() {
    const obj = {
        name: this.id,
        showId: parseInt(this.classList.value),
    }

    fetchFavorites().then(shows => filterFavorites(obj, shows)).catch(alert('The Favorites menu is not responding. Please check the server and refresh the page.'))
}

// changes function of pinning button and edits the text inside
function filterFavorites(obj, shows) {
    let button = document.getElementById(obj.name)
    let foundId = 0
    for (let i = 0; i < shows.length; i++) {
        if (shows[i].showId == obj.showId) {
            foundId = shows[i].id
            break
        }
    }
    if (foundId) {
        removeFavorites(foundId)
        let show = document.getElementById(foundId)
        button.innerText = 'Pin to favorites'
        show.remove()
    } else {
        addFavorites(obj)
        button.innerText = 'Remove from favorites'
    }
}

// creates config obj to be used in updating info on the server
function createPostConfig(obj) {
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(obj)
    }
    return config
}

// adds new favorite show to the server and updates the favorites list on the DOM
function addFavorites(obj) {
    fetch(localURL, createPostConfig(obj)).then(r => r.json()).then(data => pinFavorites(data))
}

// removes favorite show from the server
function removeFavorites(id) {
    return fetch(localURL + id, {method: 'DELETE'})
}

// removes favorite show from the server and updates the favorites list on the DOM
function unpinFromSide() {
    removeFavorites(this.parentNode.id)
    .then(data => this.parentNode.remove())
}

// creates a back button after clicking a show for additional info
function createBackButton() {
    let cardInfo = document.querySelector('.text')
    const button = document.createElement('button')
    button.innerText = 'Go back'
    button.addEventListener('click', previousSearchResult)
    cardInfo.appendChild(button)
}

// returns the page to the previous search result
function previousSearchResult() {
    showInfo.innerHTML = ''
    fetchShowSearchResults(previousSearch)
    .then(data => data.forEach(show => showInfo.appendChild(searchResults(show.show))))
}

// fetches and returns all comment data from the server
function fetchComments() {
    return fetch(commentURL).then(r => r.json())
}

// fetches and returns all user data from the server
function fetchUser() {
    const userURL = 'http://localhost:3000/users'
    return fetch(userURL).then(r => r.json())
}

// creates and returns comment section with existing comments
function commentDetails(showId) {
    const commentSection = document.createElement('div')
    const commentHeading = document.createElement('h2')
    const commentForm = document.createElement('form')
    const submitBox = document.createElement('input')
    const submitButton = document.createElement('input')
    const commentList = document.createElement('ul')
    const noCommentYet = document.createElement('li')

    submitBox.placeholder = 'Add a new comment...'
    submitBox.type = 'text'
    submitBox.classList = showId
    submitButton.type = 'submit'
    submitButton.value = 'Submit'
    commentHeading.innerText = 'Comments'
    commentSection.id = 'comments'
    commentList.id = 'comment-list'
    noCommentYet.innerText = 'No comments yet...'
    addCommentsToPage(commentList, showId)

    commentForm.addEventListener('submit', handleNewComment)
    commentForm.append(submitBox, submitButton)
    commentList.appendChild(noCommentYet)
    commentSection.append(commentHeading, commentList, commentForm)
    return commentSection
}

// adds existing comments from server to comment section for specific show
function addCommentsToPage(list, showId) {
    fetchComments().then(comments => comments.forEach(comment => {
        if (comment.showId === showId) {
            list.innerHTML = ''
            fetchUser().then(users => {
                const li = document.createElement('li')
                let userInfo = users.find(user => user.id === comment.user)
                let img = document.createElement('img')
                img.src = userInfo.pic
                let p = document.createElement('p')
                p.innerHTML = `<strong>${userInfo.name}</strong><br>${comment.comment}`
                li.append(img, p)
                list.appendChild(li)
            })
        }
    }))
}

// creates comment obj to send to server using what user inputs
function handleNewComment(e) {
    const obj = {
            showId: parseInt(this.firstChild.classList.value),
            user: currentUser.id,
            comment: this.firstChild.value
    }

    e.preventDefault()
    postNewComment(obj)
    e.target.reset()
}

// sends comment obj to local server and updates DOM
function postNewComment(obj) {
    fetch(commentURL, createPostConfig(obj)).then(r => r.json()).then(data => {
        const list = document.querySelector('#comment-list')
        addCommentsToPage(list, data.showId)
    })
}