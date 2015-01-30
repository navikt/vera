var config = require("../config/config");
var Event = require('../models/event');
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
                whereFilter.deployed_timestamp = { "$gte": moment().subtract(quantity, timeUnit).format() }
            } else {
                res.statusCode = 400;
                throw new Error("Invalid format for parameter 'last'. Format should be <number><period>, e.g. '7days'. See http://momentjs.com/docs/#/manipulating for more info");
            }
        }

        Event.find(whereFilter).sort([['deployed_timestamp', 'descending']]).exec(resultHandler);
    }
}

exports.getCurrentVersions = function () {
    return function (req, res, next) {
        function isDeployedIsLast24Hrs(event) {
            return moment(event.deployed_timestamp).isAfter(moment().subtract(24, 'hours'));
        }
        var resultHandler = function (err, events) {
            var transformedEvents = _.map(events, function(event){
                var mongoEvent = event.toJSON();
                mongoEvent.newDeployment = isDeployedIsLast24Hrs(event);
                return mongoEvent;
            });
            res.write(JSON.stringify(transformedEvents));
            res.send();
        }

        Event.find({replaced_timestamp: null}).exec(resultHandler);
    }
}

exports.registerDeployment = function () {
    function logErrorHandler(err) {
        if (err) { console.error(err); }
    }

    function handleErrors(err, res) {
        if (err.name !== 'ValidationError') {
            res.statusCode = 500;
            throw new Error("Unable to save event", err);
        }
        var mappedErrors = [];
        Object.keys(err.errors).forEach(function(elem) {
            mappedErrors.push(err.errors[elem].message);
        });
        res.send({status: 400, message: mappedErrors.join(", ")});
    }

    /**
     * Creates a new event object, and stores it in mongo if there are no validation errors
     * If a new event document is successfully created, the existing documents for this application and environment are
     * updated so that latest is set to false
     * */
    return function (req, res, next) {
        var event = Event.createFromObject(req.body);

        Event.find({
            environment: new RegExp(event.environment, "i"),
            application: new RegExp(event.application, "i"),
            replaced_timestamp: ""
        }).exec( function(err, events){
            event.save(function (err, savedEvent) {
                if(err) {
                    handleErrors(err, res);
                }
                else {
                    events.forEach(function(e) {
                        e.replaced_timestamp = new Date();
                        e.save(logErrorHandler);
                    })
                    res.send(200, JSON.stringify(savedEvent.toJSON()));
                }
            }.bind(events));
        });
    }
}


