import connectDB from "../db";
import config from "../config/config";
import Event from "../models/Event"
import packageJson from '../../../package.json';
//import moment, { Moment } from 'moment';

/* exports.isalive = function (res) {
    res.status(200).send()
} */

interface ICheckresult {
    endpoint: string;
    description: string;
    result?: number;
    responseTime?: string;
    errorMessage?: string;
    stackTrace?: string;
}

interface ISelftestResult {
    application: string;
    version: string;
    timestamp: string;
    aggregateResult: number;
    checks: ICheckresult[];
}

export async function selftest() {
    var startTime = Date.now();
    //console.log("check for mongodb connection");
    var selftestResult: ISelftestResult = {
        "application": "vera",
        "version": packageJson.version,
        "timestamp": "",
        "aggregateResult": 0,
        "checks": []
    }
    var checkResult: ICheckresult = {
        endpoint: config.dbUrl,
        description: "Check mongodb connectivity"
    }
    
    let statusCode;
    try {
        await connectDB();
        const result = await Event.findOne();
        //console.log("result");
        //console.log(result)
        var endTime = Date.now();
        
        checkResult.result = 0;
        checkResult.responseTime = (endTime - startTime) + " ms"
        statusCode = 200;
    } catch (error) {
        var endTime = Date.now();
        checkResult.result = 1;
        checkResult.responseTime = (endTime - startTime) + " ms"
        checkResult.errorMessage = "mongodb problems"
        checkResult.stackTrace = JSON.stringify(error)
        console.log(JSON.stringify(error))
        statusCode = 400
    }

    selftestResult.checks.push(checkResult)
    //console.log("monitoring.selftest()")
    //console.log(selftestResult)
    //console.log(statusCode)
    return {statusCode, selftestResult};
}