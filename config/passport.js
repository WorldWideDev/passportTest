// config/passport.js

// load the things
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


var User = require('../app/models/user');
var configAuth = require('./auth');

// expose this function to our app
module.exports = function(passport){
    // =============================================
    // PASSPORT SESSION SET UP =====================
    // =============================================
    // required for persistent sessions
    // passport needs ability to serialize and deserialize users out of session

    // used to serialize the user for the session
    console.log('in passport.js');
    passport.serializeUser(function(user, done){
        console.log('serializing user...', user, 'is user');
        done(null, user.id);
    });

    // used to deserialize user
    passport.deserializeUser(function(id, done){
        console.log('deserializing user...');
        User.findById(id, function(err, user){
            console.log(user, 'is deserialzed user');
            done(err, user);
        });
    });

    // =======================================================================================
    // LOCAL SIGNUP ==========================================================================
    // =======================================================================================

    // we are using named strategies since we have one for login and one for signup
    // by defualt, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by defualt, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass bac the entire request to the callback
    },
    function(req, email, password, done){
        // asynchronous
        // User.findOne wont fire unless data is sent back
        console.log('inside local-signup callback');
        process.nextTick(function(){
            if(!req.user){
                console.log(email);
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login alreadt exists
                User.findOne({'local.email': email}, function(err, user){
                    // if there are any errors, return the errors
                    console.log(user, 'is user in passport');

                    // check to see if there's already a user with that email
                    if(user){
                        console.log('there is a user');
                        return done(null, false, req.flash('signupMessage', 'That email already exists'))
                    }else{
                        // if there's no user with that email
                        // create the user
                        console.log('making a user');
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);

                        // save the user
                        newUser.save(function(err){
                            if(err)
                            throw err;
                            return done(null, newUser);
                        });
                    }
                });
            }else{
                var user = req.user;
                user.local.email = email;
                user.local.password = user.generateHash(password);
                console.log(user, 'is newly linked user');
                user.save(function(err){
                    if(err)
                        throw err;
                    return done(null, user);
                })
            }
        });
    }));

    // =======================================================================================
    // LOCAL LOGIN ===========================================================================
    // =======================================================================================

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done){
        // find a user whose email is the same as the forms email
        console.log('entered passport callback for validation (in login)');
        // if(email)
        //     console.log(email, 'is email')
        User.findOne({'local.email': email}, function(err, user){
            if(err)
                //console.log(err, 'is error');
                return done(err);

            // if no user is found, return the message
            if(!user)
                return done(null, false, req.flash('loginMessage', 'No user found')) // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password'));

            // all is well, return the user
            return done(null, user);
        });


    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
        //pull in our app id and secret from our auth.js file
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        passReqToCallback: true, // allows us to pass in the req from our route (check if user in logged in)
        profileFields: ['emails', 'displayName'] //had to add this line, otherwise got TypeError: Cannot read property '0' of undefined
    },
    //facebook will send back the token and profile
    function(req, token, refreshToken, profile, done){
        //asynchronous
        process.nextTick(function(){
            console.log(profile, 'is profile');
            //find user in database based on their facebook id

            if(!req.user){

                User.findOne({'facebook.id': profile.id}, function(err, user){

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if(err)
                        return done(err);

                    //if the user is found, then log them in
                    if(user){
                        return done(null, user)
                        
                    // if there is no user with that facebook id, create them
                    }else{
                        var newUser = new User();
                        //set all of our facebook info to our user models
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.displayName
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        //save newUser to the database
                        newUser.save(function(err){
                            if(err)
                            throw err;
                            //if successfull, return the user
                            return done(null, newUser);
                        })
                    }
                })
            }else{
                console.log('user exists');
                // user already exists and is logged in, we have to link accounts
                var user = req.user;
                // update this user's facebook credentials
                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.facebook.name = profile.displayName;
                user.facebook.email = profile.emails[0].value;

                user.save(function(err){
                    if(err)
                        throw err;
                    return done(null, user);
                });
            }

        });
    }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret: configAuth.twitterAuth.consumerSecret,
        callbackURL: configAuth.twitterAuth.callbackURL,
        passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, done){
        //make code asynchronous: query wont fire until we have all our data back from twitterAuth
        process.nextTick(function(){

            if(!req.user){
                User.findOne({'twitter.id': profile.id}, function(err, user){
                    if(err)
                    return done(err);
                    if(user){
                        return done(null, user);
                    }else{
                        var newUser = new User();

                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.username = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function(err){
                            if(err)
                            throw err;
                            return done(null, newUser);
                        });
                    }
                });
            }else{
                console.log('user exists');
                // user already exists and is logged in, we have to link accounts
                var user = req.user;
                // update this user's twitters credentials
                user.twitter.id = profile.id;
                user.twitter.token = token;
                user.twitter.displayName = profile.displayName;
                user.twitter.username = profile.username;

                user.save(function(err){
                    if(err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================

    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done){
        process.nextTick(function(){
            console.log(profile, 'is google profile');
            if(!req.user){
                User.findOne({'google.id': profile.id}, function(err, user){
                    if(err)
                    return done(err)
                    if(user){
                        return done(null, user)
                    }else{
                        var newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;

                        newUser.save(function(err){
                            if(err)
                            throw err;
                            return done(null, newUser)
                        });
                    }
                });
            }else{
                var user = req.user
                user.google.id = profile.id;
                user.google.token = token;
                user.google.email = profile.emails[0].value;
                user.google.name = profile.displayName;

                user.save(function(err){
                    if(err)
                        throw err;
                    return done(null, user);
                })
            }
        });
    }));











}
