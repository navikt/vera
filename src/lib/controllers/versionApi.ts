import config from "../config/config"
import Event from "../models/Event"
import moment, { Moment, unitOfTime } from "moment"
import { IEvent, IEventPost } from "@/interfaces/IEvent"
import { IPredicateMongoDefinition, IQueryParameter } from "@/interfaces/querys"
import { IEventEnriched } from "@/interfaces/IEvent"
import { json2csv } from 'csv42'
interface IPredicateDefinition {
    [key: string]: RegExp | { $exists: boolean } | { $gte: string } | { $ne: null } | null
}

const parameterDefinition: IPredicateMongoDefinition = {
    application: { mongoTransformation: caseInsensitiveRegexMatch },
    environment: { mongoTransformation: caseInsensitiveRegexMatch },
    deployer: { mongoTransformation: caseInsensitiveRegexMatch },
    environmentClass: { mongoTransformation: caseInsensitiveRegexMatch },
    version: { mongoTransformation: caseInsensitiveRegexMatch },
    last: {
        mongoTransformation: fromMomentFormatToActualDate,
        mapToKey: "deployed_timestamp",
    },
    onlyLatest: {
        mongoTransformation: emptyOrAll,
        mapToKey: "replaced_timestamp",
    },
    filterUndeployed: {
        mongoTransformation: emptyOrNotExist,
        mapToKey: "version",
    }
}

function predicateSearchParam(query: IQueryParameter): IPredicateDefinition {
    const predicate: IPredicateDefinition = {}

    for (const [key, value] of Object.entries(query)) {
        if (value == ""){
            break
        }
        const definition = parameterDefinition[key]
        if (definition) {
            const keyToUse = definition.mapToKey ? definition.mapToKey : key
            const transformFunction = definition.mongoTransformation
            try {
                if (transformFunction) {
                    predicate[keyToUse] = transformFunction(value)
                }
            } catch (exception) {
                console.log("Mongo transformation failed")
                console.log(exception)
                console.log(typeof exception)
                throw new Error("" + exception)
            }
        } else {
            throw new Error(`Unknown parameter provided: ${key}. Valid parameters are: ${Object.keys(parameterDefinition).join(", ")}`);
        }
    }

    // Setting default predicate if others are empty
    //const defaultQuery= {onlyLatest: "true"}
    if (Object.keys(predicate).length == 0) {
        const defaultKey = "onlyLatest"
        const defaultValue = "true"
        //console.log("predicate is empty", predicate)
        const definition = parameterDefinition[defaultKey]
        const keyToUse = definition.mapToKey ? definition.mapToKey : defaultKey
        const transformFunction = definition.mongoTransformation
        if (transformFunction) {
            predicate[keyToUse] = transformFunction(defaultValue)
        } 
    }
    
    return predicate
}

function isDeployedLast24Hrs (momentTimestamp: Moment, deployDateBackInTime: Moment): boolean {
    return momentTimestamp.isAfter(deployDateBackInTime);
}

export async function deployLog(query: IQueryParameter): Promise<IEventEnriched[]> {
    if(query["csv"]) {
        delete query.csv
    }
    const predicate = predicateSearchParam(query)
    //await connectDB()

    const result: IEvent[] = await Event.find(predicate, { __v: 0, _id: 0 }).sort([["deployed_timestamp", "descending"]]).allowDiskUse(true).lean()
    //console.log("result length ", result.length)
    const enrichedLogEvents:IEventEnriched[] = result.map((event) => {
        let newDeployment: boolean = false
        const momentTimestamp: Moment = moment(event.deployed_timestamp)
        if (isDeployedLast24Hrs(momentTimestamp, moment().subtract(24, 'hours'))) {
            newDeployment = true;
        }
        let namespace: string| undefined
        let cluster: string|undefined
        const isClusterArray = event.environment.split(":")
        if (isClusterArray.length == 2) {
            const namespaces = event.environment.split(":")
            namespace = namespaces[0]
            cluster = namespaces[1]
        }

        return {
            ...event,
            momentTimestamp: momentTimestamp,
            newDeployment: newDeployment,
            namespace: namespace,
            cluster: cluster
        }
    });

    return enrichedLogEvents
}

