import { IEventEnriched, IEventResponse } from "@/interfaces/IFilteredJsonData";
import { isArray, isString } from "lodash";

function doFiltersExist(filters: string[]| string): boolean {
    return !filters || filters.length === 0;
}

export function regexpMatchByValuesIEventResponse(collection: IEventResponse[], property: string, filters: string[] | string): IEventResponse[] {
    if (doFiltersExist(filters)) {
      return collection;
    }

    return collection.filter((item: IEventResponse) => {
      let match = false;

        if (isArray(filters)) {
            for (let i = 0; i < filters.length; i++) {
                const filterPattern = new RegExp(
                    '\\b' + filters[i].trim().replace(new RegExp('\\*', 'g'), '.*') + '\\b'
                );
                
                if (item[property].toLocaleLowerCase().search(filterPattern) > -1) {
                    match = true;
                }
            }
        } 
        if (isString(filters)) {
            console.log("stringfilter", filters)
            const filterPattern = new RegExp(
                '\\b' + filters.trim().replace(new RegExp('\\*', 'g'), '.*') + '\\b'
            );
            console.log("filterpatterns", filterPattern)
            console.log("itemproperty", item[property])
            if (item[property].toLocaleLowerCase().search(filterPattern) > -1) {
                match = true;
            }
        } 
        return match;
    });
}

export function regexpMatchByValuesIEvent(collection: IEventEnriched[], key: string, filters: string[]| string): IEventEnriched[] {
    if (doFiltersExist(filters)) {
        return collection;
    }

    return collection.filter((item: IEventEnriched) => {
        let match = false
        if (isArray(filters)) {
            for (let i = 0; i < filters.length; i++) {
                const filterPattern = new RegExp(
                    '\\b' + filters[i].trim().replace(new RegExp('\\*', 'g'), '.*') + '\\b'
                );
                const itemproperty = item[key]
                if (isValidProperty(item, key) && typeof itemproperty === 'string' &&
                itemproperty.toLocaleLowerCase().search(filterPattern) > -1) {
                    match = true;
                }
            }
        }

        if (isString(filters)) {
            const filterPattern = new RegExp(
                '\\b' + filters.trim().replace(new RegExp('\\*', 'g'), '.*') + '\\b'
            );

            const itemproperty = item[key]
            if (isValidProperty(item, key) && typeof itemproperty === 'string' &&
            itemproperty.toLocaleLowerCase().search(filterPattern) > -1) {
                match = true;
            }
        }

        return match;
    })
}

function isValidProperty(obj: object, prop: string): prop is keyof typeof obj {
    return prop in obj;
}