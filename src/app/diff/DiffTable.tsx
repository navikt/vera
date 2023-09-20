'use client'

import { IEventResponse } from "@/interfaces/IFilteredJsonData"
import { Table } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import _ from "lodash";
import { IEvent } from "@/interfaces/IEvent";
import { IDiffEvent, environment } from "@/interfaces/IDiffEvent";


const BASE = "BASE";
const BEHIND = -1;
const AHEAD = 1;
const EQUAL = 0;
const UNKNOWN = "UNKNOWN";
const MISSING = 9;

const version_emojii = {
    [BEHIND]: '🔼',
    [AHEAD]: '🔽',
    [EQUAL]: '✅',
    [UNKNOWN]: '❓',
    [MISSING]: '❌',
}


const sortOrder = [BEHIND, MISSING, UNKNOWN, AHEAD, EQUAL, BASE];

export default function DiffTable({
    environments,
    diffResult,
    baseEnvironment,
    appFilter
}:{
    environments: string[]
    diffResult: any
    baseEnvironment: string
    appFilter: string[]
})  {

    const [appFilterRegExp, setAppFilterRegExp] = useState<RegExp>();

    useEffect(()=> {
        if (appFilter.length > 0) {
            buildRegexpFromAppFilter(appFilter)
        }
    }, [appFilter])

    const buildRegexpFromAppFilter = (appFilter:string[]): void => {
        var regexp = appFilter.map((elem) => {
            return elem.toLowerCase() + ".*"
        }).join('|')

        return setAppFilterRegExp(new RegExp(regexp))
    }

    const applyAppFilter = (diffResult: IEventResponse): boolean => {
        if(appFilterRegExp ) {
            return appFilterRegExp.test(diffResult.application)
        }
 
        return true;
    }

    const sortByDiffResult= (elem) => {
        return _.reduce(elem.environments, function (result, value) {
            var index = _.indexOf(sortOrder, getDiffResult(value))
            result = index < result ? index : result;
            return result;

        }, sortOrder.length)
    }

    const getDiffResult = (something) => {
        if (something.isBaseEnvironment) {
            return BASE;
        } else if (_.isNumber(something.diffToBase)) {
            return something.diffToBase;
        } else if (!something.event) {
            return MISSING
        }
        return UNKNOWN;
    }


    const filteredJsonData: IEvent[] = diffResult.filter((event: IEvent) => {
            if ( appFilterRegExp) {
                return appFilterRegExp.test(event.application)
            }
            return true
        })
  /*       .sort((a: IEventResponse, b: IEventResponse) => {
            const result = sortByDiffResult(a,b)
            return result !== 0 ? result : a.application.localeCompare(b.application)
        }) */
    
    const dataFormatter = (list: IEvent[]): IDiffEvent[] => {

        var updatedList: IDiffEvent[] = []

        list.forEach((elem: IEvent) => {
            const existingElem = updatedList.find((e) => e.application == elem.application)

            if (existingElem) {
                existingElem.environments.push({
                    environment: elem.environment,
                    version: elem.version,
                })

            } else {
                updatedList.push({
                    application: elem.application,
                    environments: [{
                        environment: elem.environment,
                        version: elem.version
                    }]
                })
            }
        
        })

        updatedList.forEach((elem: IDiffEvent) => setCompareResult(elem))

        return updatedList
    }
    
    const setCompareResult = (elem: IDiffEvent): IDiffEvent => {
        const baseVersion = elem.environments.find((env) => env.environment === baseEnvironment)?.version || "MISSING"
        elem.environments.forEach((env) => {
            if (env.version) {
                env.comparedToBase = compareVersions(baseVersion, env.version)
            } else {
                env.comparedToBase = undefined
            }
        })
        return elem
    }

    const compareVersions = (versionA: string, versionB: string): number => {
        const [partsA, partsB] = [versionA, versionB].map((version) =>
          version.split(/[.-]/).map((part) => (isNaN(Number(part)) ? part : Number(part)))
        );
      
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
          const [partA = '', partB = ''] = [partsA[i], partsB[i]];
      
          if (typeof partA === 'number' && typeof partB === 'number') {
            if (partA < partB) return AHEAD;
            if (partA > partB) return BEHIND;
          } else if (typeof partA === 'string' && typeof partB === 'string') {
            const strComparison = partA.localeCompare(partB);
            if (strComparison !== 0) return strComparison;
          }
        }
      
        return EQUAL;
      }

    const createEnvDataCell = (elem: IDiffEvent, env: string) => {
        let element = elem.environments.find((item) => item.environment === env)

        
        
        if (element) {

            if( env === baseEnvironment) { 
                return element.version || '-'
            }

            if (!elem.environments.some((obj) => Object.values(obj).some((value) => value === baseEnvironment))) {
                return element.version || '-'     
            }

            element.comparedToBase = element.comparedToBase
            element.version = element.version || '-'

           
            return `${version_emojii[element.comparedToBase]} ${element.version}`
        }

        return '-'
        
    }

   /*  const allObjectsHaveSameValue = (listOfObjects: IDiffEvent[]) => listOfObjects.every(
        (obj) => obj. === listOfObjects[0].version
    ); */

    return (
        <Table size="medium" zebraStripes>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>applications</Table.HeaderCell>
                    {environments.map((elem) => {
                        return (
                            <Table.HeaderCell key={elem}>{elem}</Table.HeaderCell>
                        )
                    })}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {dataFormatter(filteredJsonData).map((elem: IDiffEvent, i: number) => (
                    <Table.Row key={i + elem.application}>
                        <Table.HeaderCell scope="row">{elem.application}</Table.HeaderCell>
                        {environments.map((env) => (<Table.HeaderCell key={i + env} scope="row">{createEnvDataCell(elem, env)}</Table.HeaderCell>))}
                    </Table.Row>
                ))
                }
            </Table.Body>
        </Table>
        
    )
}