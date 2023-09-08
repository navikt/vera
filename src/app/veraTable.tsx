'use client'
import { Table } from "@navikt/ds-react";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader } from "@navikt/ds-react";
import { v4 as uuidv4 } from 'uuid';

export default function VeraTable() {
    const [data, setData] = useState([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [columns, setColumns] = useState([]);
  
    const getEnvironmentData = (data) => {
        const env = data.map(item =>{
            const environment = item.environment;
            console.log(environment)
            return environment
        }) 
        env.sort();
        return env;
    }
    const makeRequest = async () => {
      console.log("Fetching new status")
      await axios.get('/api/v1/deploylog?onlyLatest=true&filterUndeployed=true')
        .then(({ data }) => {
          setData(data);
          setIsDataFetched(true);
          setColumns(getEnvironmentData(data))
          console.log(data)
        })
    }
  
    useEffect(() => {
      if ( !isDataFetched) {
        console.log("data is not fetched")
        makeRequest();
      }
    }, [isDataFetched]);

    return (
        <>
            <Table zebraStripes>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col" key="firstCol">Applikasjon</Table.HeaderCell>
                    {columns.length ? (
                        columns.map((env: string) => (
                            <Table.HeaderCell scope="col" key={env}><Link href={"/log?environment="+{env}}>{env.toUpperCase()}</Link></Table.HeaderCell>
                        ))
                        ) : (  
                            <Table.HeaderCell scope="col"><Loader title="laster..."/></Table.HeaderCell>
                    )
                    }
                </Table.Row>
                </Table.Header>
                <Table.Body>
                    { data.length? (
                        data.map((item) => {
                            return (
                            <Table.Row key={uuidv4()}>
                                <Table.HeaderCell scope="row"><Link href={"/log?application="+item.application}>{item.application}</Link></Table.HeaderCell>
                                {columns.map((cell) => {
                                    return (
                                    <Table.DataCell key={(cell) ? cell.id : uuidv4()}><CellContent data={cell} /></Table.DataCell>
                                    )
                                })}
                            </Table.Row>
                            )
                        })
                    ) : (
                        <Table.HeaderCell scope="col"><Loader title="laster data ..."/></Table.HeaderCell>
                    )
                }
                </Table.Body>
            </Table>
        </>
    )
}

function CellContent({cell}) {
    if (!cell) {
        return '-';
    }
    const createLinkQuery = function (cell) {
        return {environment: cell.environment, application: cell.application, regexp: true }
    };

    const newDeploymentIcon = function () {
        return (
            <span>
                <i className="fa fa-star text-danger"></i>
            </span>
        );
    }

    return (
        <Link href={"/log?"+createLinkQuery(cell)}>
            {cell.version} {cell.newDeployment ? newDeploymentIcon() : null}
        </Link>
    )
}