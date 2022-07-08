// Packages
const express = require('express');
const sessions = require('express-session');
const mongoose = require('mongoose');
const user = require('../models/user');
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
~
app.get('/', (req,res) => {
    session = req.session;
    if (session.userid) {
        res.send('Welcome! <a href=\'logout\'>click to logout</a>');
    } else {
        res.sendFile('views/index.html',{root:__dirname});
    }
});


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

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});

// Add new user
// var testUser = new user({
//     username: 'pradelsj',
//     password: 'password'
// });

// Adding new user
// testUser.save((err) => {
//     if (err) throw err;
// })

// Authenticate user
// user.findOne({username: 'pradelsj'}, (err,user) => {
//     if (err) throw err;

//     user.comparePassword('password', (err,isMatch) => {
//         if (err) throw err;
//         console.log('password', isMatch);
// ;    })
// })
