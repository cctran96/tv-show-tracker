const searchURL = 'http://api.tvmaze.com/search/shows?q='

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
    const button = document.createElement('button')

    let title = 'Name: ' + show.show.name
    let genre = 'Genre: ' + show.show.genres.toString()
    let language = 'Language: ' + show.show.language
    let image
    let rating
    if (show.show.image === null) {
        image = 'https://image.shutterstock.com/image-vector/no-user-profile-picture-hand-260nw-99335579.jpg'
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
    showName.innerText = title
    showGenre.innerText = genre
    showRating.innerText = rating
    showLanguage.innerText = language
    button.innerText = 'Pin to favorites'
    button.id = show.show.id
    text.append(showName, showGenre, showRating, showLanguage, button)
    container.append(img, text)
    showInfo.appendChild(container)
}