import { Moment } from "moment"

export interface IEvent {
    application: string
    environment: string
    environmentClass?: string
    version?: string
    deployer: string
    deployed_timestamp?: Date
    replaced_timestamp?: Date
}

export interface IEnvironment {
    environment: string
}

export interface IEventPost extends IEvent {
    deployedBy?: string
}

export interface IEventEnriched extends IEvent {
    [key: string]: string | Date | Moment | boolean | undefined
    momentTimestamp: Moment
    newDeployment?: boolean
    namespace?: string
    cluster?: string
}
