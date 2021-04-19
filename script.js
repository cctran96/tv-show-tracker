const searchURL = 'http://api.tvmaze.com/search/shows?q='
const localURL = 'http://localhost:3000/Favorites'

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
    .then(data => data.forEach(show => searchResults(show.show)))
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

    let title = 'Name: ' + show.name
    let genre = 'Genre: ' + show.genres.toString()
    let language = 'Language: ' + show.language
    let runtime = 'Runtime: ' + show.runtime + ' minutes'
    let image
    let rating
    if (show.image === null) {
        image = 'https://st3.depositphotos.com/1322515/35964/v/600/depositphotos_359648638-stock-illustration-image-available-icon.jpg'
    } else {
        image = show.image.medium
    }
    if (show.rating.average === null) {
        rating = 'Rating: N/A'
    } else {
        rating = 'Rating: ' + show.rating.average
    }

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
    button.innerText = 'Pin to favorites'
    button.classList = show.id
    button.id = show.name
    button.addEventListener('click', handleFavorites)
    text.append(showName, showGenre, showRating, showLanguage, showRun, button)
    container.append(img, text)
    showInfo.appendChild(container)
}


// appends a show's details to the information pane
function showDetails(id) {
    fetchShowDetails(id)
    .then(details => {
        console.log(details)
        showInfo.innerText = ''
        searchResults(details)
        
        let parser = new DOMParser()
        let summary = parser.parseFromString(details.summary, 'text/html').querySelector('p')

        showInfo.appendChild(summary)
    })
}

// fetch details of a given show from tvmaze
function fetchShowDetails(id) {
    const castURL = `http://api.tvmaze.com/shows/${id}?embed=cast`
    return fetch(castURL).then(r => r.json())
}

function pinFavorites() {
    fetch(localURL)
    .then(r => r.json())
    .then(data => console.log(data))
}

function handleFavorites() {
    const showName = this.parentNode.firstChild.innerText.toString()
    const showId = this.classList.value
    
    const obj = {
        Name: this,
        showId: this.classList.value,
    }
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(obj)
    }
}