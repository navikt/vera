'use client'
import { Pagination, Table, TextField, Button, Tooltip, Dropdown } from "@navikt/ds-react";
import { TrashIcon,CaretDownIcon } from '@navikt/aksel-icons';
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import _, { forOwn } from "lodash";
import { lastDeployFilterMapping } from "../../interfaces/lastDeployFilterMapping";
import { IEventResponse } from "@/interfaces/IFilteredJsonData";


const defaultRowsPerPage = 42;

export default function LogTable({
    searchParams
}: {
    searchParams: unknown
}) {
    const [data, setData] = useState<IEventResponse[]>([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [page, setPage] = useState(1);
    const [deployEventTimeLimit, setdeployEventTimeLimit] = useState("1w");
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

    //const rowsPerPage = 5; // For pagination

    const handleFilter = ( field: string, e: string) => {
      setFilters({
        ...filters,
        [field]: e,
      });
    };

    const setRowsPerPageHandler = (rowsPerPage: number): void => {
      console.log("Set rows " + rowsPerPage)
      setRowsPerPage(rowsPerPage);
  }
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

    let sortData = filteredData;
    sortData = sortData.length>1 ? sortData.slice((page - 1) * rowsPerPage, page * rowsPerPage): sortData;

    const makeRequest = async (timespan: string) => {
        console.log("Fetching new status")
        await axios.get('/api/v1/deploylog?last='+timespan)
          .then(({ data }) => {
            setData(data);
            setIsDataFetched(true);
          })
    }
    
    const clearFilters = () => {
        setFilters({}); // TODO Does not empty inputfield.
        setRowsPerPage(defaultRowsPerPage);
    }

    const setSearchParamsAsFilters = (searchParams: any): void => {
      console.log("searchParams")
      console.log(searchParams)
      //const params = Object.fromEntries(searchParams.entries());
      forOwn(searchParams, function(value, key) {
        console.log("params " + key + ": " + value)
        handleFilter(key, value);
      });
    }

    const getLabelByDeployEventTimeLimit = (deployEventTimeLimit: string) => {
      return _.chain(lastDeployFilterMapping).filter((element) => {
        return element.momentValue === deployEventTimeLimit;
      }).first().value().label
    }

    useEffect(() => {
        if ( !isDataFetched) {
            console.log("data is not fetched")
            makeRequest(deployEventTimeLimit);
        }

        setSearchParamsAsFilters(searchParams);

    }, [isDataFetched, deployEventTimeLimit, searchParams, setSearchParamsAsFilters]);

    return (
      <div style={{marginRight: "auto", marginLeft: "auto", width: "90%" }}>
        <div> <h2>Event {isDataFetched ? data.length : ""} </h2>
        <Dropdown>
          <Button as={Dropdown.Toggle} icon={<CaretDownIcon title="a11y-title" fontSize="1.5rem" />} size="small">{getLabelByDeployEventTimeLimit(deployEventTimeLimit)}</Button>
          <Dropdown.Menu>
            <Dropdown.Menu.List>
              {lastDeployFilterMapping.map((choice) => {
                return (
                  <Dropdown.Menu.List.Item key={choice.momentValue} onClick={() => {makeRequest(choice.momentValue); setdeployEventTimeLimit(choice.momentValue)}} >{choice.label}</Dropdown.Menu.List.Item>
                )
              }
              )}
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
        <Tooltip content="Rows per page">
                <TextField label="rowsPerPage" hideLabel placeholder="rowsPerPage" style={{width: 50}} inputMode="numeric" defaultValue={rowsPerPage} onInput={(e) => setRowsPerPageHandler(e.currentTarget.value)}/>
        </Tooltip>
        
        </div>
          <Table size="medium" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col"><TextField label="application" hideLabel placeholder="application" value={filters["application"]} onInput={(e) => handleFilter("application", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="environment" hideLabel placeholder="environment" value={filters["environment"]} onInput={(e) => handleFilter("environment", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="deployer" hideLabel placeholder="deployer" value={filters["deployer"]} onInput={(e) => handleFilter("deployer", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="version" hideLabel placeholder="version" value={filters["version"]} onInput={(e) => handleFilter("version", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="time" hideLabel placeholder="time" value={filters["time"]} onInput={(e) => handleFilter("time", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.DataCell scope="col">
                  <Tooltip content="Clear filters"><Button variant="primary-neutral" size="small" onClick={clearFilters} icon={<TrashIcon title="clear-filters"/>} ></Button></Tooltip>
                </Table.DataCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortData.map(({application, environment, deployer, version, deployed_timestamp}, i) => {

                    return (
                     <Table.Row key={i + application + version}>
                        <Table.HeaderCell scope="row">{application}</Table.HeaderCell>
                        <Table.DataCell>{environment}</Table.DataCell>
                        <Table.DataCell>{deployer}</Table.DataCell>
                        <Table.DataCell>{version ? version: <div><TrashIcon title="Undeployed"/>Undeployed</div>}</Table.DataCell>
                        <Table.DataCell>{deployed_timestamp}</Table.DataCell>
                        <Table.DataCell>{moment(deployed_timestamp).fromNow()}</Table.DataCell>
                      </Table.Row>
                    )
              })}
            </Table.Body>
          </Table>
          {
            sortData.length > 0 && (
            <Pagination
              page={page}
              onPageChange={setPage}
              count={ data.length == 0 ? 1 : Math.ceil(data.length / rowsPerPage)}
              size="small"
            />
            )
          }
        </div>
      );
}

