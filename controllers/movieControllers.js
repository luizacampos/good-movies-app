const axios = require("axios").default;
const { findByIdAndMap } = require("../helpers/findByIdAndMap");
const getDataRedisOrApi = require("../helpers/getDataRedisOrApi");
const User = require("../models/User");

const rapidApiHeaders = {
    "x-rapidapi-host": "data-imdb1.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPID_API_KEY,
};

// FOR LANDING PAGE - after login:
// **************************************
// GET upcoming movies - limited to 6
const upcomingMovies = async (req, res) => {
    let options = {
        method: "GET",
        url: "https://data-imdb1.p.rapidapi.com/movie/order/upcoming/",
        headers: rapidApiHeaders,
    };

    // getting Upcoming Movies with little data (title, imdb_id, release date)
    // limit to 6 movies + pagination
    axios
        .request(options)
        .then(async (response) => {
            const upcomingAll = await Object.values(response.data)[0];
            const numberOfMovies = upcomingAll.length;

            const upcomingAllCleaned = upcomingAll.filter(
                (movie) =>
                    movie.imdb_id !== "tt9115530" &&
                    movie.imdb_id !== "tt10838180"
            );

            const page = req.params.page - 1;
            const limit = 6;
            const numberOfPages = Math.ceil(numberOfMovies / limit);

            let start, end;

            if (page >= 0 && page < numberOfPages) {
                start = limit * page;
                end = limit + start;
            } else {
                return res.status(500).json({ message: "No such page found" });
            }

            // displaying 6 movies / page
            const upcoming = upcomingAllCleaned.slice(start, end);

            // helper for extended info on movies
            const withExtendedInfo = await findByIdAndMap(upcoming);

            res.status(200).json({
                numberOfMovies: numberOfMovies,
                numberOfMoviesPage: limit,
                numberOfPages: numberOfPages,
                currentPage: +req.params.page,
                foundMovies: withExtendedInfo,
            });
        })
        .catch((error) => {
            console.error(error.message);
            res.status(400).json({ error: error.message });
        });
};

// GET Top Rated movies - limited to limit
const topRatedMovies = async (req, res) => {
    let options = {
        method: "GET",
        url: "https://data-imdb1.p.rapidapi.com/movie/order/byRating/",
        headers: rapidApiHeaders,
    };

    try {
        // get data
        const topRatedMoviesRaw = await getDataRedisOrApi(
            "topRatedMovies",
            options
        );
        const topRatedMoviesAll = topRatedMoviesRaw.slice(1);

        // proceed data
        // getting TopRated Movies with little data (imdb_id, title, rating)
        // limit to 6 movies
        const numberOfMovies = topRatedMoviesAll.length;

        const page = req.params.page - 1;
        const limit = 6;
        const numberOfPages = Math.ceil(numberOfMovies / limit);

        let start, end;

        if (page >= 0 && page < numberOfPages) {
            start = limit * page;
            end = limit + start;
        } else {
            return res.status(500).json({ message: "No such page found" });
        }

        // displaying 6 movies / page
        const topRatedMovies = topRatedMoviesAll.slice(start, end);

        // helper for extended info on movies
        const withExtendedInfo = await findByIdAndMap(topRatedMovies);

        res.status(200).json({
            numberOfMovies: numberOfMovies,
            numberOfMoviesPage: limit,
            numberOfPages: numberOfPages,
            currentPage: +req.params.page,
            foundMovies: withExtendedInfo,
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: error.message });
    }
};

// GET movies by first genre and by user id
const moviesByUserGenre = async (req, res) => {

    try {
        // Looking for the favorite genres at User document
        const user = await User.findById(req.params.userId);

        if (user.favoriteGenres.length === 0) {
            return res.status(404).json({
                message: "The user doesn't have any movies on the wishlist",
            });
        }

        const frequency = user.favoriteGenres.map((item) => item["frequency"]);

        // Finding the highest frequency
        const maxFrequency = Math.max(...frequency);

        const favoriteGenreObjects = user.favoriteGenres.filter(
            (item) => item.frequency === maxFrequency
        );

        // Get an array with the most frequent genres
        const favoriteGenre = favoriteGenreObjects.map((item) => item["genre"]);

        // Getting movies by favorite genres (first genre)
        let options = {
            method: "GET",
            url: `https://data-imdb1.p.rapidapi.com/movie/byGen/${favoriteGenre[0]}/`,
            headers: rapidApiHeaders,
        };

        axios
            .request(options)
            .then(async (response) => {
                const foundByGenre = await Object.values(response.data)[0];

                // Get random movies from a certain type genre
                const randomMoviesByGenre = foundByGenre
                    .sort(() => Math.random() - Math.random())
                    .slice(0, 30);
                
                const byGenreWithExtendedInfo = await findByIdAndMap(
                    randomMoviesByGenre
                );

                res.status(200).json({
                    favoriteGenre: favoriteGenre[0],
                    numberOfMovies: byGenreWithExtendedInfo.length,
                    foundMovies: byGenreWithExtendedInfo,
                });
            })
            .catch((error) => {
                console.error(error.message);
                res.status(400).json({ error: error.message });
            });

    } catch (error) {
        res.status(400).send({
            message: "Error occurred",
            error: error.message,
        });
    }
};

