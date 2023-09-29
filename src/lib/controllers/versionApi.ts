import config from "../config/config"
import connectDB from "../db"
import Event from "../models/Event"
import jsonToCSV from "@iwsio/json-csv-node"
import moment, { Moment, unitOfTime } from "moment"
import { IEvent, IEventPost } from "@/interfaces/IEvent"
import { IPredicateMongoDefinition, IQueryParameter } from "@/interfaces/querys"
import { IEventEnriched } from "@/interfaces/IEvent"

interface IPredicateDefinition {
    [key: string]: RegExp | { $exists: boolean } | { $gte: string } | { $ne: null } | null
}

function predicateSearchParam(query: IQueryParameter): IPredicateDefinition {
    const predicate: IPredicateDefinition = {}

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
        } /* ,
    csv: {} */,
    }

    for (const [key, value] of Object.entries(query)) {
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
            throw new Error(
                `Unknown parameter provided: ${key}. Valid parameters are: ${Object.keys(parameterDefinition).join(
                    ", ",
                )}`,
            )
        }
    }
    //console.log("predicate", predicate)
    return predicate
}

function isDeployedLast24Hrs (momentTimestamp: Moment, deployDateBackInTime: Moment): boolean {
    return momentTimestamp.isAfter(deployDateBackInTime);
}

export async function deployLog(query: IQueryParameter): Promise<IEventEnriched[]> {
    const predicate = predicateSearchParam(query)
    await connectDB()

    const result: IEvent[] = await Event.find(predicate, { __v: 0, _id: 0 }).sort([["deployed_timestamp", "descending"]]).lean()
    //console.log("result length ", result.length)

    const enrichedLogEvents:IEventEnriched[] = result.map((event) => {
        let newDeployment: boolean = false
        const momentTimestamp: Moment = moment(event.deployed_timestamp)
        if (isDeployedLast24Hrs(momentTimestamp, moment().subtract(24, 'hours'))) {
            newDeployment = true;
        }

        return {
            ...event,
            momentTimestamp: momentTimestamp,
            newDeployment: newDeployment,
        }
    });

    return enrichedLogEvents
}

export async function returnCSVPayload(events: IEvent[]) {
    const toExcelDateFormat = function (value: Date) {
        if (value) {
            return moment(value).format("YYYY-MM-DD HH:mm:ss")
        }
    }
    const jsonToCsvMapping = {
        fields: [
            { name: "environment", label: "environment" },
            { name: "application", label: "application" },
            { name: "version", label: "version" },
            { name: "deployer", label: "deployer" },
            {
                name: "deployed_timestamp",
                label: "deployed_timestamp",
                filter: toExcelDateFormat,
            },
            {
                name: "replaced_timestamp",
                label: "replaced_timestamp",
                filter: toExcelDateFormat,
            },
            { name: "environmentClass", label: "environmentClass" },
            { name: "id", label: "id" },
        ],
    }

    return await jsonToCSV.buffered(events, jsonToCsvMapping)
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
        deployer: obj.deployedBy,
        deployed_timestamp: new Date(),
        replaced_timestamp: null,
        environmentClass: obj.environmentClass ? obj.environmentClass : getEnvClassFromEnv(obj.environment),
    })
}
export async function registerEvent(data: IEvent) {
    /**
     * Creates a new event object, and stores it in mongo if there are no validation errors
     * If a new event document is successfully created, the existing documents for this application and environment are
     * updated so that latest is set to false
     * */

    await connectDB()

    const newEvent = new Event(createEventFromObject(data))

    // Updating existing events
    const existingEvent = await Event.find({
        environment: new RegExp("^" + newEvent.environment + "$", "i"),
        application: new RegExp("^" + newEvent.application + "$", "i"),
        replaced_timestamp: null,
    }).exec()
    await existingEvent.map(async (e) => {
        console.log("existing event replacing" + e)
        e.replaced_timestamp = new Date()
        return e.save()
    })

    // Save new event
    const savedEvent = await newEvent.save()

    console.log(savedEvent)
    console.log(existingEvent)
    console.log("existingEvent")
    console.log(existingEvent)

    //await Promise.all(updatePromise);
    return savedEvent
}
