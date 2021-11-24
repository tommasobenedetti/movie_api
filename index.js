const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const uuid = require('uuid');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common')); //Middelware for logger.
app.use(express.json()); //Middelware for Json
app.use('/public', express.static('public'));

let auth = require('./auth')(app);


// Create a movie list.
//let movies = [
    //{
      //  name: 'Mad Max: Fury Road',
      //  year: '2015',
      //  genre: 'Fantasy, Action'
  //  },
  //  {
    //    name: 'The pianist',
    //    year: '2002',
    //    genre: 'Drama'
  //  },
  //  {
      //  name: 'The Big Short',
      //  year: '2017',
    //    genre: 'Comedy, Drama'
    //},
    //{
      //  name: 'No Country For Old Man',
      //  year: '2007',
      //  genre: 'Action, Drama'
    //},
    //{
    //    name: 'Master & Commander',
      //  year: '2003',
      //  genre: 'Adventure, Action'
    //},
    //{
      //  name: 'Kill Bill',
      //  year: '2003',
      //  genre: 'Action'

    //},
    //{
      //  name: 'Kill Bill II',
      //  year: '2004',
      //  genre: 'Action'
    //},
    //{
    //    name: 'Birdman',
    //    year: '2014',
    //    genre: 'Drama, Comedy'
    //}
//]

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});
app.get('/documentation', (req, res) => {
    res.status(200).sendFile(`${__dirname}/Public/documentation.html`);
});

// Return all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies)
});

app.get('/movies/:name', (req, res) => {
    let movie = movies.find((movie) => {
        return movie.name === req.params.name;
    });
    if(movie) {
        res.status(200).json(movie)
    } else {
        res.status(400).send('No movie with that title was found')
    }
});

app.get('/movies/genre/:genre', (req, res) => {
    let movieList = movies.filter((movie) => {movie.genre === req.params.genre
            movieList.push(movie)
    });

    res.json(movieList)
});

app.get('/movies/year/:year', (req, res) => {
    let year = movies.find((movie) => {
      return movie.year === req.params.year;
    });
    if(year) {
        res.status(200).json(year)
    } else {
        res.status(400).send('No film was released this year')
    }
});

app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Return all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.put('/users/:username', (req, res) => {
    let username = req.params.username
    res.status(200).send(`Username has been changed to ${username}`)
});

// Return a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

let favorites = []
app.post('/users/add/:movieName', (req, res) => {
    let addMovie = movies.find((movie) => {
        return movie.name === req.params.movieName;
    });

    if(addMovie) {
        favorites.push(req.params.movieName)
        res.status(200).send(`${req.params.movieName} has been added to your favorites`);
    } else {
        res.status(400).send('Cannot find movie with that name');
    }
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

app.delete('/users/remove/:movieName', (req, res) => {
    favorites = favorites.filter((name) => { return name !== req.params.movieName });
    res.status(200).send(`${req.params.movieName} has been removed from your favorites`);
});

app.delete('/users/deleteAccount/:id', (req, res) => {
    res.status(200).send('Your account has been deleted');
})

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There is something wrong..really wrong...')
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
