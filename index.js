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

//READ!!!

// Get requests

app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});
app.get('/documentation', (req, res) => {
    res.status(200).sendFile(`${__dirname}/Public/documentation.html`);
});

// Return all movies
app.get('/movies', (req, res) => {
  Movies.find()
  .then((movie) => {
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send('Error: ' + err);
  });
});

//Return movie by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title : req.params.title })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Return info about a specific genre
app.get('/movies/genre/:name', (req, res) => {
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
app.get('/movies/director/:name', (req, res) => {
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

// Return a user by username
app.get('/users/:UserName', (req, res) => {
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

//CREATE!!!

//adds a favorite movie to a specific user's profile
app.post('/users/:id/:movieTitle', (req, res) => {
  Users.findOneAndUpdate({ user_name: req.params.id }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true },
 (err, updatedUser) => {
   if (err) {
     console.error(err);
     res.status(500).send('Error: ' + err);
   } else {
     res.json(updatedUser);
   }
 });
});

//DELETE!!!

// Remove a user from the db
app.delete('/users/:id/unregister', (req, res) => {
  Users.findOneAndRemove({ id: req.params.id })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.user_name + ' was not found');
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
  Users.findOneAndUpdate({ user_name: req.params.id }, {
    $pull: { FavoriteMovies: req.params.MovieID }
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

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There is something wrong..really wrong...')
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
