var config = require("../config/config");
var logger = require("../config/syslog");
var Event = require('../models/event');
var compareVersions = require('../modules/version-compare')
var _ = require('lodash');

exports.diffEnvironments = function (req, res, next) {
    var requestParams = req.query;
    var baseEnv = requestParams.base;
    var environments = requestParams.comparewith.split(",").concat(baseEnv);

    Event.getLatestDeployedApplicationsFor(environments.map(env => ({environment: env})), function (err, events) {
            const baseEvents = getEventsForEnvironment(events, baseEnv);
            const comparedEvents = baseEvents.map(baseEvent =>
                ({
                    application: baseEvent.application,
                    environments: compareToBase(baseEvent, events, environments)
                })
            );

            res.header("Content-Type", "application/json; charset=utf-8");
            res.json(comparedEvents);
        }
    );
}

const compareToBase = function (baseEvent, events, environments) {
    return environments.map(function (environment) {
        const eventToCompare = getEventFor(events, baseEvent.application, environment)
        const isBaseEnvironment = (environment === baseEvent.environment);
        const diffResult = {
            environment: environment,
            isBaseEnvironment: isBaseEnvironment
        };

        if (eventToCompare) {
            diffResult.event = eventToCompare
            diffResult.diffToBase = compareVersions(eventToCompare.version, baseEvent.version)
        }
        return diffResult;
    })
};

const getEventFor = (events, application, environment) => {
     return _.chain(events).filter(event => {
        return event.environment.toLowerCase() === environment && event.application.toLowerCase() === application
    }).first().value();
}

const getEventsForEnvironment = (events, env) => events.filter( e => e.environment.toLowerCase() === env )