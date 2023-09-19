'use client'
import { Table, Tooltip, Link } from "@navikt/ds-react";
import { StarFillIcon  } from '@navikt/aksel-icons';

import { v4 as uuidv4 } from 'uuid';
import { IEventEnriched, IFilteredJsonData, IFilteredJsonDataBody, IHeader } from "@/interfaces/IFilteredJsonData";
import _ from "lodash";


export default function VersionTable ({
    filteredJsonData,
    inverseTable
}:{
    filteredJsonData: IFilteredJsonData,
    inverseTable: boolean
}) {

    const headerToRender: IHeader[] = filteredJsonData.header
    const bodyToRender: IFilteredJsonDataBody[] = filteredJsonData.body

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
                {bodyToRender.map((row) => {
                    const firstColumn: (string | undefined) = _.head(row);
                    const dataColumns: (undefined | IEventEnriched)[] = _.tail(row);
                    const queryElement = inverseTable ? 'environment' : 'application';
                     return (
                        <Table.Row key={uuidv4()}>
                            <Table.HeaderCell key={firstColumn}><Link href={"/log?"+queryElement+"="+firstColumn}>{firstColumn}</Link></Table.HeaderCell>
                            {dataColumns.map((cell: IEventEnriched) => {
                                    return (
                                        <Table.DataCell key={(cell) ? cell.id : uuidv4()}><CellContent cell={cell}/></Table.DataCell>)
                                })}
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </Table>
    )
}

function CellContent({
    cell
}:{
    cell: IEventEnriched
}) {

    if (!cell) {
        return '-';
    }

    const buildTooltip = (versionEntry: IEventEnriched) => {
        const newDeploymentLegend = <div><small>{newDeploymentIcon()}: deployed in the last 24 hrs</small></div>

        return (
            <>
                <div>{versionEntry.momentTimestamp.fromNow() + " by: " + versionEntry.deployer}</div>
                {versionEntry.newDeployment ? newDeploymentLegend : null}
            </>
        )
    }
    
    const createLinkQuery = (cellContent: IEventEnriched): string => {
        return "environment="+ cellContent.environment +"&application=" + cellContent.application
    }

    const newDeploymentIcon = () => {
        return (
            <span>
                <StarFillIcon title="NewDeployment" fontSize="1rem" />
            </span>
        );
    }

    return (
        <Tooltip content={buildTooltip(cell)}>
            <Link href={"log?"+ createLinkQuery(cell)}>{cell.version} {cell.newDeployment ? newDeploymentIcon() : null}</Link>
        </Tooltip>
    );
}