// GET movies by 2nd genre and by user id
const moviesByUserGenre2 = async (req, res) => {

    try {
        // Looking for the favorite genres at User document
        const user = await User.findById(req.params.userId);

        if (user.favoriteGenres.length === 0) {
            return res.status(404).json({
                message: "The user doesn't have any movies on the wishlist",
            });
        }

        const frequency = user.favoriteGenres.map((item) => item["frequency"]);

        // Finding the highest frequency
        const maxFrequency = Math.max(...frequency);

        const favoriteGenreObjects = user.favoriteGenres.filter(
            (item) => item.frequency === maxFrequency
        );

        // Get an array with the most frequent genres
        const favoriteGenre = favoriteGenreObjects.map((item) => item["genre"]);

        // Getting movies by favorite genres (first genre)
        let options = {
            method: "GET",
            url: `https://data-imdb1.p.rapidapi.com/movie/byGen/${favoriteGenre[1]}/`,
            headers: rapidApiHeaders,
        };

        axios
            .request(options)
            .then(async (response) => {
                const foundByGenre2 = await Object.values(response.data)[0];

                // Get random movies from a certain type genre
                const randomMoviesByGenre2 = foundByGenre2
                    .sort(() => Math.random() - Math.random())
                    .slice(0, 30);
                
                const byGenreWithExtendedInfo2 = await findByIdAndMap(
                    randomMoviesByGenre2
                );

                res.status(200).json({
                    favoriteGenre2: favoriteGenre[1],
                    numberOfMovies: byGenreWithExtendedInfo2.length,
                    foundMovies: byGenreWithExtendedInfo2,
                });
            })
            .catch((error) => {
                console.error(error.message);
                res.status(400).json({ error: error.message });
            });

    } catch (error) {
        res.status(401).send({
            message: "Error occurred",
            error: error.message,
        });
    }
};


// FOR SEARCH:
// **************************************
// GET movies by title - limited to 10/page
const moviesByTitle = async (req, res) => {
    const { title } = req.params;

    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/movie/imdb_id/byTitle/${title}/`,
        headers: rapidApiHeaders,
    };

    try {
        // get data
        const foundTitles = await getDataRedisOrApi(
            `byTitle_${title}`,
            options
        );

        // proceed data
        const numberOfMovies = foundTitles.length;

        if (foundTitles.length === 0) {
            return res.status(404).json({
                message: `No movies with a word *${title}* in the title were found`,
            });
        }

        // pagination
        const page = req.params.page - 1;
        const limit = 10;
        const numberOfPages = Math.ceil(numberOfMovies / limit);

        let start, end;

        if (page >= 0 && page < numberOfPages) {
            start = limit * page;
            end = limit + start;
        } else {
            return res.status(500).json({ message: "No such page found" });
        }

        const foundTitlesPart = foundTitles.slice(start, end);

        // helper for extended info on movies
        const withExtendedInfo = await findByIdAndMap(foundTitlesPart);

        res.status(200).json({
            searchParam: title,
            numberOfMovies: numberOfMovies,
            numberOfPages: numberOfPages,
            currentPage: +req.params.page,
            foundMovies: withExtendedInfo,
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: error.message });
    }
};

// GET movies by genre
const moviesByGenre = async (req, res) => {

    const genre = req.params.genre.toLowerCase() === "sci-fi" ? "Sci-Fi" : req.params.genre[0].toUpperCase() + req.params.genre.slice(1);

    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/movie/byGen/${genre}/`,
        headers: rapidApiHeaders,
    };

    try {
        // get data
        const foundByGenre = await getDataRedisOrApi(
            `byGenre_${genre}`,
            options
        );

        // proceed data
        const numberOfMovies = foundByGenre.length;

        if (foundByGenre.length === 0) {
            return res.status(404).json({
                message: `No movies for *${req.params.genre}* were found`,
            });
        }
        const page = req.params.page - 1;
        const limit = 10;
        const numberOfPages = Math.ceil(numberOfMovies / limit);

        let start, end;

        if (page >= 0 && page < numberOfPages) {
            start = limit * page;
            end = limit + start;
        } else {
            return res.status(500).json({ message: "No such page found" });
        }
        const foundByGenrePart = foundByGenre.slice(start, end);

        // helper for extended info on movies
        const withExtendedInfo = await findByIdAndMap(foundByGenrePart);

        return res.status(200).json({
            searchParam: req.params.genre,
            numberOfMovies: numberOfMovies,
            numberOfPages: numberOfPages,
            currentPage: +req.params.page,
            foundMovies: withExtendedInfo,
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: error.message });
    }
};

