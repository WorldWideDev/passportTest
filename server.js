var express = require('express'),
    app = express(),
    port = process.env.PORT || 3030,
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    configDB = require('./config/database.js');

//CONFIGURATION ==============================
mongoose.connect(configDB.url); //connect to database

require('./config/passport')(passport); //pass passport for configuration

//set up express app
app.use(morgan('dev')); //log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressValidator()); // hook validations to app
app.use(express.static(__dirname+'/node_modules'));
app.use(express.static(__dirname+'/client'));

app.set('view engine', 'ejs'); // set up ejs for templating

//required for passport
app.use(session({
    secret: 'secret',
    cookie: {maxage: 6000},
    keys: ['key1', 'key2']
})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//ROUTES ========================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//LAUNCH =========================================
app.listen(port);
console.log('its the year ' + port);
