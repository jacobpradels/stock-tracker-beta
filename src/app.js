// Packages
const express = require('express');
const sessions = require('express-session');
const dotenv = require('dotenv').config()
const app = express();

// Variables
const dbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@stocktracker.py3hcvw.mongodb.net/?retryWrites=true&w=majority`

app.use(sessions({
    secret: 'chicken fried rice',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 86400000}
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));

let username = 'user';
let password = 'pass'
var session;

app.get('/', (req,res) => {
    session = req.session;
    if (session.userid) {
        res.send('Welcome! <a href=\'logout\'>click to logout</a>');
    } else {
        res.sendFile('views/index.html',{root:__dirname});
    }
});


app.post('/login', (req,res) => {
    if (req.body.username == username && req.body.password == password) {
        session = req.session;
        session.userid=req.body.username;
        console.log(req.session);
        res.redirect('/');
    } else {
        res.send('Invalid username or password');
    }
})

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});

let server = app.listen (3000, () => {
    var host = server.address().address
    var port = server.address().port
    console.log(`Listening on http://${host}:${port}`);
});