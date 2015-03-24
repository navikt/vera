var config = require("../config/config");
var logger = require("../config/syslog");
var Event = require('../models/event');
var _ = require('lodash');
var moment = require('moment');

exports.deployLog = function () {
    return function (req, res, next) {
        var predicate = {}

        _.forOwn(req.query, function (value, key) {
            if (_.has(parameterDefinition, key)) {
                var keyToUse = parameterDefinition[key].mapToKey ? parameterDefinition[key].mapToKey : key;
                var transformFunction = parameterDefinition[key].transform;

                try {
                    predicate[keyToUse] = transformFunction(value);
                } catch(exception){
                    res.statusCode = 400;
                    throw new Error(exception);
                }

            } else {
                res.statusCode = 400;
                throw new Error("Unknown parameter provided: " + key + ". Valid parameters are: " + _.keys(parameterDefinition).join(", "));
            }
        });

        Event.find(predicate).sort([['deployed_timestamp', 'descending']]).exec(function (err, events) {
            res.write(JSON.stringify(events));
            res.send();
        });
    }
}

var caseInsensitiveRegexMatch = function (val) {
    return new RegExp("^" + val + "$", "i");
}

var fromMomentFormatToActualDate = function (momentValue) {
    var timespanPattern = /(^[0-9]+)([a-zA-Z]+$)/;
    if (timespanPattern.test(momentValue)) {
        var matches = momentValue.match(timespanPattern);
        var quantity = matches[1];
        var timeUnit = matches[2];
        return {"$gte": moment().subtract(quantity, timeUnit).format()}
    } else {
        throw new Error("Invalid format for parameter 'last'. Format should be <number><period>, e.g. '7days'. See http://momentjs.com/docs/#/manipulating for more info");
    }
};

var emptyOrAll = function (boolean) {
    if (boolean === 'false') {
        return {$exists: true}; // matches all values as long as the key is present (null-value as well)
    } else {
        return null;
    }
}

var parameterDefinition = {
    application: {transform: caseInsensitiveRegexMatch},
    environment: {transform: caseInsensitiveRegexMatch},
    deployer: {transform: caseInsensitiveRegexMatch},
    environmentClass: {transform: caseInsensitiveRegexMatch},
    version: {transform: caseInsensitiveRegexMatch},
    last: {transform: fromMomentFormatToActualDate, mapToKey: "deployed_timestamp"},
    onlyLatest: {transform: emptyOrAll, mapToKey: "replaced_timestamp"},
    filterUndeployed: {
        transform: function (val) {
            return (val === "true") ? {'$ne': null} : {'$exists': true};
        }, mapToKey: "version"
    }
}

exports.config = function () {
    return function(req, res, next){
        var environmentCfg = {
            plasterUrl: config.plasterUrl,
            dbUrl: config.dbUrl,
            dbUser: config.dbUser
        }
        res.send(environmentCfg);
    }
}

exports.getVersion = function () {
    return function (req, res, next) {

        var whereFilter = {};
        if (req.query.app) {
            whereFilter.application = new RegExp(req.query.app, "i");
        }
        if (req.query.env) {
            whereFilter.environment = new RegExp(req.query.env, "i");
        }
        if (req.query.last) {
            var timespan = req.query.last;
            var timespanPattern = /(^[0-9]+)([a-zA-Z]+$)/;
            if (timespanPattern.test(timespan)) {
                var matches = timespan.match(timespanPattern);
                var quantity = matches[1];
                var timeUnit = matches[2];
                whereFilter.deployed_timestamp = {"$gte": moment().subtract(quantity, timeUnit).format()}
            } else {
                res.statusCode = 400;
                throw new Error("Invalid format for parameter 'last'. Format should be <number><period>, e.g. '7days'. See http://momentjs.com/docs/#/manipulating for more info");
            }
        }

        Event.find(whereFilter).sort([['deployed_timestamp', 'descending']]).exec(function (err, events) {
            res.write(JSON.stringify(events));
            res.send();
        });
    }
}

exports.registerEvent = function () {
    function logErrorHandler(err) {
        if (err) {
            logger.error(err);
        }
    }

    function handleErrors(err, res) {
        if (err.name !== 'ValidationError') {
            res.statusCode = 500;
            throw new Error("Unable to save event", err);
        }
        var mappedErrors = [];
        Object.keys(err.errors).forEach(function (elem) {
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
        var validated = function (body) {
            if (!body.environment) {
                res.statusCode = 400;
                throw new Error("Property environment is missing in request");
            }

            if (body.version !== undefined && body.version.trim() === "") {
                res.statusCode = 400;
                throw new Error("Property version is empty. If you are trying to undeploy you must remove the property.");
            }

            return body;
        }

        var event = Event.createFromObject(validated(req.body));

        Event.find({
            environment: new RegExp("^" + event.environment + "$", "i"),
            application: new RegExp("^" + event.application + "$", "i"),
            replaced_timestamp: ""
        }).exec(function (err, events) {
            event.save(function (err, savedEvent) {
                if (err) {
                    handleErrors(err, res);
                } else {
                    events.forEach(function (e) {
                        e.replaced_timestamp = new Date();
                        e.save(logErrorHandler);
                    })
                    logger.log("Saved event", savedEvent.toJSON());
                    res.send(200, JSON.stringify(savedEvent.toJSON()));
                }
            }.bind(events));
        });
    }
}


