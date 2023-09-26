'use client'
import { Pagination, Table, TextField, Button, Tooltip, Dropdown } from "@navikt/ds-react";
import { TrashIcon,CaretDownIcon } from '@navikt/aksel-icons';
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { lastDeployFilterMapping } from "../../interfaces/lastDeployFilterMapping";
import { IEventResponse } from "@/interfaces/IFilteredJsonData";
import { useSearchParams } from 'next/navigation'
import { IFilter } from "@/interfaces/IFilter";
import { regexpMatchByValuesIEventResponse } from "@/lib/frontendlibs/utils";

const defaultRowsPerPage = 42;
const defaultFilter: IFilter = {application: [],
  environment: [],
  environmentClass: ['u', 't', 'q', 'p'],
  version: ""}

  const regexpTooltipsString = "rexep values '.' and '*' are allowed";
export default function LogTable() {
  const searchParams = useSearchParams();


  const [data, setData] = useState<IEventResponse[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [filters, setFilters] = useState<IFilter>(defaultFilter);
  const [page, setPage] = useState(1);
  const [deployEventTimeLimit, setdeployEventTimeLimit] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const handleFilter = ( field: string, e: string) => {
    setFilters({
      ...filters,
      [field]: e.split(","),
    });
  };

  const setRowsPerPageHandler = (rowsPerPage: number): void => {
    console.log("Set rows " + rowsPerPage)
    setRowsPerPage(rowsPerPage);
  }


  const applyFilters = ():IEventResponse[] => {
  
    let filteredJsonData:IEventResponse[] = [...data];

    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as keyof IFilter];
        if (value) {
          filteredJsonData = regexpMatchByValuesIEventResponse(filteredJsonData, key, value)
        }
      })
    }
    return filteredJsonData
  }

    const filteredData = applyFilters();
    let sortData = filteredData;
    sortData = sortData.length >1 ? sortData.slice((page - 1) * rowsPerPage, page * rowsPerPage): sortData;

    const makeRequest = async (timespan: string) => {
        //console.log("Fetching new status")
        let urlQuery = ""
        if (timespan) {
          urlQuery += "?last="+timespan
        }
        await axios.get('/api/v1/deploylog'+urlQuery)
          .then(({ data }) => {
            setData(data);
            setIsDataFetched(true);
          })
    }
    
    const clearFilters = (): void => {
        handleFilter("application", "")
        handleFilter("environment", "")
        setRowsPerPage(defaultRowsPerPage);
        location.replace("/log")
    }

    const getLabelByDeployEventTimeLimit = (deployEventTimeLimit: string) => {
      const filteredElement = lastDeployFilterMapping.find(element => element.momentValue === deployEventTimeLimit);
      return filteredElement ? filteredElement.label : undefined;
    }

    useEffect(() => {
      for (const [key, value] of searchParams.entries()) {
        if (key in filters) {
          setFilters(prevFilters => ({
            ...prevFilters,
            [key]: value.split(',')
          }))
        }
      }
      
      if ( !isDataFetched) {
        //console.log("data is not fetched")
        makeRequest(deployEventTimeLimit);
      }
    }, [deployEventTimeLimit,isDataFetched, searchParams]);

    return (
      <div style={{marginRight: "auto", marginLeft: "auto", width: "90%" }}>
        {/* <HStack gap={{ xs: "1", sm: "2", md: "6", lg: "10", xl: "16" }} justify='center'> */}
        <div style={{display: "flex"}}>
        <h2 style={{margin:4}}>Event {isDataFetched ? data.length : ""}   </h2>
        <div style={{display: "inline-flex"}}>
        <Dropdown>
          <Button as={Dropdown.Toggle} icon={<CaretDownIcon title="Select timespan for log" fontSize="1.5rem" />} style={{margin:4, height:"20"}} size="small">{getLabelByDeployEventTimeLimit(deployEventTimeLimit)}</Button>
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
        <Tooltip content="#rader">
          <TextField label="#rader" hideLabel style={{width: 40, margin:4}} inputMode="numeric" defaultValue={rowsPerPage} onInput={(e) => setRowsPerPageHandler(+e.currentTarget.value)}/>
        </Tooltip>
        </div>
        </div>
          <Table size="medium" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col"><Tooltip content={regexpTooltipsString}><TextField label="application" hideLabel placeholder="application" defaultValue={filters["application"]?.join(",")} onInput={(e) => handleFilter("application", e.currentTarget.value)}/></Tooltip></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="environment" hideLabel placeholder="environment" defaultValue={filters["environment"]?.join(",")} onInput={(e) => handleFilter("environment", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="deployer" hideLabel placeholder="deployer" defaultValue={filters["deployer"]} onInput={(e) => handleFilter("deployer", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="version" hideLabel placeholder="version" defaultValue={filters["version"]} onInput={(e) => handleFilter("version", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="time" hideLabel placeholder="time" defaultValue={filters["time"]} onInput={(e) => handleFilter("time", e.currentTarget.value)}/></Table.HeaderCell>
                <Table.DataCell scope="col">
                  <Tooltip content="Clear filters"><Button variant="primary-neutral" size="medium" onClick={clearFilters} icon={<TrashIcon title="clear-filters"/>} ></Button></Tooltip>
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
              count={ sortData.length == 0 ? 1 : Math.ceil(data.length / rowsPerPage)}
              size="small"
            />
            )
          }
        </div>
      );
}

