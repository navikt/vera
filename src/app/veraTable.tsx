'use client'
import { TextField, Button, Dropdown, Tooltip, Pagination } from "@navikt/ds-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { ArrowsSquarepathIcon, TrashIcon, CaretDownIcon } from '@navikt/aksel-icons';
import VersionTable from "./versionTable";
import _ from "lodash";
import moment, { Moment } from "moment";
import buildVersionMatrix from "../lib/vera-parser";
import { IEventEnriched, IFilteredJsonData, IFilteredJsonDataBody } from "@/interfaces/IFilteredJsonData";
import { lastDeployFilterMapping } from "../interfaces/lastDeployFilterMapping";
import { ToggleButtonGroup } from "@/component/toggle-button-group";
import { useSearchParams } from "next/navigation";
import { IFilter } from "@/interfaces/IFilter";
import { regexpMatchByValuesIEvent } from "@/lib/frontendlibs/utils";

const defaultFilter: IFilter = {application: [],
    environment: [],
    environmentClass: ['t', 'q', 'p']}

export default function VeraTable() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<IEventEnriched[]>([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [filters, setFilters] = useState<IFilter>(defaultFilter);
    const [inverseTable, setInverseTable] = useState(false);
    const [deployEventTimeLimit, setdeployEventTimeLimit] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(42);

    const getLabelByDeployEventTimeLimit = (deployEventTimeLimit: string) => {
        return _.chain(lastDeployFilterMapping).filter((element) => {
          return element.momentValue === deployEventTimeLimit;
        }).first().value().label
    }

    const changeInverseTable = () => {
        setInverseTable(inverseTable ? false: true)
    }

    const setRowsPerPageHandler = (rowsPerPage: number): void => {
        console.log("Set rows " + rowsPerPage)
        setRowsPerPage(rowsPerPage);
    }

    const makeRequest = async (timespan: string) => {
        const isDeployedLast24Hrs = (logEvent: IEventEnriched, deployDateBackInTime: Moment): boolean| undefined => {
            return logEvent.momentTimestamp?.isAfter(deployDateBackInTime);
        };

        console.log("Fetching new status")
        let urlQuery: string = "?onlyLatest=true&filterUndeployed=true"
        if (timespan != "") {
          urlQuery = urlQuery +"&last="+timespan
        }
        await axios.get('/api/v1/deploylog'+urlQuery)
            .then(({ data }) => {
                const enrichedLogEvents = data.map((logEvent: IEventEnriched) => {
                    logEvent.momentTimestamp = moment(logEvent.deployed_timestamp);
                    if (isDeployedLast24Hrs(logEvent, moment().subtract(24, 'hours'))) {
                        logEvent.newDeployment = true;
                    return logEvent;
                }

            return logEvent;
        });

        setData(enrichedLogEvents);
          setIsDataFetched(true);
          //console.log(data)
        })
    }

    const handleFilter = ( field: string, e: string) => {
        setFilters({
          ...filters,
          [field]: e.split(","),
        });
      };

    const setEnvClassFilter = (envClasses: string[]) => {
        setFilters({
            ...filters,
            ["environmentClass"]: envClasses
        });
    }

    const applyFilters = (): IFilteredJsonData => {
        let filteredJsonData: IEventEnriched[] = _.clone(data);
       if (filters) {
            Object.keys(filters).forEach((key) => {
                const value = filters[key as keyof IFilter];
                if (value) {
                    filteredJsonData = regexpMatchByValuesIEvent(filteredJsonData, key, value)
                }
            })
        } 
 
        return buildVersionMatrix(filteredJsonData, inverseTable);
    } 
    const filteredJsonData: IFilteredJsonData = applyFilters()


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
            console.log("data is not fetched")
            makeRequest(deployEventTimeLimit);
        }
    }, [filters, searchParams, isDataFetched, deployEventTimeLimit]);
    
    const applyFiltersButton = () => {
        location.href="?apps="+filters["application"]?.join(",").toLocaleLowerCase() +"&envs="+filters["environment"]?.join(",").toLocaleLowerCase();
    }
    //console.log(filteredJsonData)
    let sortData: IFilteredJsonDataBody[] = filteredJsonData.body;
    sortData = sortData.length>1 ? sortData.slice((page - 1) * rowsPerPage, page * rowsPerPage): sortData;

    const clearFilters = (): void => {
        filters["application"] = []
        filters["environment"] = []
        setInverseTable(false)
        filters["environmentClass"] = defaultFilter.environmentClass

    }

    return (
        <div style={{marginRight: "auto", marginLeft: "auto", padding: "15px"}}>
        <div style={{display: "flex"}}>
            <TextField label="application" hideLabel placeholder="application" style={{width: 200, margin:4}} defaultValue={filters["application"]?.join(",")} onInput={(e) => handleFilter("application", e.currentTarget.value)}/>
            <TextField label="environment" hideLabel placeholder="environment" style={{width: 200, margin:4}} defaultValue={filters["environment"]?.join(",")} onInput={(e) => handleFilter("environment", e.currentTarget.value)}/>
            <Button variant="primary" size="small" style={{margin:4}} onClick={() => applyFiltersButton()} icon={<ArrowsSquarepathIcon title="Apply filters" fontSize="1.5rem" />}>apply</Button>
            <Button variant="primary" size="small" style={{margin:4}} onClick={() => clearFilters()} icon={<TrashIcon title="clear-filters"/>} >clear filter</Button>
            <Button variant="primary-neutral" size="small" style={{margin:4}} onClick={changeInverseTable} icon={<ArrowsSquarepathIcon title="invertere tabell" fontSize="1.5rem" />} >inverse</Button>
            <Dropdown>
            <Button as={Dropdown.Toggle} icon={<CaretDownIcon title="Velg tidsrom" fontSize="1.5rem" />} size="small" style={{margin:4}} variant="primary">
                {getLabelByDeployEventTimeLimit(deployEventTimeLimit)}
            </Button>
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
            <Tooltip content="Show envclasses">
            <ToggleButtonGroup onChange={setEnvClassFilter} style={{margin:4}} defaultValue={filters.environmentClass} variant="action" size="small">
                    <ToggleButtonGroup.Item value="u">u</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="t">t</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="q">q</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="p">p</ToggleButtonGroup.Item>
            </ToggleButtonGroup>
            </Tooltip>
            <Tooltip content="Rows per page">
                <TextField label="rowsPerPage" hideLabel placeholder="rowsPerPage" style={{width: 40, margin:4}} inputMode="numeric" defaultValue={rowsPerPage} onInput={(e) => setRowsPerPageHandler(+e.currentTarget.value)}/>
            </Tooltip>
        </div>
        <VersionTable filteredJsonData={filteredJsonData} inverseTable={inverseTable}/>
        {
            sortData && (
            <Pagination
              page={page}
              onPageChange={setPage}
              count={data.length > 0 ? Math.ceil(data.length / rowsPerPage): 1}
              size="small"
            />
            ) 
          }
        </div>
    )
}