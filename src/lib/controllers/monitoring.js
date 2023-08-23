import connectDB from "../db";
const config = require("../config/config");
import Event from "../models/Event"
const packageJson = require('../../../package.json')
const moment = require('moment');

/* exports.isalive = function (res) {
    res.status(200).send()
} */

export async function selftest() {
    var startTime = Date.now();
    await connectDB();
    var selftestResult = {
        "application": "vera",
        "version": packageJson.version,
        "timestamp": moment(),
        "aggregateResult": 0,
        "checks": []
    }
    var checkResult = {
        "endpoint": config.dbUrl,
        "description": "Check mongodb connectivity"
    }

    let statusCode;

    try {
        const result = await Event.findOne();
        console.log("result");
        console.log(result)
        var endTime = Date.now();
        
        checkResult.result = 0;
        checkResult.responseTime = (endTime - startTime) + " ms"
        statusCode = 200;
    } catch (error) {
        console.log("result.error");
        console.log(error)
        var endTime = Date.now();
        checkResult.result = 1;
        checkResult.responseTime = (endTime - startTime) + " ms"
        checkResult.errorMessage = "mongodb problems"
        checkResult.stackTrace = JSON.stringify(error)
        statusCode = 500
    }

    selftestResult.checks.push(checkResult)
    console.log("monitoring.selftest()")
    console.log(selftestResult)
    console.log(statusCode)
    return statusCode, selftestResult;
}