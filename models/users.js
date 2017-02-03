'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema(
        {
            twitter: {
                id: String,
            },
            nbrClicks: {
                clicks: Number
            }
        }
    );
    
User.statics.findOrCreate = function findOrCreate(profile, callback){
    console.log('form users.js line 18', profile);
    
    var userObj = new this();
    
    this.findOne({ 'twitter.id' : profile.id }, function(err,result) { 
        if(!result) {
            userObj.twitter.id = profile.id;
            userObj.nbrClicks = 0;
            
            userObj.save(callback);
        } else {
            callback(err,result);
        }
    });
};
    
module.exports = mongoose.model('User', User);