// GET movies by year
const moviesByYear = async (req, res) => {
    const { year } = req.params;
    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/movie/byYear/${year}/`,
        headers: rapidApiHeaders,
    };

    try {
        // get data
        const foundByYear = await getDataRedisOrApi(`byYear_${year}`, options);

        // process data
        const numberOfMovies = foundByYear.length;

        if (foundByYear.length === 0) {
            return res.status(404).json({
                message: `No movies for *${req.params.year}* were found`,
            });
        }

        const page = req.params.page - 1;
        const limit = 10;
        const numberOfPages = Math.ceil(numberOfMovies / limit);

        let start, end;

        if (page >= 0 && page < numberOfPages) {
            start = limit * page;
            end = limit + start;
        } else {
            return res.status(500).json({ message: "No such page found" });
        }
        const foundByYearPart = foundByYear.slice(start, end);

        // helper for extended info on movies
        const withExtendedInfo = await findByIdAndMap(foundByYearPart);

        return res.status(200).json({
            searchParam: req.params.year,
            numberOfMovies: numberOfMovies,
            numberOfPages: numberOfPages,
            currentPage: +req.params.page,
            foundMovies: withExtendedInfo,
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: error.message });
    }
};

// GET movies by director
const moviesByDirector = async (req, res) => {
    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/actor/imdb_id_byName/${req.params.director}/`,
        headers: rapidApiHeaders,
    };

    await axios
        .request(options)
        .then(async (response) => {
            const foundPeople = Object.values(response.data)[0];

            if (
                foundPeople.length === 0 &&
                !req.params.director
                    .toLowerCase()
                    .includes("pedro almodóvar") &&
                !req.params.director
                    .toLowerCase()
                    .includes("pedro almodovar") &&
                !req.params.director.toLowerCase().includes("paul anderson")
            ) {
                return res.status(404).json({
                    message: `We could not find anyone with the name *${req.params.director}*`,
                });
            }

            // Some conditions needed - DB gives wrong data format for Stanley Kubrick, also for Pedro Almodóvar - ó not recognized, and Paul Anderson is not searchable by name
            let foundPeopleCondition = req.params.director
                .toLowerCase()
                .includes("kubrick")
                ? [foundPeople[0]]
                : req.params.director.toLowerCase().includes("pedro almodóvar")
                    ? [{ imdb_id: "nm0000264", name: "Pedro Almodóvar" }]
                    : req.params.director.toLowerCase().includes("pedro almodovar")
                        ? [{ imdb_id: "nm0000264", name: "Pedro Almodóvar" }]
                        : req.params.director.toLowerCase().includes("paul anderson")
                            ? [{ imdb_id: "nm0027271", name: "Paul Anderson" }]
                            : foundPeople;

            const peopleInfo = foundPeopleCondition.map(async (person) => {
                let options = {
                    method: "GET",
                    url: `https://data-imdb1.p.rapidapi.com/movie/byActor/${person.imdb_id}/`,
                    headers: {
                        "x-rapidapi-host": "data-imdb1.p.rapidapi.com",
                        "x-rapidapi-key": process.env.RAPID_API_KEY,
                    },
                };

                return await axios
                    .request(options)
                    .then((response) => response.data)
                    .catch((error) => {
                        console.error(error.message);
                    });
            });

            return Promise.all(peopleInfo)
                .then((results) => Object.values(results))
                .then(async (data) => {
                    let peopleArray = [];

                    data.forEach((item) => {
                        let person = Object.values(item)[0];

                        if (person.length > 0) {
                            person.find((movie) => {
                                movie[1].find((item) => {
                                    if (item.role == "Director") {
                                        let movieData = {
                                            imdb_id: movie[0].imdb_id,
                                            title: movie[0].title,
                                            director: movie[1][0].actor.name,
                                            director_id:
                                                movie[1][0].actor.imdb_id,
                                        };
                                        peopleArray.push(movieData);
                                    }
                                });
                            });
                        }
                    });

                    if (peopleArray.length === 0) {
                        return res.status(404).json({
                            message: `We could not find anyone with the name *${req.params.director}*`,
                        });
                    }

                    // helper for extended info on movies
                    const withExtendedInfo = await findByIdAndMap(peopleArray);

                    return res.status(200).json({
                        searchParam: req.params.director,
                        numberOfMovies: peopleArray.length,
                        foundMovies: withExtendedInfo,
                        numberOfPages: 1,
                    });
                });
        })
        .catch((error) => {
            console.error(error.message);
            res.status(400).json({ error: error.message });
        });
};

// FOR INDIVIDUAL MOVIE:
// **************************************
const movieById = async (req, res) => {
    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/movie/id/${req.params.imdbId}/`,
        headers: rapidApiHeaders,
    };

    axios
        .request(options)
        .then((response) => {
            const foundByImdbId = Object.values(response.data)[0];

            if (foundByImdbId.length === 0) {
                return res.status(404).json({
                    message: `No movie with IMBD ID *${req.params.imdbId}* was found`,
                });
            }

            return res.status(200).json({
                searchParam: req.params.imdbId,
                foundMovie: foundByImdbId,
            });
        })
        .catch((error) => {
            console.error(error.message);
            res.status(400).json({ error: error.message });
        });
};



module.exports = {
    upcomingMovies,
    topRatedMovies,
    moviesByUserGenre,
    moviesByTitle,
    moviesByDirector,
    moviesByGenre,
    moviesByUserGenre2,
    moviesByYear,
    movieById,
};
