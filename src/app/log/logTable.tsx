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
    const [filteredData, setfilteredData] = useState<IEventResponse[]>(data);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [page, setPage] = useState(1);
    //const [filter, setFilter] = useState({});

    const [filterObject, setFilterObject] = useState({
        application: "",
        environment: "",
        deployer: "",
        version: "",
        deployed_timestamp: ""
    })
    console.log(filterObject)
    const rowsPerPage = 4;
  
    //let sortData = data; // Go Fetch
    //sortData = sortData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleFilter = (label:string, value:string) => {
        //console.log(label, value)
        //filterObject[label] = new RegExp("^" + value + "$");
        let regex = "";
        if (value != "") {
            regex = "^" + value + "*";
        }
        
        setfilteredData( 
            data.filter(event => {
            return Object.keys(filterObject).every((key) => {
                console.log(event[key])
              return new RegExp(filterObject[key]).test(String(event[key]));
            });
          })
        )
        //setFilterObject({...filterObject, [label]: regex} );
    }


/*     const filteredData = data.filter((event: any) => {
        //console.log(event)
        return Object.keys(filterObject).forEach((key) =>{
            //console.log("objectkeys")
            if (event[key] == null ) {
                return
            }
            return event[key].toLowerCase().match(filterObject[key].toLowerCase())
        });
      });
      console.log(filteredData) */

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

