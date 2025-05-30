'use client'
import { Pagination, Table, TextField, Button, Tooltip, Dropdown, Loader } from "@navikt/ds-react";
import { TrashIcon,CaretDownIcon } from '@navikt/aksel-icons';
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { lastDeployFilterMapping } from "../../interfaces/lastDeployFilterMapping";
import { useRouter, useSearchParams } from 'next/navigation'
import { regexpMatchByValuesIEventEnriched } from "@/lib/frontendlibs/utils";
import { IEventEnriched } from "@/interfaces/IEvent";
import { IQueryParameter } from "@/interfaces/querys";

const defaultRowsPerPage = 42;
const defaultTimespan = "6M"


const regexpTooltipsString = "rexep values '.' and '*' are allowed";
export default function LogTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationFilter = (searchParams.get("application") || "") as string;
  const environmentFilter = (searchParams.get("environment") || "") as string;
  const [deployerFilter, setDeployerFilter] = useState("")
  const [versionFilter, setVersionFilter] = useState("")
  const [timeFilter, setTimeFilter] = useState("")
  const [data, setData] = useState<IEventEnriched[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [page, setPage] = useState(1);
  const [deployEventTimeLimit, setdeployEventTimeLimit] = useState(searchParams.get("last") || defaultTimespan);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const setRowsPerPageHandler = (rowsPerPage: number): void => {
    setRowsPerPage(rowsPerPage);
  }

  const applyFilters = ():IEventEnriched[] => {
  
    let filteredJsonData:IEventEnriched[] = [...data];

    if (applicationFilter != ""){
      filteredJsonData = regexpMatchByValuesIEventEnriched(filteredJsonData, "application", applicationFilter.split(","))
    }
    if (environmentFilter != ""){
      filteredJsonData = regexpMatchByValuesIEventEnriched(filteredJsonData, "environment", environmentFilter.split(","))
    }
    if (deployerFilter != "") {
      filteredJsonData = regexpMatchByValuesIEventEnriched(filteredJsonData, "deployer", deployerFilter)
    }
    if (versionFilter != "") {
      filteredJsonData = regexpMatchByValuesIEventEnriched(filteredJsonData, "version", versionFilter)
    }
    if (timeFilter != "") {
      filteredJsonData = regexpMatchByValuesIEventEnriched(filteredJsonData, "deployed_timestamp", timeFilter)
    }
    return filteredJsonData
  }

  const filteredData = applyFilters();
  let sortData = filteredData;
  sortData = sortData.length >1 ? sortData.slice((page - 1) * rowsPerPage, page * rowsPerPage): sortData;

  const makeRequest = async (timespan: string) => {
      const params: IQueryParameter = {}  // = new URLSearchParams()

      if (applicationFilter != ""){
        applicationFilter.split(",").forEach((value) => {
          params["application"] = value
        })
      }

      if (environmentFilter != "") {
        environmentFilter.split(",").forEach((value) => {
          params["environment"] = value
        })
      }

      if (timespan) {
        params["last"] = timespan
      }

      await axios.get('/api/v1/deploylog', {params: params})
        .then(({ data }) => {
          setData(data);
          setIsDataFetched(true);
        })
        .catch(() => {
          console.error("Fetching data failed")
        })
    }
    
    const clearFilters = (): void => {
        setRowsPerPage(defaultRowsPerPage);
        setDeployerFilter("")
        setVersionFilter("")
        setTimeFilter("")
        router.push("/log")
    }

    const getLabelByDeployEventTimeLimit = (deployEventTimeLimit: string) => {
      const filteredElement = lastDeployFilterMapping.find(element => element.momentValue === deployEventTimeLimit);
      return filteredElement ? filteredElement.label : undefined;
    }

    useEffect(() => {
      if ( !isDataFetched) {
        //console.log("data is not fetched")
        makeRequest(deployEventTimeLimit);
      }
    }, [deployEventTimeLimit,isDataFetched]);

    const updateURL= (key: string, value: string): void => {
      let url: string = ""
      if (key == "application") {
        url = `?${new URLSearchParams({
            application: value,
            environment: environmentFilter
          })}`
      } else if (key == "environment") {
        url = `?${new URLSearchParams({
            application: applicationFilter,
            environment: value
          })}`
      } else if (key == "last") {
            url = `?${new URLSearchParams({
                application: applicationFilter,
                environment: environmentFilter,
                last: value
            })}`
        }
    router.push(url, {scroll: true})
    }

    const onApplicationFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateURL("application", e.target.value)
    }
    const onEnvironmentFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateURL("environment", e.target.value)
    }
    const onDeployerFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDeployerFilter(e.target.value)
    }
    const onVersionFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
      setVersionFilter(e.target.value)
    }
    const onTimeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTimeFilter(e.target.value)
    }

    const onClickDeployFilter = (momentValue: string) => {
      setIsDataFetched(false)
      //makeRequest(momentValue)
      setdeployEventTimeLimit(momentValue);
      updateURL("last", momentValue)
  }
    return (
      <div style={{marginRight: "auto", marginLeft: "auto", width: "90%" }}>
          <div style={{display: "flex"}}>
          <h2 style={{margin:4}}>Event {isDataFetched ? data.length : ""}</h2>
          <div style={{display: "inline-flex"}}>
          <Dropdown>
            <Button as={Dropdown.Toggle} icon={<CaretDownIcon title="Select timespan for log" fontSize="1.5rem" />} style={{margin:4, height:"20"}} size="small">{getLabelByDeployEventTimeLimit(deployEventTimeLimit)}</Button>
            <Dropdown.Menu>
              <Dropdown.Menu.List>
                {lastDeployFilterMapping.map((choice) => {
                  if (choice.momentValue == "" ) { return }
                  return (
                    <Dropdown.Menu.List.Item key={choice.momentValue} onClick={() => {onClickDeployFilter(choice.momentValue)}} >{choice.label}</Dropdown.Menu.List.Item>
                  )
                }
                )}
              </Dropdown.Menu.List>
            </Dropdown.Menu>
          </Dropdown>
          <Tooltip content="#rader">
            <TextField label="#rader" hideLabel style={{width: 40, margin:4}} inputMode="numeric" value={rowsPerPage} onInput={(e) => setRowsPerPageHandler(+e.currentTarget.value)}/>
          </Tooltip>
          </div>
          </div>
          {isDataFetched ? (
          <>
          <Table size="medium" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col"><Tooltip content={regexpTooltipsString}><TextField label="application" hideLabel placeholder="application" value={applicationFilter} onChange={onApplicationFilter}/></Tooltip></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="environment" hideLabel placeholder="environment" value={environmentFilter} onChange={onEnvironmentFilter}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="deployer" hideLabel placeholder="deployer" value={deployerFilter} onChange={onDeployerFilter}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="version" hideLabel placeholder="version" value={versionFilter} onChange={onVersionFilter}/></Table.HeaderCell>
                <Table.HeaderCell scope="col"><TextField label="time" hideLabel placeholder="time" value={timeFilter} onChange={onTimeFilter}/></Table.HeaderCell>
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
                        {/* <Table.DataCell>{deployed_timestamp ? deployed_timestamp.toLocaleDateString : ""}</Table.DataCell> */}
                        <Table.DataCell>{moment(deployed_timestamp).fromNow() + " (" + moment(deployed_timestamp).format('lll') + ")"}</Table.DataCell>
                      </Table.Row>
                    )
                  })}
            </Table.Body>
          </Table>
          { sortData.length > 0 && (
            <Pagination
            page={page}
            onPageChange={setPage}
            count={ sortData.length == 0 ? 1 : Math.ceil(data.length / rowsPerPage)}
            size="small"
            />
            )
          }
          </>
          ) :(
           <Loader size="3xlarge" title="Loading..." variant="interaction" />
          )}
      </div>
      )
}
