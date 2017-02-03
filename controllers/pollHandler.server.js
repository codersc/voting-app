'use strict';

var Polls = require('../models/polls');
var Poll = require('../models/polls.js');

function PollHandler() {
    this.getPolls = function(req, res) {
        Polls
            .find()
            .exec(function(err, docs) {
                if (err) { throw err; }
                
                res.json(docs);
            });
    };
    
    this.getPoll = function(req, res) {
        console.log('getPoll id requested', req.params.id);
        
        Polls
            .findById({ '_id': req.params.id })
            .exec(function(err, doc) {
                if (err) { throw err; }
                
                console.log('getPoll responding with doc', doc);
                
                res.json(doc);
            });
    };
    
    this.getPollsByUser = function(req, res) {
        Polls
            .find({  'createdBy': req.user.twitter.id })
            .exec(function(err, doc) {
                if (err) { throw err; }
                
                res.json(doc);
            });
    };
    
    this.addPoll = function(req, res) {
        console.log('pollHandler.addPoll() logged ', req.body.choices);
        
        var newPoll = new Poll();
        
        newPoll.title = req.body.poll.title;
        newPoll.createdBy = req.user.twitter.id;
        newPoll.choices = {};
        
        for(var i = 0; i < req.body.choices.length; i++) {
            var choice = req.body.choices[i];
            newPoll['choices'][choice] = 0;
        }
        
        newPoll.save(function(err) {
            if (err) { throw err; }
            
            res.json(newPoll);
        });
    };
    
    this.addVote = function(req, res) {
        var searchTerm = 'choices.' + req.params.choice;
        var update = { $inc: {} };
        
        update.$inc[searchTerm] = 1;
        
        Polls
            .findByIdAndUpdate(
                req.params.id,
                update,
                function(err, doc) {
                    console.log(doc);
                    
                    if (err) { throw err; }
                }
            );
            
        Polls
            .findById({ '_id': req.params.id })
            .exec(function(err, doc) {
                if (err) { throw err; }
                
                console.log('addVote responding with doc', doc);
                
                res.json(doc);
            });
    };
    
    this.deletePoll = function(req, res) {
        Polls
            .remove(
                { '_id': req.params.id },
                function(err, doc) {
                    if (err) { throw err; }
                    
                    res.json(doc);
                }  
            );
            
    };
    
    this.addChoice = function(req, res) {
        var choice = 'choices.' + req.params.choice;
        var update = { $set: {} };
        update.$set[choice] = 0;

        Polls
            .findByIdAndUpdate(
                req.params.id,
                update,
                function(err, doc) {
                    if (err) { throw err; }
                    
                    console.log('addChoice responding with', doc);
                    
                    res.json(doc);
                }
            );
    };
}

module.exports = PollHandler;