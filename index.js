//
var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var fs = require('fs');
var app = express();

var serverUrl = 'http://192.168.7.183:3000';

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

app.get('/home', function (req, res) {
    console.log('GET: /home');
    res.set('Content-Type', 'text/html');
    fs.createReadStream('home.html').pipe(res);
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

    // If we can determine the user and are able to log in with their credentials we can do so like this:
    // axios.post(serverUrl + '/api/v1/login', {
    //     username: username,
    //     password: password
    // }).then(function (response) {
    //     if (response.data.status === 'success') {
    //         res.json({
    //             loginToken: response.data.data.authToken
    //         });
    //     }
    // }).catch(function (error) {
    //     console.error('POST: /login', 'Error logging in on behalf of user', error.message);
    //     res.sendStatus(401);
    // });

});

// receives login information
app.post('/login', function (req, res) {
    console.log('POST: /login', 'Entry');

    // Any authorizations that are required in addition to Rocket Chat should be performed here

    const user = req.body.username;
    const pass = req.body.password;

    // otherwise create a rocket.chat session using rocket.chat's API
    axios.post(serverUrl + '/api/v1/login', {
        username: user,
        password: pass
    }).then(function (response) {
        if (response.data.status === 'success') {

            // TODO: Remove logging of auth token
            console.log('POST: /login', 'Emitting `login-with-token` message', response.data.data.authToken);

            // since this endpoint is loaded within the iframe, we need to communicate back to rocket.chat using `postMessage` API
            res.set('Content-Type', 'text/html');
            res.send(`<script>
 window.parent.postMessage({
 event: 'login-with-token',
 loginToken: '${response.data.data.authToken}'
 }, serverUrl); // rocket.chat's URL
 </script>`);
        } else {
            console.log('POST: /login', 'Internal login of user was not successful', response.data.status);
        }
    }).catch(function (error) {
        console.error('POST: /login', 'Error in logging in user', error.message);
        res.sendStatus(401);
    });
});

app.listen(3030, function () {
    console.log('Example app listening on port 3030!');
});
