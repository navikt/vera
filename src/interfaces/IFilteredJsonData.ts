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
