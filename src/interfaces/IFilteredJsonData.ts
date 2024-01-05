import { IEventEnriched } from "./IEvent"

export interface IFilteredJsonDataBody {
    [index: number]: string | undefined | IEventEnriched
}

export interface IHeader {
    columnTitle: string
    queryParams: {
        environment?: string
        application?: string
    }
}

export interface IFilteredJsonData {
    body: IFilteredJsonDataBody[]
    header: IHeader[]
}

/* export interface IEventResponse {
    [key: string]: string
    application: string
    environment: string
    version: string
    deployer: string
    deployed_timestamp: string
} */
