document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const input = document.querySelector("#search");
    const favContainer = document.querySelector(".fav-container");
    const filterBtn = document.getElementById("filter-btn");
    const topSuggestions = document.querySelector(".top-suggestions");
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'), {
        backdrop: false
    });
    
    let movies = [];

    filterBtn.addEventListener("click", function () {
        filterModal.show();
    });

    document.getElementById("newest-first").addEventListener("click", function () {
        // Sort movies based on release date (newest first)
        const sortedMovies = sortByNewest(movies);
        displayMovies(sortedMovies);
        filterModal.hide();
    });

    document.getElementById("oldest-first").addEventListener("click", function () {
        // Sort movies based on release date (oldest first)
        const sortedMovies = sortByOldest(movies);
        displayMovies(sortedMovies);
        filterModal.hide();
    });

     // Function to sort movies based on release date (newest first)
     function sortByNewest() {
        return movies.sort((a, b) => new Date(b.Year) - new Date(a.Year));
    }

    // Function to sort movies based on release date (oldest first)
    function sortByOldest() {
        return movies.sort((a, b) => new Date(a.Year) - new Date(b.Year));
    }


    function fetchRandomMovies(word) {
        fetch(`https://www.omdbapi.com/?s=${word}&type=movie&apikey=a09fd492`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === "True" && data.Search) {
                    // Randomly select 5 movies from the fetched results
                    const randomMovies = getRandomSelection(data.Search, 6);
                    fetchDetailedMovies(randomMovies);
                } else {
                    // If no movies are found, display a message
                    favContainer.innerHTML = "<p>No results found for this word in the title.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                favContainer.innerHTML = "<p>Something went wrong. Please try again later.</p>";
            });
    }
  
    // Function to get a random selection from an array
    function getRandomSelection(array, count) {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Array of movie genres
    const moviewords = ["Action", "Comedy", "Drama", "Horror", "Romance", "Thriller", "Adventure","Chennai","Punjab","India"];

    // Get a random genre from the array
    const randomword = moviewords[Math.floor(Math.random() * moviewords.length)];
    console.log("Random Word:", randomword);

    // Fetch random movies based on the random genre
    fetchRandomMovies(randomword);

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const searchTerm = input.value.trim();
        if (searchTerm !== "") {
            filterBtn.style.display = "inline-block";
            topSuggestions.style.display = "none";
            fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=a09fd492`)
                .then(response => response.json())
                .then(data => {
                    if (data.Response === "True") {
                        movies = data.Search;
                        fetchDetailedMovies(data.Search);
                    } else {
                        favContainer.innerHTML = "<p>No results found.</p>";
                    }
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                    favContainer.innerHTML = "<p>Something went wrong. Please try again later.</p>";
                });
        }
    });

    function fetchDetailedMovies(movies) {
        const promises = movies.map(movie => {
            return fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=a09fd492`)
                .then(response => response.json());
        });

        Promise.all(promises)
            .then(detailedMovies => {
                displayMovies(detailedMovies);
            })
            .catch(error => {
                console.error("Error fetching detailed movie data:", error);
                favContainer.innerHTML = "<p>Something went wrong. Please try again later.</p>";
            });
    }

    function displayMovies(movies) {
        favContainer.innerHTML = "";
        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");
            movieCard.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title}" />
                <h3>${movie.Title}</h3>
                <p>Year: ${movie.Year}</p>
                <p>Genre: ${movie.Genre}</p>
                <p>Actors: ${movie.Actors}</p>
                <button class="add-to-watchlist-btn" data-imdbid="${movie.imdbID}">
                    <i class="fas fa-plus"></i> <!-- Plus icon for watchlist -->
                </button>
            `;
            // Add event listener to each movie card
            movieCard.addEventListener("click", function () {
                // Redirect to a new page with movie details
                window.location.href = `movie_details.html?imdbID=${movie.imdbID}`;
            });

            // Add event listener for adding to watchlist
            const addToWatchlistBtn = movieCard.querySelector(".add-to-watchlist-btn");
            addToWatchlistBtn.addEventListener("click", function (event) {
                event.stopPropagation(); // Prevent click event from bubbling up to the movie card
                const added = addToWatchlist(movie); // Function to add movie to watchlist
                if (added) {
                    // Style the button to indicate it has been added to watchlist
                    addToWatchlistBtn.classList.add("added-to-watchlist");
                    // Show feedback to the user
                    alert("Movie added to watchlist!");
                } else {
                    // Show feedback if the movie is already in watchlist
                    alert("Movie is already in watchlist!");
                }
            });

            favContainer.appendChild(movieCard);
        });

        // Check local storage for movies already in watchlist and style the buttons accordingly
        const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        watchlist.forEach(movie => {
            const addToWatchlistBtn = document.querySelector(`.add-to-watchlist-btn[data-imdbid="${movie.imdbID}"]`);
            if (addToWatchlistBtn) {
                addToWatchlistBtn.classList.add("added-to-watchlist");
            }
        });
    }

    function addToWatchlist(movie) {
        // Retrieve watchlist from local storage
        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        
        // Check if the movie is already in the watchlist
        const existingMovie = watchlist.find(item => item.imdbID === movie.imdbID);
        
        // If the movie is not already in the watchlist, add it
        if (!existingMovie) {
            watchlist.push(movie);
            
            // Store the updated watchlist in local storage
            localStorage.setItem("watchlist", JSON.stringify(watchlist));

            return true;
        }

        return false;
    }

});
