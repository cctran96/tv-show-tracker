const localURL = 'http://localhost:3000/favorites/'
const imgNotFound = 'https://st3.depositphotos.com/1322515/35964/v/600/depositphotos_359648638-stock-illustration-image-available-icon.jpg'

// Initialize favorites menu
fetchFavorites().then(data => data.forEach(show => pinFavorites(show)))

// Selectors
const searchBar = document.querySelector('#search-bar')
const searchInput = document.querySelector('#search')
const pinnedShows = document.querySelector('#tv-shows')
const showInfo = document.querySelector('#show-info')

// Event listeners
searchBar.addEventListener('submit', handleSubmit)

// Functions
let previousSearch
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
    console.log(show)
    const container = document.createElement('div')
    const text = document.createElement('div')
    const img = document.createElement('img')
    const showName = document.createElement('h3')
    const showGenre = document.createElement('h3')
    const showRating = document.createElement('h3')
    const showLanguage = document.createElement('h3')
    const showRun = document.createElement('h3')
    const button = document.createElement('button')

    let title = show.name
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
    showName.innerText = title
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


// appends a show's details to the information pane
function showDetails(id) {
    fetchShowDetails(id)
    .then(details => {
        showInfo.innerText = ''
        showInfo.appendChild(searchResults(details))
        
        let parser = new DOMParser()
        let summary = parser.parseFromString(details.summary, 'text/html').querySelector('p')

        let comments = document.createElement('div')
        createBackButton()

        let castHeader = document.createElement('h2')
        castHeader.innerText = 'Cast'

        let castList = document.createElement('ul')
        details._embedded.cast.forEach(castMember => {
            castList.appendChild(createCastMemberCard(castMember))
        })

        showInfo.append(summary, comments, castHeader, castList)
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

function fetchFavorites() {
    return fetch(localURL)
    .then(r => r.json())
}

function pinFavorites(favorites) {
    const li = document.createElement('li')
    const button = document.createElement('button')
    button.innerText = 'X'
    button.addEventListener('click', unpinFromSide)
    li.innerText = favorites.name
    li.classList = favorites.showId
    li.id = favorites.id
    li.addEventListener('click', event => showDetails(favorites.showId))
    li.appendChild(button)
    pinnedShows.appendChild(li)
}

function handleFavorites() {
    const obj = {
        name: this.id,
        showId: this.classList.value,
    }

    fetchFavorites().then(shows => filterFavorites(obj, shows))
}

function filterFavorites(obj, shows) {
    let show = obj.name
    let button = document.getElementById(show)
    let found = false
    let foundId
    for (let i = 0; i < shows.length; i++) {
        if (shows[i].showId == obj.showId) {
            found = true
            foundId = shows[i].id
            break
        }
    }
    if (found === true) {
        removeFavorites(foundId)
        let show = document.getElementById(foundId)
        button.innerText = 'Pin to favorites'
        show.remove()
    } else {
        addFavorites(obj)
        button.innerText = 'Remove from favorites'
    }
}

function addFavorites(obj) {
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(obj)
    }

    fetch(localURL, config).then(r => r.json()).then(data => pinFavorites(data))
}

function removeFavorites(id) {
    fetch(localURL + id, {method: 'DELETE'})
}

function unpinFromSide() {
    removeFavorites(this.parentNode.id)
    this.parentNode.remove()
}

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
    })
}

function createBackButton() {
    let cardInfo = document.querySelector('.text')
    const button = document.createElement('button')
    button.innerText = 'Go back'
    button.addEventListener('click', previousSearchResult)
    cardInfo.appendChild(button)
}

function previousSearchResult() {
    showInfo.innerHTML = ''
    fetchShowSearchResults(previousSearch)
    .then(data => data.forEach(show => showInfo.appendChild(searchResults(show.show))))
}