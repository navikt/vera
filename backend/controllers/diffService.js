var config = require("../config/config");
var logger = require("../config/syslog");
var Event = require('../models/event');
var _ = require('lodash');

exports.diffEnvironments = function (req, res, next) {
    var requestParams = req.query;
    var baseEnv = requestParams.base;
    var environments = requestParams.comparewith.split(",").concat(baseEnv);

    Event.getLatestDeployedApplicationsFor(environments.map(toEnvironmentQuery), function (err, events) {
            var baseEvents = getEventsForEnvironment(events, baseEnv);
            var comparedEvents = baseEvents.map(function (baseEvent) {
                return {
                    application: baseEvent.application,
                    environments: compareToBase(baseEvent, events, environments)
                }
            });

            res.header("Content-Type", "application/json; charset=utf-8");
            res.json(comparedEvents);
        }
    );
}

var compareToBase = function (baseEvent, events, environments) {

    return environments.map(function (environment) {
        var eventToCompare = getEventFor(events, baseEvent.application, environment)
        var isBaseEnvironment = (environment === baseEvent.environment);

        var diffResult = {
            environment: environment,
            isBaseEnvironment: isBaseEnvironment
        }

        if (eventToCompare) {
            diffResult.event = eventToCompare
            diffResult.diffToBase = eventToCompare.version === baseEvent.version ? 0 : -1
        }
        return diffResult;
    })
};


var getEventFor = function (events, application, environment) {
    return _.chain(events).filter(function (event) {
        return event.environment.toLowerCase() === environment &&
            event.application.toLowerCase() === application
    }).first().value();
}

var getEventsForEnvironment = function (events, environment) {
    return events.filter(function (e) {
        return e.environment.toLowerCase() === environment
    })
}


var toEnvironmentQuery = function (env) {
    return {environment: caseInsensitiveRegexMatch(env)}
}

var caseInsensitiveRegexMatch = function (val) {
    return new RegExp("^" + val + "$", "i");
}


