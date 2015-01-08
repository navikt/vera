var config = require("../../config/config");
var Event = require('../models/event');
var _ = require('lodash');

exports.getVersion = function(){
    return function(req, res, next){

        var resultHandler = function(err, events){
            res.write(JSON.stringify(events));
            res.send();
        }

        Event.find().limit(1337).sort([['timestamp', 'descending']]).exec(resultHandler);
    }
}

exports.registerDeployment = function () {
    return function (req, res, next) {
        validateProperties(req.body, function(err){
            res.send(400, err);
        });

        var event = Event.createFromObject(req.body);

        event.save(function(err, event){
            if (err){
                throw new Error("Unable to save event", err);
            }
            res.send(200, JSON.stringify(event));
        });
    }
}

function validateProperties(jsonObj, err) {
    var requiredKeys = ["application", "environment", "version", "deployedBy"];
    for (var idx in requiredKeys) {
        var key = requiredKeys[idx]
        if (!_.has(jsonObj, key)) {
            err("Unable to find required property " + key);
        }
    }
}
