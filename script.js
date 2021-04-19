const searchURL = 'http://api.tvmaze.com/search/shows?q='
const localURL = 'http://localhost:3000/Favorites'

// Initialize favorites menu
getFavorites().then(data => data.forEach(show => pinFavorites(show)))

// Selectors
const searchBar = document.querySelector('#search-bar')
const searchInput = document.querySelector('#search')
const pinnedShows = document.querySelector('#tv-shows')
const showInfo = document.querySelector('#show-info')

// Event listeners
searchBar.addEventListener('submit', handleSubmit)

// Functions
function handleSubmit(e) {
    e.preventDefault()
    showInfo.innerHTML = ''
    fetch(searchURL + searchInput.value)
    .then(r => r.json())
    .then(data => data.forEach(show => searchResults(show)))
    e.target.reset()
}

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

    let title = 'Name: ' + show.show.name
    let genre = 'Genre: ' + show.show.genres.toString()
    let language = 'Language: ' + show.show.language
    let runtime = 'Runtime: ' + show.show.runtime + ' minutes'
    let image
    let rating
    if (show.show.image === null) {
        image = 'https://st3.depositphotos.com/1322515/35964/v/600/depositphotos_359648638-stock-illustration-image-available-icon.jpg'
    } else {
        image = show.show.image.medium
    }
    if (show.show.rating.average === null) {
        rating = 'Rating: N/A'
    } else {
        rating = 'Rating: ' + show.show.rating.average
    }

    container.classList = 'card'
    text.classList = 'text'
    img.src = image
    img.classList = show.show.id
    img.addEventListener('click', showDetails)
    showName.innerText = title
    showGenre.innerText = genre
    showRating.innerText = rating
    showLanguage.innerText = language
    showRun.innerText = runtime
    button.innerText = 'Pin to favorites'
    button.classList = show.show.id
    button.id = show.show.name
    button.addEventListener('click', handleFavorites)
    text.append(showName, showGenre, showRating, showLanguage, showRun, button)
    container.append(img, text)
    showInfo.appendChild(container)
}

function showDetails() {
    const id = this.classList.value
    const castURL = `http://api.tvmaze.com/shows/${id}?embed=cast`
    fetch(castURL)
    .then(r => r.json())
    .then(data => console.log(data))
}

function getFavorites() {
    return fetch(localURL)
    .then(r => r.json())
}

function pinFavorites(favorites) {
    const li = document.createElement('li')
    li.innerText = favorites.name
    li.classList = favorites.showId
    pinnedShows.appendChild(li)
}

function handleFavorites() {
    const showName = this.id
    const showId = this.classList.value
    
    const obj = {
        name: showName,
        showId: showId,
    }
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(obj)
    }

    fetch(localURL, config)
    .then(r => r.json())
    .then(data => pinFavorites(data))
}