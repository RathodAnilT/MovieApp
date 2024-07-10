const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const HINDI_API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&with_original_language=hi&page=`;
const HOLLYWOOD_API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&with_original_language=en&page=`;
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const VIDEO_API = 'https://api.themoviedb.org/3/movie'; // API endpoint to fetch movie details

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const btnHindi = document.getElementById('btnHindi');
const btnHollywood = document.getElementById('btnHollywood');

let hindiPage = 1;
let hollywoodPage = 1;
let currentCategory = 'Hindi Movies';
let isFetching = false;

// Initial load of movies
getMovies(HINDI_API_URL + hindiPage, 'Hindi Movies');
getMovies(HOLLYWOOD_API_URL + hollywoodPage, 'Hollywood Movies');

async function getMovies(url, category) {
    isFetching = true;
    const res = await fetch(url);
    const data = await res.json();

    showMovies(data.results, category);
    isFetching = false;
}

async function showMovies(movies, category) {
    let section = document.querySelector(`.${category.replace(/\s/g, '')}-section`);
    
    if (!section) {
        section = document.createElement('section');
        section.classList.add('movie-section', `${category.replace(/\s/g, '')}-section`);

        const title = document.createElement('h2');
        title.innerText = category;
        section.appendChild(title);

        main.appendChild(section);
    }

    movies.forEach(async (movie) => {
        const { title, poster_path, vote_average, overview, id } = movie;

        // Fetch additional details including trailer
        const detailsUrl = `${VIDEO_API}/${id}/videos?api_key=${API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();
        const trailerKey = detailsData.results.length > 0 ? detailsData.results[0].key : '';

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');

        movieEl.innerHTML = `
            <img src="${IMG_PATH + poster_path}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${vote_average}</span>
            </div>
            <div class="overview">
                <h3>Overview</h3>
                ${overview}
                <br>
                <button class="trailer-btn" data-id="${id}">Watch Trailer</button>
            </div>
        `;
        section.appendChild(movieEl);

        // Add event listener for trailer button
        const trailerBtn = movieEl.querySelector('.trailer-btn');
        trailerBtn.addEventListener('click', () => openTrailerModal(trailerKey));
    });
}

function getClassByRate(vote) {
    if (vote >= 8) {
        return 'green';
    } else if (vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}

btnHindi.addEventListener('click', () => {
    main.innerHTML = '';
    hindiPage = 1;
    currentCategory = 'Hindi Movies';
    getMovies(HINDI_API_URL + hindiPage, 'Hindi Movies');
});

btnHollywood.addEventListener('click', () => {
    main.innerHTML = '';
    hollywoodPage = 1;
    currentCategory = 'Hollywood Movies';
    getMovies(HOLLYWOOD_API_URL + hollywoodPage, 'Hollywood Movies');
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value.trim();

    if (searchTerm && searchTerm !== '') {
        searchMovies(SEARCH_API + searchTerm);
        search.value = '';
    } else {
        main.innerHTML = '';
        getMovies(HINDI_API_URL + hindiPage, 'Hindi Movies');
        getMovies(HOLLYWOOD_API_URL + hollywoodPage, 'Hollywood Movies');
    }
});

async function searchMovies(url) {
    const res = await fetch(url);
    const data = await res.json();

    main.innerHTML = '';

    if (data.results.length === 0) {
        const noResults = document.createElement('div');
        noResults.classList.add('no-results');
        noResults.innerText = 'No movies found';
        main.appendChild(noResults);
    } else {
        showMovies(data.results, 'Search Results'); // Display search results
    }
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isFetching) {
        if (currentCategory === 'Hindi Movies') {
            hindiPage++;
            getMovies(HINDI_API_URL + hindiPage, 'Hindi Movies');
        } else if (currentCategory === 'Hollywood Movies') {
            hollywoodPage++;
            getMovies(HOLLYWOOD_API_URL + hollywoodPage, 'Hollywood Movies');
        }
    }
});

function openTrailerModal(trailerKey) {
    if (trailerKey) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${trailerKey}`;
        window.open(youtubeUrl, '_blank');
    } else {
        alert('Trailer not available');
    }
}
