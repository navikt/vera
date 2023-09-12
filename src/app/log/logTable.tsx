'use client'
import { Pagination, Table, TextField  } from "@navikt/ds-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";


interface IEventResponse {
    application: string,
    environment: string,
    version: string,
    deployer: string,
    deployed_timestamp: string
}

export default function LogTable({
    searchParams
}: {
    searchParams: {  }
}) {
    const [data, setData] = useState<IEventResponse[]>([]);
    //const [filteredData, setfilteredData] = useState<IEventResponse[]>(data);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [page, setPage] = useState(1);
    
    const [filters, setFilters] = useState<Record<string, string>>({});

    const handleFilter = ( field: string, e: string) => {
      setFilters({
        ...filters,
        [field]: e,
      });
    };

    const filteredData = data.filter((row) => {
      return Object.keys(filters).every((key) => {
        try {
          const regex = new RegExp(filters[key], 'i');
          return regex.test(String(row[key as keyof IEventResponse]));
        } catch (e) {
          // Invalid regular expression
          return true;
        }
      });
    });

    const makeRequest = async () => {
        console.log("Fetching new status")
        await axios.get('/api/v1/deploylog?last=1w')
          .then(({ data }) => {
            setData(data);
            setIsDataFetched(true);
            //console.log(data)
          })
    }
    
    useEffect(() => {
        if ( !isDataFetched) {
            console.log("data is not fetched")
            makeRequest();
        }
    }, [isDataFetched]);

    return (
      <div className="grid gap-4">
        <h1> Event {isDataFetched ? data.length : ""}</h1>
          <Table size="medium" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col"><TextField label="application" hideLabel onInput={(e) => handleFilter("application", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="environment" hideLabel onInput={(e) => handleFilter("environment", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="deployer" hideLabel onInput={(e) => handleFilter("deployer", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="version" hideLabel onInput={(e) => handleFilter("version", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="time" hideLabel onInput={(e) => handleFilter("time", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredData.map(({application, environment, deployer, version, deployed_timestamp}, i) => {
                    return (
                     <Table.Row key={i + application + version}>
                        <Table.HeaderCell scope="row">{application}</Table.HeaderCell>
                        <Table.DataCell>{environment}</Table.DataCell>
                        <Table.DataCell>{deployer}</Table.DataCell>
                        <Table.DataCell>{version}</Table.DataCell>
                        <Table.DataCell>{deployed_timestamp}</Table.DataCell>
                        <Table.DataCell>{moment(deployed_timestamp).fromNow()}</Table.DataCell>
                      </Table.Row>
                    )
              })}
            </Table.Body>
          </Table>
    {/*       <Pagination
            page={page}
            onPageChange={setPage}
            count={Math.ceil(data.length / rowsPerPage)}
            size="small"
          /> */}
        </div>
      );
}

