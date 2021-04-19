const localURL = 'http://localhost:3000/Favorites/'
const imgNotFound = 'https://st3.depositphotos.com/1322515/35964/v/600/depositphotos_359648638-stock-illustration-image-available-icon.jpg'

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
    fetchShowSearchResults(searchInput.value)
    .then(data => data.forEach(show => showInfo.appendChild(searchResults(show.show))))

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

    let title = show.name
    let genre = `${(show.genres.length > 1)? 'Genres:' : 'Genre:'} ${show.genres.join(', ')}`
    let language = `Language: ${show.language}`
    let runtime = 'Runtime: ' + show.runtime + ' minutes'
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
    button.innerText = 'Pin to Favorites'
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

        let castHeader = document.createElement('h2')
        castHeader.innerText = 'Cast'

        let castList = document.createElement('ul')
        details._embedded.cast.forEach(castMember => {
            castList.appendChild(createCastMemberCard(castMember))
        })

        showInfo.appendChild(summary)
        showInfo.appendChild(castHeader)
        showInfo.appendChild(castList)
    })
}

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

function getFavorites() {
    return fetch(localURL)
    .then(r => r.json())
}

function pinFavorites(favorites) {
    const li = document.createElement('li')
    li.innerText = favorites.name
    li.classList = favorites.showId
    li.id = favorites.id
    pinnedShows.appendChild(li)
}

function handleFavorites() {
    const obj = {
        name: this.id,
        showId: this.classList.value,
    }

    getFavorites().then(shows => {
        console.log(shows)
        for (show in shows) {
            console.log(show)
            if (show.showId == obj.showId) {
                removeFavorites(show.id)
            }
        }
    })
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

    fetch(localURL, config)
    .then(r => r.json())
    .then(data => pinFavorites(data))
}

function removeFavorites(id) {
    fetch(localURL + id, {method: 'DELETE'})
}