'use client'

import { IEventResponse } from "@/interfaces/IFilteredJsonData"
import { Table } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import _ from "lodash";


const BASE = "BASE";
const BEHIND = -1;
const AHEAD = 1;
const EQUAL = 0;
const UNKNOWN = "UNKNOWN";
const MISSING = "MISSING";

const sortOrder = [BEHIND, MISSING, UNKNOWN, AHEAD, EQUAL, BASE];

export default function DiffTable({
    environments,
    diffResult,
    baseEnvironment,
    appFilter
}:{
    environments: string[]
    diffResult: IEventResponse[]
    baseEnvironment: string
    appFilter: string[]
})  {

    const [appFilterRegExp, setAppFilterRegExp] = useState<RegExp>();

    console.log("DiffTable")
    //console.log(diffResult)


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

    const filteredJsonData = diffResult.filter((event) => {
            if ( appFilterRegExp) {
                return appFilterRegExp.test(event.application)
            }
            return true
        })
        .sort((a: IEventResponse, b: IEventResponse) => {
            const result = sortByDiffResult(a,b)
            return result !== 0 ? result : a.application.localeCompare(b.application)
        })

        //.sort([sortByDiffResult, 'application'], ['asc', 'asc'])      
        
        
        
        
        //toSorted([sortByDiffResult, 'application'], ['asc', 'asc'])


/*     const buildTableRow = (eventsForApp:IEventResponse) => {
        var self = this;

        function generateTooltip(event) {
            return (
                <Tooltip>
                    <div>{self.tooltipText(event)}</div>
                </Tooltip>
            )
        }

        return environments.map((env) => {
            var event = _.chain(eventsForApp.environments).filter(function (e) {
                return e.environment === env
            }).head().value();

            var version = (event.event) ? event.event.version : "-"
            return (
                <OverlayTrigger key={uuid.v1()} placement="left" overlay={generateTooltip(event)}>
                    <td className='text-nowrap'>
                        <div>
                            <i className={self.diffIcon(event)}/>
                            &nbsp;{version}
                        </div>
                    </td>
                </OverlayTrigger>
            )
        })
    } */

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
                {filteredJsonData.map((elem, i) => (
                    <Table.Row key={i + elem.application + elem.version}>
                        <Table.HeaderCell scope="row">{elem.application}</Table.HeaderCell>
                        {/* buildTableRow(elem) */}
                    </Table.Row>

                    /* <tr key={uuid.v1()} className={this.noDiff(elem)}>
                        <td key={elem.application}>{elem.application}</td>
                        {this.tableRow(elem)}
                    </tr> */
                ))
                }
            </Table.Body>
        </Table>
        
    )
}