import connectDB from "../db"
import config from "../config/config"
import packageJson from "../../../package.json"

interface ICheckresult {
    endpoint: string
    description: string
    result?: number
    responseTime?: string
    errorMessage?: string
    stackTrace?: string
}

interface ISelftestResult {
    application: string
    version: string
    timestamp: string
    aggregateResult: number
    checks: ICheckresult[]
}

export async function selftest() {
    const startTime = Date.now()
    //console.log("check for mongodb connection");
    const selftestResult: ISelftestResult = {
        application: "vera",
        version: packageJson.version,
        timestamp: "",
        aggregateResult: 0,
        checks: [],
    }
    const checkResult: ICheckresult = {
        endpoint: config.dbUrl,
        description: "Check mongodb connectivity",
    }

    let statusCode
    try {
        await connectDB()
        //const result = await Event.findOne();
        //console.log("result");
        //console.log(result)
        const endTime = Date.now()

        checkResult.result = 0
        checkResult.responseTime = endTime - startTime + " ms"
        statusCode = 200
    } catch (error) {
        const endTime = Date.now()
        checkResult.result = 1
        checkResult.responseTime = endTime - startTime + " ms"
        checkResult.errorMessage = "mongodb problems"
        checkResult.stackTrace = JSON.stringify(error)
        console.log(JSON.stringify(error))
        statusCode = 400
    }

    selftestResult.checks.push(checkResult)
    //console.log("monitoring.selftest()")
    //console.log(selftestResult)
    //console.log(statusCode)
    return { statusCode, selftestResult }
}
