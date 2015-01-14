var config = require("../config/config");
var Event = require('../models/event');
var _ = require('lodash');

exports.getVersion = function () {
    return function (req, res, next) {
        var resultHandler = function (err, events) {
            res.write(JSON.stringify(events));
            res.send();
        }

        var whereFilter = {};
        if(req.query.app) {
            whereFilter.application = new RegExp(req.query.app, "i");
        }
        if(req.query.env) {
            whereFilter.environment = new RegExp(req.query.env, "i");
        }

        Event.find(whereFilter).limit(69).sort([['timestamp', 'descending']]).exec(resultHandler);
    }
}

exports.getCurrentVersions = function () {
    return function (req, res, next) {
        var resultHandler = function (err, events) {
            res.write(JSON.stringify(events));
            res.send();
        }

        Event.find({latest: true}).exec(resultHandler);
    }
}

exports.registerDeployment = function () {
    return function (req, res, next) {
        validateProperties(req.body, function (err) {
            res.statusCode = 400;
            throw new Error(err);
        });

        var event = Event.createFromObject(req.body);

        event.save(function (err, event) {
            if (err) {
                res.statusCode = 500;
                throw new Error("Unable to save event", err);
            }
            res.send(200, JSON.stringify(event));
        });
    }
}

function validateProperties(jsonObj, error) {
    var requiredKeys = ["application", "environment", "version", "deployedBy"];
    for (var idx in requiredKeys) {
        var key = requiredKeys[idx]
        if (!_.has(jsonObj, key)) {
            error("Unable to find required property " + key);
        }
    }
}
