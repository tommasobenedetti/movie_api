const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const uuid = require('uuid');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//adding cors
const cors = require('cors');
app.use(cors());

//connects the auth file for log ins to connect to this file
const passport = require('passport');
require('./passport');
require('./auth')(app);

app.use(morgan('common')); //Middelware for logger.
app.use(express.json()); //Middelware for Json
app.use('/public', express.static('public'));


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

//READ!!!

// Get requests

app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});
app.get('/documentation', (req, res) => {
    res.status(200).sendFile(`${__dirname}/Public/documentation.html`);
});

// Return all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
  .then((movie) => {
    if (movie) {
          res.status(200).json(movie);
      } else {
          res.status(404).json([]);
      }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Return movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title : req.params.title })
  .then((movie) => {
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).json([])
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//Return info about a specific genre
app.get('/movies/genre/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name" : req.params.name })
    .then((genre) => {
      res.json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Return info about a specific director
app.get('/movies/genre/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name" : req.params.name })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Return all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find().populate('FavoriteMovies').select('-Password')
    .then((users) => {
      if (users) {
          res.status(200).json(users);
      } else {
          res.status(404).json([]);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    });
});

// Return a user by username
app.put('/users/:UserName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ UserName: req.params.UserName })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//UPDATE!!!

//Create a new user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users/:register', (req, res) => {
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
          .then(({Username, Email, Birthday}) => {
              res.status(201).json({Username, Email, Birthday})
          })
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

//CREATE!!!

//adds a favorite movie to a specific user's profile
app.post('/users/:UserName/:movieId', async (req, res) => {

    Users.findOneAndUpdate(
        { UserName: req.params.UserName },
        { $addToSet: {FavoriteMovies: req.params.movieId }},
        { new: true }
    ).then(updatedDocument => {
        if (updatedDocument) {
            res.status(200).json("Updated successfully")
        } else {
            res.status(401).json("Error updating")
        }
    })
});

//DELETE!!!

// Remove a user from the db
app.delete('/users/:id/unregister', (req, res) => {
  Users.findOneAndRemove({ _id: req.params.id })
    .then((user) => {
      if (!user) {
        res.status(404).send(req.params.user_name + ' was not found');
      } else {
        res.status(200).send(req.params.user_name + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Remove a movie from the user's favorites list
app.delete('/users/:id/FavoriteMovies/:deleteFavorite', (req, res) => {
  Users.findOneAndUpdate({ UserName: req.params.id }, {
    $pull: { FavoriteMovies: req.params.deleteFavorite }
  },
  { new: true }, // This line makes sure that the updated document is returned
 (err, updatedUser) => {
   if (err) {
     console.error(err);
     res.status(401).send('Error: ' + err);
   } else {
     res.json(updatedUser);
   }
 });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There is something wrong..really wrong...')
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
