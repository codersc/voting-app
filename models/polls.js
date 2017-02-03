'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema(
        {
            title: String,
            createdBy: String,
            choices: {}
        }
    );
    
module.exports = mongoose.model('Poll', Poll);