export function returnCSVPayload(events: IEventEnriched[]) {
    const toExcelDateFormat = function (value?: Date) {
        if (value) {
            return moment(value).format("YYYY-MM-DD HH:mm:ss")
        }
    }

    return json2csv(events, {
        header: true,
        fields: [
            { name: "application", getValue: (item) => item.application },
            { name: "environment", getValue: (item) => item.environment },
            { name: "environmentClass", getValue: (item) => item.environmentClass },
            { name: "version", getValue: (item) => item.version },
            { name: "deployer", getValue: (item) => item.deployer },
            { name: "deployed_timestamp", getValue: (item) => toExcelDateFormat(item.deployed_timestamp) },
            { name: "replaced_timestamp", getValue: (item) => toExcelDateFormat(item.replaced_timestamp) },
            { name: "newDeployment", getValue: (item) => item.newDeployment },
            { name: "namespace", getValue: (item) => item.namespace },
            { name: "cluster", getValue: (item) => item.cluster },
        ],
    })
}

function caseInsensitiveRegexMatch(val: string): RegExp {
    return new RegExp("^" + val + "$", "i")
}

function fromMomentFormatToActualDate(momentValue: string): { $gte: string } {
    const timespanPattern = /(^[0-9]+)([a-zA-Z]+$)/
    if (timespanPattern.test(momentValue)) {
        const matches = momentValue.match(timespanPattern)
        if (matches) {
            const quantity: number = Number(matches[1])
            const timeUnit: unitOfTime.DurationConstructor = matches[2] as unitOfTime.DurationConstructor
            return { $gte: moment().subtract(quantity, timeUnit).format() }
        } else {
            throw new Error("Parameter last does not match pattern " + timespanPattern)
        }
    } else {
        throw new Error(
            "Invalid format for parameter 'last'. Format should be <number><period>, e.g. '7days'. See http://momentjs.com/docs/#/manipulating for more info",
        )
    }
}

function emptyOrAll(boolean: string): { $exists: boolean } | null {
    const toCheck: boolean = boolean.toLowerCase() === "true"
    if (!toCheck) {
        return { $exists: true } // matches all values as long as the key is present (null-value as well)
    } else {
        return null
    }
}

function emptyOrNotExist(boolean: string): { $exists: boolean } | { $ne: null } {
    const toCheck: boolean = boolean.toLowerCase() === "true"
    if (!toCheck) {
        return { $exists: true } // matches all values as long as the key is present (null-value as well)
    } else {
        return { $ne: null }
    }
}

export function getConfig() {
    return {
        dbUrl: config.dbUrl,
        dbUser: config.dbUser,
    }
}

function getEnvClassFromEnv(environment: string) {
    const potentialEnvClass = environment.charAt(0).toLowerCase()
    if (potentialEnvClass === "t" || potentialEnvClass === "q" || potentialEnvClass === "p") {
        return potentialEnvClass
    }
    return "u"
}

function createEventFromObject(obj: IEventPost) {
    return new Event({
        application: obj.application,
        environment: obj.environment,
        version: obj.version || null,
        deployer: obj.deployer || obj.deployedBy,
        deployed_timestamp: new Date(),
        replaced_timestamp: null,
        environmentClass: obj.environmentClass ? obj.environmentClass : getEnvClassFromEnv(obj.environment),
    })
}
export async function registerEvent(data: IEventPost) {
    /**
     * Creates a new event object, and stores it in mongo if there are no validation errors
     * If a new event document is successfully created, the existing documents for this application and environment are
     * updated so that latest is set to false
     * */
    if (!(data.deployer || data.deployedBy)) {
        throw new Error("deployer or deployedBy must be set")
    }
    
    const newEvent = new Event(createEventFromObject(data))

    // Updating existing events
    const existingEvent = await Event.find({
        environment: new RegExp("^" + newEvent.environment + "$", "i"),
        application: new RegExp("^" + newEvent.application + "$", "i"),
        replaced_timestamp: null,
    }).exec()
    existingEvent.map(async (e) => {
        //console.log("existing event replacing " + e.application)
        e.replaced_timestamp = new Date()
        return e.save()
    })

    // Save new event
    const savedEvent = await newEvent.save()

/*     console.log(savedEvent)
    console.log(existingEvent)
    console.log("existingEvent")
    console.log(existingEvent) */

    //await Promise.all(updatePromise);
    return savedEvent
}
