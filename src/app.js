// Packages
const express = require('express');
const sessions = require('express-session');
const mongoose = require('mongoose');
const { findOne } = require('../models/user');
let user = require('../models/user');
const dotenv = require('dotenv').config()
const app = express();

// Variables
const dbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@stocktracker.py3hcvw.mongodb.net/users?retryWrites=true&w=majority`
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(3000, () => {console.log("Starting server on port 3000")}))
    .catch((err) => console.log(err));

app.use(sessions({
    secret: 'chicken fried rice',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 86400000}
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));


var session;

app.get('/', (req,res) => {
    session = req.session;
    if (session.userid) {
        res.send('Welcome! <a href=\'logout\'>click to logout</a>');
    } else {
        res.sendFile('views/index.html',{root:__dirname});
    }
});

// ##############################
// ######## REGISTRATION ########
// ##############################
app.get('/signup', (req,res) => {
    session = req.session;
    if (session.userid) {
        res.redirect('/');
    } else {
        res.sendFile('views/register.html',{root:__dirname});
    }
})

app.post('/register', (req,res) => {
    let passw = req.body.password;
    let usern = req.body.username;
    let userExists = true;
    var query = user.findOne({username: usern}, function(err, newUser) {
        if (err) {
            res.send('error');
            throw err;
        }
        if (newUser) {
            console.log('user already exists');
        } else {
            console.log('user doesnt exist');
            var createUser = new user({
                username: usern,
                password: passw,
            });
            createUser.save(function(err) {if (err) throw err;});
        }
    })
    res.redirect('/');
})

// ##############################
// ############ LOGIN ###########
// ##############################

app.post('/login', (req,res) => {
    let usern= req.body.username;
    let passw = req.body.password;
    user.findOne({username: usern}, (err,user) => {
        if (err) {
            throw err;
        }
    
        user.comparePassword(passw, (err,isMatch) => {
            if (err)  {
                throw err;
            }
            if (isMatch) {
                session = req.session;
                session.userid=req.body.username;
                console.log(req.session);
                res.redirect('/');
            } else {
                res.send('Invalid username or password');
            }
    ;    })
    })
})

// ##############################
// ########### LOGOUT ###########
// ##############################

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});

