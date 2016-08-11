var config = require("../config/config");
var Event = require('../models/event');
var packageJson = require('../../package.json')
var moment = require('moment');


exports.testmyself = function (req, res, next) {
    var startTime = Date.now();

    var selftestResult = {
        "application": "vera",
        "version": packageJson.version,
        "timestamp": moment(),
        "aggregateResult": 0,
        "checks": []
    }

    Event.findOne().exec(function (err, event) {
        var endTime = Date.now();
        var checkResult = {
            "endpoint": config.dbUrl,
            "description": "Check mongodb connectivity",
            "checkResult": 0,
            "responseTime": (endTime - startTime) + " ms"
        }

        if (err) {
            checkResult.result = 1;
            checkResult.errorMessage = "mongodb problems"

            if (err) {
                checkResult.stackTrace = JSON.stringify(err)
            }
            res.statusCode = 500;
        }

        selftestResult.checks.push(checkResult)
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(selftestResult);
    });
}
