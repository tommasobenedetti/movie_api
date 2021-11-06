const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');
const app = express();
app.use(morgan('common'));

// Create a movie list.
let movies = [
    {
        name: 'Mad Max: Fury Road',
        year: '2015',
        genre: 'Fantasy, Action'
    },
    {
        name: 'The pianist',
        year: '2002',
        genre: 'Drama'
    },
    {
        name: 'The Big Short',
        year: '2017',
        genre: 'Comedy, Drama'
    },
    {
        name: 'No Country For Old Man',
        year: '2007',
        genre: 'Action, Drama'
    },
    {
        name: 'Master & Commander',
        year: '2003',
        genre: 'Adventure, Action'
    },
    {
        name: 'Kill Bill',
        year: '2003',
        genre: 'Action'

    },
    {
        name: 'Kill Bill II',
        year: '2004',
        genre: 'Action'
    },
    {
        name: 'Birdman',
        year: '2014',
        genre: 'Drama, Comedy'
    }
]

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});
// Return all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies)
});

app.get('/movies/:title', (req, res) => {
    let movie = movies.find((movie) => {
        return movie.title === req.params.title;
    });
    if(movie) {
        res.status(200).json(movie)
    } else {
        res.status(400).send('No movie with that title is found')
    }
});

app.get('/movies/genre/:genre', (req, res) => {
    let movieList = []
    movies.find((movie) => {
        if(movie.genre === req.params.genre) {
            movieList.push(movie)
        }
    });

    res.json(movieList)
});

app.get('/movies/year/:year', (req, res) => {
    let year = movies.find((movie) => {
        return movie.year.name === req.params.year;
    });
    if(year) {
        res.status(200).json(year)
    } else {
        res.status(400).send('No film was released this year')
    }
});

app.post('/users', (req, res) => {
    let user = req.body

    if(user.username) {
        res.status(200).json(user)
    } else {
        res.status(400).send('Valid user info was not passed in')
    }
});

app.put('/users/:username', (req, res) => {
    let username = req.params.username
    res.status(200).send(`Username has been changed to ${username}`)
});


let favorites = []
app.post('/users/add/:movieName', (req, res) => {
    let addMovie = movies.find((movie) => {
        return movie.title === req.params.movieName;
    });

    if(addMovie) {
        favorites.push(req.params.movieName)
        res.status(200).send(`${req.params.movieName} has been added to your favorites`);
    } else {
        res.status(400).send('Cannot find movie with that name');
    }
});

app.delete('/users/remove/:movieName', (req, res) => {
    favorites = favorites.filter((name) => { return name !== req.params.movieName });
    res.status(200).send(`${req.params.movieName} has been removed from your favorites`);
});

app.delete('/users/deleteAccount/:id', (req, res) => {
    res.status(200).send('Your account has been deleted');
})

app.get('/documentation.html', (req, res) => {
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There is something wrong..really wrong...')
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
