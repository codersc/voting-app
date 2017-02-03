'use strict';

var path = process.cwd();
var PollHandler = require(path + '/controllers/pollHandler.server.js');

module.exports = function(app, passport) {
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.status(400).send("Oh uh, something went wrong");
        }
    }
    
    function redirectIfUnathenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login');
        }
    }
    
    app.route('/')
        .get(function(req, res) {
            res.sendFile(path + '/public/polls.html'); 
        });
        
    var pollHandler = new PollHandler();
        
    app.route('/polls')
        .get(function(req, res) {
            res.sendFile(path + '/public/polls.html'); 
        });
        
    app.route('/poll/:id')
        .get(function(req, res) {
            res.sendFile(path + '/public/poll.html');
        });
        
    app.route('/api/poll/:id')
        .get(pollHandler.getPoll)
        .delete(pollHandler.deletePoll);
        
    app.route('/api/poll/add/:id/:choice')
        .post(isLoggedIn, pollHandler.addChoice);
        
    app.route('/api/poll/:id/:choice')
        .post(pollHandler.addVote);        
        
    app.route('/api/polls')
        .get(pollHandler.getPolls)
        .post(isLoggedIn, pollHandler.addPoll);
        
    app.route('/api/user/polls')
        .get(pollHandler.getPollsByUser);
        
    app.route('/login')
        .get(function(req, res) {
            res.sendFile(path + '/public/login.html');
        });
    
    app.route('/logout')
        .get(function(req, res) {
            req.logout();
            res.redirect('/login');
        });
        
    app.route('/profile')
        .get(redirectIfUnathenticated, function(req, res) {
            res.sendFile(path + '/public/profile.html');
        });
        
    app.route('/auth/twitter')
        .get(passport.authenticate('twitter'));
        
    app.route('/auth/twitter/callback')
        .get(passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
            res.redirect('/');
        });
        
    app.route('/api/:id')
        .get(function(req, res) {
            res.json(req.user); 
        });
};