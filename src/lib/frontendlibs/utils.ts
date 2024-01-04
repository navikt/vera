import { IEventResponse } from "@/interfaces/IFilteredJsonData"
import { IEventEnriched } from "@/interfaces/IEvent"

function doFiltersExist(filters: string[] | string): boolean {
    return !filters || filters.length === 0
}

export function regexpMatchByValuesIEventResponse(
    collection: IEventResponse[],
    property: string,
    filters: string[] | string,
): IEventResponse[] {
    if (doFiltersExist(filters)) {
        return collection
    }

    return collection.filter((item: IEventResponse) => {
        let match = false

        if (Array.isArray(filters)) {
            for (let i = 0; i < filters.length; i++) {
                const filterPattern = new RegExp(
                    "\\b" + filters[i].trim().replace(new RegExp("\\*", "g"), ".*") + "\\b",
                )

                if (filterPattern.test(item[property].toLocaleLowerCase())) {
                    match = true
                }
            }
        }
        if (typeof filters === "string") {
            const filterPattern = new RegExp("\\b" + filters.trim().replace(new RegExp("\\*", "g"), ".*") + "\\b")

            if (filterPattern.test(item[property].toLocaleLowerCase())) {
                match = true
            }
        }
        return match
    })
}

export function regexpMatchByValuesIEventEnriched(
    collection: IEventEnriched[],
    key: string,
    filters: string[] | string,
): IEventEnriched[] {
    if (doFiltersExist(filters)) {
        return collection
    }

    return collection.filter((item: IEventEnriched) => {
        let match = false
        if (Array.isArray(filters)) {
            for (let i = 0; i < filters.length; i++) {
                const filterPattern = new RegExp(
                    "\\b" + filters[i].trim().replace(new RegExp("\\*", "g"), ".*") + "\\b",
                )
                const itemproperty = item[key]
                if (
                    isValidProperty(item, key) &&
                    typeof itemproperty === "string" &&
                    filterPattern.test(itemproperty.toLocaleLowerCase())
                ) {
                    match = true
                }
            }
        }

        if (typeof filters === "string") {
            console.log("filters", filters)
            const filterPattern = new RegExp("\\b" + filters.trim().replace(new RegExp("\\*", "g"), ".*") + "\\b")

            const itemproperty = item[key]
            if (
                isValidProperty(item, key) &&
                typeof itemproperty === "string" &&
                filterPattern.test(itemproperty.toLocaleLowerCase())
            ) {
                match = true
            }
        }

        return match
    })
}

function isValidProperty(obj: object, prop: string): prop is keyof typeof obj {
    return prop in obj
}
