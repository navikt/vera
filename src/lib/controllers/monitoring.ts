import connectDB from "../db/db"
import config from "../config/config"
import packageJson from "../../../package.json"
import mongoose from "mongoose"
import { ICheckresult, ISelftestResult } from "@/interfaces/ISelftests"

export async function selftest() {
    const startTime = Date.now()
    const selftestResult: ISelftestResult = {
        application: "vera",
        version: packageJson.version,
        timestamp: "",
        aggregateResult: 0,
        statusCode: 500,
        checks: [],
    }
    const checkResult: ICheckresult = {
        endpoint: config.dbUrl,
        description: "Check mongodb connectivity",
        result: mongoose.STATES[mongoose.connection.readyState]
    }

    if (checkResult.result != "connected") {
        console.log("No connection to database. Trying to reconnect")
        try {
            const connection: typeof mongoose = await connectDB()
            if ( connection ) {
                console.log("DB Connected")
            }
            const endTime = Date.now()
            checkResult.result = mongoose.STATES[mongoose.connection.readyState]
            checkResult.responseTime = endTime - startTime + " ms"
            if (checkResult.result.toLowerCase() == "connected") {
                selftestResult.statusCode = 200
            } 
        } catch (error) {
            console.log("DB catch error")
            const endTime = Date.now()
            checkResult.result = mongoose.STATES[mongoose.connection.readyState]
            checkResult.responseTime = endTime - startTime + " ms"
            checkResult.errorMessage = "mongodb problems"
            checkResult.stackTrace = JSON.stringify(error)
            selftestResult.statusCode = 400
        }
    } else if (checkResult.result == "connected") {
        selftestResult.statusCode = 200
    }

    selftestResult.checks.push(checkResult)
    return selftestResult
}
