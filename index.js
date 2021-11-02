const express = require('express');
const morgan = require('morgan');
app.use(morgan('common'));
const app = express();

// Create a movie list.
let movies = [
    {
        name: 'Mad Max: Fury Road',
        released: '2015'
    },
    {
        name: 'The pianist',
        released: '2002'
    },
    {
        name: 'The Big Short',
        released: '2017'
    },
    {
        name: 'No Country For Old Man',
        released: '2007'
    },
    {
        name: 'Master & Commander',
        released: '2003'
    },
    {
        name: 'Kill Bill',
        released: '2003'
    },
    {
        name: 'Kill Bill II',
        released: '2004'
    },
    {
        name: 'Birdman',
        released: '2014'
    }
]

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix app!');
});
app.get('/movies', (req, res) => {
    res.send(movies)
});

app.use("/public", express.static("public"));

app.get("/documentation.html", (req, res) => {
  res.sendFile(`public/documentation.html`);
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There is something wrong..really wrong...')
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
