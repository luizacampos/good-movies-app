const axios = require("axios").default;
const { findByIdAndMap } = require("../helpers/findByIdAndMap");
const { paginationHelper } = require("../helpers/paginationHelper");

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

            // will try to make a helper for pagination later - this code is working
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
            // the end of helper will be here

            // await paginationHelper(req, numberOfMovies)

            // displaying 6 movies / page
            const upcoming = upcomingAll.slice(start, end);

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

    // getting TopRated Movies with little data (imdb_id, title, rating)
    // limit to 6 movies
    axios
        .request(options)
        .then(async (response) => {
            const topRatedMoviesAll = Object.values(response.data)[0].slice(1);
            const numberOfMovies = topRatedMoviesAll.length;

            // will try to make a helper for pagination later - this code is working
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
            // the end of helper will be here

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
        })
        .catch((error) => {
            console.error(error.message);
            res.status(400).json({ error: error.message });
        });
};

// GET movies by genre and by user id
const moviesByUserGenre = async (req, res) => {
    res.status(200).json({ message: "connected to moviesByUserGenre movies" });
};

// FOR SEARCH:
// **************************************
// GET movies by title - limited to 10/page
const moviesByTitle = async (req, res) => {
    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/movie/imdb_id/byTitle/${req.params.title}/`,
        headers: rapidApiHeaders,
    };

    await axios
        .request(options)
        .then(async (response) => {
            const foundTitles = Object.values(response.data)[0];
            const numberOfMovies = foundTitles.length;

            if (foundTitles.length === 0) {
                return res.status(404).json({
                    message: `No movies with a word *${req.params.title}* in the title were found`,
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
            const foundTitlesPart = foundTitles.slice(start, end);


            // helper for extended info on movies
            const withExtendedInfo = await findByIdAndMap(foundTitlesPart);

            res.status(200).json({
                searchParam: req.params.title,
                numberOfMovies: numberOfMovies,
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


// GET movies by genre
const moviesByGenre = async (req, res) => {
    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/movie/byGen/${req.params.genre}/`,
        headers: rapidApiHeaders,
    };

    await axios
        .request(options)
        .then(async (response) => {
            const numberOfMoviesToShow = 20;

            // getting ALL movies for that genre (can be a lot)
            const foundByGenre = Object.values(response.data)[0];
            const numberOfMovies = foundByGenre.length;

            // then limiting a number of results of "foundByGenre" to 20
            // const foundByGenre20 = foundByGenre.slice(0, numberOfMoviesToShow);

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
        })
        .catch((error) => {
            console.error(error.message);
            res.status(400).json({ error: error.message });
        });
};

// GET movies by year
const moviesByYear = async (req, res) => {
    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/movie/byYear/${req.params.year}/`,
        headers: rapidApiHeaders,
    };

    axios
        .request(options)
        .then(async (response) => {
            const foundByYear = Object.values(response.data)[0];
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
        })
        .catch((error) => {
            console.error(error.message);
            res.status(400).json({ error: error.message });
        });
};

// GET movies by director - NOT READY
const moviesByDirector = async (req, res) => {

    let options = {
        method: "GET",
        url: `https://data-imdb1.p.rapidapi.com/actor/imdb_id_byName/${req.params.director}/`,
        headers: rapidApiHeaders,
    };
    console.log(options);

    await axios
        .request(options)
        .then(async (response) => {

            // console.log(response.data);

            const foundPeople = Object.values(response.data)[0];
            // const numberOfPeople = foundPeople.length;

            if (foundPeople.length === 0) {
                return res.status(404).json({
                    message: `We could not find anyone with the name *${req.params.director}*`,
                });
            }

            // DB gives wrong data format for Stanley Kubrick, we need a condition here
            let foundPeopleCondition = foundPeople[0].name == "Stanley Kubrick" ? [foundPeople[0]] : foundPeople

            const peopleInfo = foundPeopleCondition.map(async person => {

                let options = {
                    method: 'GET',
                    url: `https://data-imdb1.p.rapidapi.com/movie/byActor/${person.imdb_id}/`,
                    headers: {
                        'x-rapidapi-host': 'data-imdb1.p.rapidapi.com',
                        'x-rapidapi-key': process.env.RAPID_API_KEY
                    }
                }

                return await axios.request(options)
                    .then((response) => response.data)
                    .catch((error) => {
                        console.error(error.message);
                    });
            })

            return Promise.all(peopleInfo)
                .then(results => Object.values(results))
                .then(async (data) => {
                    let peopleArray = [];

                    data.forEach((item) => {
                        let person = Object.values(item)[0];

                        if (person.length > 0) {
                            person.find(movie => {
                                movie[1].find(item => {
                                    if (item.role == "Director") {

                                        let movieData = {
                                            "imdb_id": movie[0].imdb_id,
                                            "title": movie[0].title,
                                            "director": movie[1][0].actor.name,
                                            "director_id": movie[1][0].actor.imdb_id,
                                        }
                                        peopleArray.push(movieData);
                                    }
                                })
                            })

                        }
                    });

                    // helper for extended info on movies
                    const withExtendedInfo = await findByIdAndMap(peopleArray);


                    return res.status(200).json({
                        searchParam: req.params.director,
                        numberOfMovies: peopleArray.length,
                        foundMovies: withExtendedInfo,
                        numberOfPages: 1
                    });
                })

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

const moviesByRandomSearch = async (req, res) => {
    res.status(200).json({ message: "connected to movieByRandomSearch" });
};

module.exports = {
    upcomingMovies,
    topRatedMovies,
    moviesByUserGenre,
    moviesByTitle,
    moviesByDirector,
    moviesByGenre,
    moviesByYear,
    movieById,
    moviesByRandomSearch,
};
