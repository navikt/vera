var config = require("../config/config");
var logger = require("../config/syslog");
var Event = require('../models/event');
var jsonToCSV = require('json-csv');
var _ = require('lodash');
var moment = require('moment');

exports.deployLog = function (req, res, next) {
    var predicate = {}


    const start = Date.now();

    _.forOwn(req.query, function (value, key) {
        if (_.has(parameterDefinition, key)) {
            var keyToUse = parameterDefinition[key].mapToKey ? parameterDefinition[key].mapToKey : key;
            var transformFunction = parameterDefinition[key].mongoTransformation;
            try {
                if (transformFunction) {
                    predicate[keyToUse] = transformFunction(value);
                }
            } catch (exception) {
                res.statusCode = 400;
                throw new Error(exception);
            }

        } else {
            res.statusCode = 400;
            throw new Error(`Unknown parameter provided: ${key}. Valid parameters are:  ${_.keys(parameterDefinition).join(", ")}`);
        }
    });



    Event.find(predicate).sort([['deployed_timestamp', 'descending']]).exec(function (err, events) {
        if (req.query.csv === 'true') {
            returnCSVPayload(res, events);
        } else {
            res.header("Content-Type", "application/json; charset=utf-8");
            const aftermongo = Date.now();
            const mongotime = aftermongo - start
            console.log("Got data from momngo for " + req.query + " starting json parsing. Took " + mongotime)
            res.json(events);
            const done = Date.now();
            const afterjson = done - mongotime
            console.log("Done transforming json " + afterjson)

        }
    });
}


var returnCSVPayload = function (res, events) {
    var toExcelDateFormat = function (value) {
        if (value) {
            return moment(value).format("YYYY-MM-DD HH:mm:ss");
        }
    };

    var jsonToCsvMapping = {
        fields: [
            {name: "environment", label: "environment"},
            {name: "application", label: "application"},
            {name: "version", label: "version"},
            {name: "deployer", label: "deployer"},
            {name: "deployed_timestamp", label: "deployed_timestamp", filter: toExcelDateFormat},
            {name: "replaced_timestamp", label: "replaced_timestamp", filter: toExcelDateFormat},
            {name: "environmentClass", label: "environmentClass"},
            {name: "id", label: "id"}
        ]
    };

    jsonToCSV.csvBuffered(events, jsonToCsvMapping, function (err, csv) {
        if (err) {
            res.statusCode = 500;
            throw new Error(err);
        }
        res.header("Content-Type", "text/plain; charset=utf-8");
        res.send(csv);
    });
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
    application: {mongoTransformation: caseInsensitiveRegexMatch},
    environment: {mongoTransformation: caseInsensitiveRegexMatch},
    deployer: {mongoTransformation: caseInsensitiveRegexMatch},
    environmentClass: {mongoTransformation: caseInsensitiveRegexMatch},
    version: {mongoTransformation: caseInsensitiveRegexMatch},
    last: {mongoTransformation: fromMomentFormatToActualDate, mapToKey: "deployed_timestamp"},
    onlyLatest: {mongoTransformation: emptyOrAll, mapToKey: "replaced_timestamp"},
    filterUndeployed: {
        mongoTransformation: function (val) {
            return (val === "true") ? {'$ne': null} : {'$exists': true};
        }, mapToKey: "version"
    },
    csv: {}
}

exports.config = function (req, res, next) {
        var environmentCfg = {
            plasterUrl: config.plasterUrl,
            dbUrl: config.dbUrl,
            dbUser: config.dbUser
        }
        res.json(environmentCfg);
    }



exports.registerEvent =  function (req, res, next) {
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
                    });

                    logger.log(`Saved event ${savedEvent} from client ip ${req.headers["x-forwarded-for"] || req.connection.remoteAddress}` );
                    res.json(savedEvent.toJSON());

                }
            }.bind(events));
        });
}


