var config = require("../config/config");
var Event = require('../models/event');
var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');

exports.getVersion = function () {
    return function (req, res, next) {
        var resultHandler = function (err, events) {
            res.write(JSON.stringify(events));
            res.send();
        }

        var whereFilter = {};
        if (req.query.app) {
            whereFilter.application = new RegExp(req.query.app, "i");
        }
        if (req.query.env) {
            whereFilter.environment = new RegExp(req.query.env, "i");
        }
        if (req.query.last){
            var timespan = req.query.last;
            var timespanPattern = /(^[0-9]+)([a-zA-Z]+$)/;
            if (timespanPattern.test(timespan)){
                var matches = timespan.match(timespanPattern);
                var quantity = matches[1];
                var timeUnit = matches[2];
                whereFilter.timestamp = { "$gte": moment().subtract(quantity, timeUnit).format() }
            } else {
                res.statusCode = 400;
                throw new Error("Invalid format for parameter 'last'. Format should be <number><period>, e.g. '7days'. See http://momentjs.com/docs/#/manipulating for more info");
            }
        }

        Event.find(whereFilter).sort([['timestamp', 'descending']]).exec(resultHandler);
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
    function handleErrors(err, res) {
        if (err.name !== 'ValidationError') {
            res.statusCode = 500;
            throw new Error("Unable to save event", err);
        }
        var mappedErrors = [];
        Object.keys(err.errors).forEach(function(elem) {
            console.log("Errors")
            mappedErrors.push(err.errors[elem].message);
        });
        res.send({status: 400, message: mappedErrors.join(", ")});
    }

    return function (req, res, next) {
        Event.update({
            environment: new RegExp(req.body.environment, "i"),
            application: new RegExp(req.body.application, "i"),
            latest: true
        }, {latest: false}, {multi: true}, function(err, numAffected, raw){

            if (err) { console.error(err); }

            var event = Event.createFromObject(req.body);
            event.save(function (err, event) {
                if(err) {
                    handleErrors(err, res);
                }
                else {
                    res.send(200, JSON.stringify(event.toJSON()));
                }
            });
        });
    }
}


