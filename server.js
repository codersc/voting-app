'use strict';

var port = process.env.PORT || 8080;
var express = require('express');
var routes = require('./routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
require('dotenv').load();
require('./config/passport')(passport);


mongoose.connect(process.env.MONGO_URI);

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/controllers', express.static(process.cwd() + '/controllers'));
app.use('/common', express.static(process.cwd() + '/common'));
app.use(session(
    {
        secret: 'secretClementine',
        resave: false,
        saveUninitialized: true
    }
));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

app.listen(port, function() {
    console.log('Server listening on port ' + port);
});