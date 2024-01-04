'use client'

import { Table } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import { IEvent } from "@/interfaces/IEvent";
import { IDiffEvent } from "@/interfaces/IDiffEvent";

import { ChevronLeftCircleFillIcon, ChevronRightCircleFillIcon, CheckmarkCircleFillIcon, QuestionmarkDiamondFillIcon, XMarkOctagonFillIcon  } from '@navikt/aksel-icons';

//const BASE = "BASE";
const BEHIND = -1;
const AHEAD = 1;
const EQUAL = 0;
const UNKNOWN = 100;
const MISSING = 9;

//const sortOrder = [BEHIND, MISSING, UNKNOWN, AHEAD, EQUAL, BASE];

export default function DiffTable({
    environments,
    diffResult,
    baseEnvironment,
    appFilter
}:{
    environments: string[]
    diffResult: IEvent[]
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
        const regexp = appFilter.map((elem) => {
            return elem.toLowerCase() + ".*"
        }).join('|')

        return setAppFilterRegExp(new RegExp(regexp))
    }

    const filteredJsonData: IEvent[] = diffResult.filter((event: IEvent) => {
            if ( appFilterRegExp) {
                return appFilterRegExp.test(event.application)
            }
            return true
        })
    
    const dataFormatter = (list: IEvent[]): IDiffEvent[] => {

        const updatedList: IDiffEvent[] = []

        list.forEach((elem: IEvent) => {
            const existingElem = updatedList.find((e) => e.application == elem.application)

            if (existingElem) {
                existingElem.environments.push({
                    environment: elem.environment,
                    version: elem.version,
                    comparedToBase: UNKNOWN
                })

            } else {
                updatedList.push({
                    application: elem.application,
                    environments: [{
                        environment: elem.environment,
                        version: elem.version,
                        comparedToBase: UNKNOWN
                    }]
                })
            }
        
        })

        updatedList.forEach((elem: IDiffEvent) => setCompareResult(elem))

        return updatedList.sort((a, b) => a.application.localeCompare(b.application))
    }
    
    const setCompareResult = (elem: IDiffEvent): IDiffEvent => {
        const baseVersion = elem.environments.find((env) => env.environment === baseEnvironment)?.version || "MISSING"
        elem.environments.forEach((env) => {
            if (env.version) {
                env.comparedToBase = compareVersions(baseVersion, env.version)
            } else {
                env.comparedToBase = UNKNOWN
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

    const createDiffIcon = (comparedToBase: number ) => {
        switch (comparedToBase) {
            case AHEAD:
                 return <ChevronLeftCircleFillIcon title="Versjon er nyere enn base" fontSize="1.5rem" />
            case BEHIND:
                return <ChevronRightCircleFillIcon title="Versjon er eldre enn base" fontSize="1.5rem" />
            case EQUAL:
                return <CheckmarkCircleFillIcon  title="Versjon er den samme som base" fontSize="1.5rem" />
            case MISSING:
                return <XMarkOctagonFillIcon title="Versjon er nyere enn base" fontSize="1.5rem" />
            default:
                return <QuestionmarkDiamondFillIcon  title="Klarte ikke å tolke versjonsnr" fontSize="1.5rem" />
        }
    }

    const createEnvDataCell = (elem: IDiffEvent, env: string) => {
        const element = elem.environments.find((item) => item.environment === env)
        
        if (element) {

            if( env === baseEnvironment) { 
                return element.version || '-'
            }

            if (!elem.environments.some((obj) => Object.values(obj).some((value) => value === baseEnvironment))) {
                return element.version || '-'     
            }

            element.version = element.version || '-'

            return ( 
                <>
                    {createDiffIcon(element.comparedToBase)} {element?.version}
                </>
                )
        }

        return '-'
        
    }

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