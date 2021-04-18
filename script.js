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
    fetch(searchURL + searchInput.value)
    .then(r => r.json())
    .then(data => data.forEach(show => searchResults(show)))
    e.preventDefault()
}

function searchResults(show) {
    let title = 'Name: ' + show.show.name
    let genre = 'Genre: ' + show.show.genres.toString()
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
}