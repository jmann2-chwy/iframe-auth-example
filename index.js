//
var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var fs = require('fs');
var app = express();

var serverUrl = 'http://localhost:3000';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// CORS
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', serverUrl); // this is the rocket.chat URL
    res.set('Access-Control-Allow-Credentials', 'true');
    next();
});

// just render the form for the user authenticate with us
app.get('/login', function (req, res) {
    console.log('GET: /login');
    res.set('Content-Type', 'text/html');
    fs.createReadStream('login.html').pipe(res);
});

app.get('/portal', function (req, res) {
    console.log('GET: /portal');
    res.set('Content-Type', 'text/html');
    fs.createReadStream('portal.html').pipe(res);
});

// this is the endpoint configured as API URL
app.post('/sso', function (req, res) {
    console.log('POST: /sso', 'Entry');

    // The goal here is to determine if we can perform a log in on behalf of a know user
    // How we determine the known user is varied, and may come from cookie or header information
    // Note: This endpoint is called by Rocket Chat, so it may not have the headers normally expected
    // when endpoints are called by the Portal UI

    // If we cannot determine a user, or we cannot log in on their behalf, we are required to return 401 status
    res.sendStatus(401);
});

app.listen(3030, function () {
    console.log('Example app listening on port 3030!');
});
