// Packages
const express = require('express');
const axios = require('axios');
const sessions = require('express-session');
const mongoose = require('mongoose');
const url = require('url');
const https = require('https');
const fs = require('fs');
const { findOne } = require('../models/user');
let user = require('../models/user');
const dotenv = require('dotenv').config()
const app = express();

// Variables
const dbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@stocktracker.py3hcvw.mongodb.net/users?retryWrites=true&w=majority`
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) =>  {
        https
            .createServer({
                key: fs.readFileSync("key.pem"),
                cert: fs.readFileSync("cert.pem"),
            },app)
            .listen(3000, ()=>{
                console.log('server is running on port 3000');
            })
    })
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
        res.send('Welcome! <a href=\'logout\'>click to logout</a></a href=\'authenticate\'>click to authenticate</a>');
    } else {
        res.sendFile('views/index.html',{root:__dirname});
    }
});

app.post('/', (req,res) => {
    const queryObject = url.parse(req.url, true).query;
    console.log(queryObject);
})

app.get('/authenticate-tdameritrade',(req,res) => {
    session = req.session;
    if (session.userid) {
        // Get code from URL
        const queryObject = url.parse(req.url, true).query;
        const code = queryObject.code;
        // Add code to user session
        // (Might not want to store this, should probably just use it to make API call to get refresh token/access token
        // then store those inside of the user db)
        session.code = code;
        console.log(`${code} added to user ${session.userid}`);
        // Make an API call to retrieve access token and refresh token

        // Store access and refresh token in session/cookie

        // Send user back to main page
        res.redirect('/');
    }
})

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

app.get('/authenticate', (req,res) => {
    let session = req.session
    let auth_url = `https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=${process.env.REDIRECT_URI_ENCODED}&client_id=${process.env.CONSUMER_KEY}%40AMER.OAUTHAP`;
    if (session.userid) {
        res.redirect(auth_url);
    } else {
        res.redirect("/");
    }
})


app.get('/appleprice', (req,res) => {
    let config = {headers: {Accept: "*/*",Authorization: 'Bearer ' + process.env.ACCESS_TOKEN}};
    let host = "api.tdameritrade.com";
    let request = "/v1/marketdata/AAPL/quotes?apikey="
    axios.get(`https://${host}/${request}${process.env.CONSUMER_KEY}`,config)
    .then((res) => {
        console.log(`Symbol: ${res.data.AAPL.symbol}\nAsk Price:${res.data.AAPL.askPrice}`);
    }).catch((err) => {
        console.error(err);
    })
    res.redirect('/');
})