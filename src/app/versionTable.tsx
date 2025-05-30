'use client'
import { Table, Link } from "@navikt/ds-react";
import { StarFillIcon  } from '@navikt/aksel-icons';

import { v4 as uuidv4 } from 'uuid';
import { IFilteredJsonDataBody, IHeader } from "@/interfaces/IFilteredJsonData";
import { IEventEnriched } from "@/interfaces/IEvent";
import * as HoverCard from '@radix-ui/react-hover-card';
import hoverstyles from "./versionTable.module.css";
import moment from "moment"




export default function VersionTable ({
    filteredJsonData,
    headers,
    inverseTable
}:{
    filteredJsonData: IFilteredJsonDataBody[],
    headers: IHeader[],
    inverseTable: boolean
}) {

    const headerToRender: IHeader[] = headers
    const bodyToRender: IFilteredJsonDataBody[] = filteredJsonData

    const createHeaderLinkQuery = (header: IHeader): string => {
        if (header.queryParams) {
            const query = header.queryParams
            if (query["application"]) {
                return "application="+query["application"]
            } else if (query["environment"]) {
                    return "environment="+query["environment"]
            } else {
                return ""
            }
        } else {
            return ""
        }
    }

    return (
        <Table size="medium" zebraStripes>
            <Table.Header>
            <Table.Row>
                { (headerToRender).map((header) => {
                    return (
                        <Table.HeaderCell scope="col" key={header.columnTitle}>
                            <Link href={"/log?"+createHeaderLinkQuery(header)} >{header.columnTitle.toUpperCase()}</Link>
                        </Table.HeaderCell>
                    )
                })
                }
            </Table.Row>
            </Table.Header>
            <Table.Body>
                {bodyToRender.map((row:IFilteredJsonDataBody) => {
                    const firstColumn: string = validateKeyString(row[0]) //_.head(row);
                    const dataColumns: (string | undefined | IEventEnriched)[] = tail(row) // _.tail(row);
                    const queryElement = inverseTable ? 'environment' : 'application';
                    return (
                        <Table.Row key={uuidv4()}>
                            <Table.HeaderCell key={firstColumn}><Link href={"/log?"+queryElement+"="+firstColumn}>{firstColumn}</Link></Table.HeaderCell>
                            {dataColumns.map((cell: (string | undefined | IEventEnriched)) => {
                                return (
                                    <Table.DataCell key={uuidv4()}><CellContent cell={cell}/></Table.DataCell>)
                                })}
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </Table>
    )
}

function validateKeyString(input: string | IEventEnriched | undefined): string {
    if ( typeof input === 'string') {
        return input
    }
    return uuidv4(); 

}

function tail(arr: IFilteredJsonDataBody): (string | undefined | IEventEnriched)[] {
    const result = [];
    for (let i = 1; i < Object.keys(arr).length; i++) {
      result.push(arr[i]);
    }
    return result;
  }

function CellContent({
    cell
}:{
    cell: (string | undefined | IEventEnriched)
}) {

    if (!cell || typeof cell === 'string') {
        return '-';
    }

    const buildTooltip = (versionEntry: IEventEnriched) => {
        const newDeploymentLegend = <div><small>{newDeploymentIcon()}: deployed in the last 24 hrs</small></div>

        return (
            <>
                <div style={{fontSize: "1.0rem"}}>{moment(versionEntry.momentTimestamp).fromNow() +" (" + moment(versionEntry.momentTimestamp).format('lll') + ") by: " + versionEntry.deployer}</div>
                {versionEntry.newDeployment ? newDeploymentLegend : null}
            </>
        )
    }
    
    const createLinkQuery = (cellContent: IEventEnriched): string => {
        return "application="+ cellContent.application +"&environment=" + cellContent.environment
    }

    const newDeploymentIcon = () => {
        return (
            <span>
                <StarFillIcon title="NewDeployment" fontSize="1rem" />
            </span>
        );
    }

    return (
        <HoverCard.Root openDelay={1}>
        <HoverCard.Trigger asChild><Link href={"log?"+ createLinkQuery(cell)}>{cell.version} {cell.newDeployment ? newDeploymentIcon() : null}</Link></HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content className={hoverstyles.HoverCardContent} sideOffset={5}>
            {buildTooltip(cell)}
            <HoverCard.Arrow className={hoverstyles.HoverCardArrow} />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    )
}


