'use client'
import { TextField, Button, Dropdown, Tooltip, Pagination, Loader, Switch } from "@navikt/ds-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { ArrowsSquarepathIcon, TrashIcon, CaretDownIcon } from '@navikt/aksel-icons';
import VersionTable from "./versionTable";
import buildVersionMatrix from "../lib/vera-parser";
import { IFilteredJsonData } from "@/interfaces/IFilteredJsonData";
import { IEventEnriched } from "@/interfaces/IEvent";
import { lastDeployFilterMapping } from "../interfaces/lastDeployFilterMapping";
import { ToggleButtonGroup } from "@/component/toggle-button-group";
import { useSearchParams } from "next/navigation";
import { IFilter } from "@/interfaces/IFilter";
import { regexpMatchByValuesIEvent } from "@/lib/frontendlibs/utils";

const defaultFilter: IFilter = {application: [],
    environment: [],
    environmentClass: ['t', 'q', 'p']}

const regexpTooltipsString = "rexep values '.' and '*' are allowed";

export default function VeraTable() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<IEventEnriched[]>([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [filters, setFilters] = useState<IFilter>(defaultFilter);
    const [inverseTable, setInverseTable] = useState(false);
    const [deployEventTimeLimit, setdeployEventTimeLimit] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(42);
    const [useClusterAsEnvironment, setUseClusterAsEnvironment] = useState(true)

    const getLabelByDeployEventTimeLimit = (deployEventTimeLimit: string) => {
        const filteredElement = lastDeployFilterMapping.find(element => element.momentValue === deployEventTimeLimit);
        return filteredElement ? filteredElement.label : undefined;
    }

    const changeInverseTable = () => {
        setInverseTable(inverseTable ? false: true)
    }

    const setRowsPerPageHandler = (rowsPerPage: number): void => {
        console.log("Set rows " + rowsPerPage)
        setRowsPerPage(rowsPerPage);
    }

    const makeRequest = async (timespan: string) => {
        console.log("Fetching new status")
        let urlQuery: string = "?onlyLatest=true&filterUndeployed=true"
        if (timespan != "") {
          urlQuery = urlQuery +"&last="+timespan
        }
        await axios.get('/api/v1/deploylog'+urlQuery)
            .then(({ data }) => {
            setData(data);
             setIsDataFetched(true);
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
    const getContextAsEnv = ():IEventEnriched[] =>{
        console.log("getContextAsEnv")
        const remappedEnvs2: IEventEnriched[] = data.map((item: IEventEnriched) => {
            return {
                ...item,
                environment: item.cluster ? item.cluster : item.environment,
            }

        })
        console.log("contextdata", remappedEnvs2)
        return remappedEnvs2;
    }
    const applyFilters = (): IFilteredJsonData => {
        let filteredJsonData: IEventEnriched[] = useClusterAsEnvironment ? getContextAsEnv() : [...data];
        if (filters) {
            Object.keys(filters).forEach((key) => {
                const value = filters[key as keyof IFilter];
                if (value) {
                    filteredJsonData = regexpMatchByValuesIEvent(filteredJsonData, key, value)
                }
            })
        } 
        console.log("applyfilters", filteredJsonData)
        return buildVersionMatrix(filteredJsonData, inverseTable);
    }

    const filteredJsonData: IFilteredJsonData = applyFilters()

    const sortData = filteredJsonData.body.length > 1 ? filteredJsonData.body.slice((page -1) * rowsPerPage, page * rowsPerPage): filteredJsonData.body
    //let sortData = data.length > 1 ? data.slice((page -1) * rowsPerPage, page * rowsPerPage): data
    
    //const sortData = 

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


    const clearFilters = (): void => {
        filters["application"] = []
        filters["environment"] = []
        setInverseTable(false)
        filters["environmentClass"] = defaultFilter.environmentClass

    }
    const makeContextAsEnvSwitch = () => {
        setUseClusterAsEnvironment(useClusterAsEnvironment ? false: true)
    }
    return (
        <div style={{marginRight: "auto", marginLeft: "auto", padding: "15px"}}>
        <div style={{display: "flex"}}>
            <Tooltip content={regexpTooltipsString}>
            <TextField label="application" hideLabel placeholder="application" style={{width: 200, margin:4}} defaultValue={filters["application"]?.join(",")} onInput={(e) => handleFilter("application", e.currentTarget.value)}/>
            </Tooltip>
            <Tooltip content={regexpTooltipsString}>
            <TextField label="environment" hideLabel placeholder="environment" style={{width: 200, margin:4}} defaultValue={filters["environment"]?.join(",")} onInput={(e) => handleFilter("environment", e.currentTarget.value)}/>
            </Tooltip>
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
            <span style={{verticalAlign:"bottom"}}>#rows</span>
            <Tooltip content="Rows per page">
                <TextField label="rowsPerPage" hideLabel placeholder="rowsPerPage" style={{width: 60, margin:4}} inputMode="numeric" defaultValue={rowsPerPage} onInput={(e) => setRowsPerPageHandler(+e.currentTarget.value)}/>
            </Tooltip>
            <Switch size="small" onClick={makeContextAsEnvSwitch}>Use kubernetes context as environmet</Switch>
        </div>
        { isDataFetched ? 
        <>
            <VersionTable filteredJsonData={sortData} headers={filteredJsonData.header} inverseTable={inverseTable}/>
            {
                sortData && (filteredJsonData.body.length > rowsPerPage) && (
                <Pagination
                page={page}
                onPageChange={setPage}
                count={filteredJsonData.body.length > 0 ? Math.ceil(filteredJsonData.body.length / rowsPerPage): 1}
                size="small"
                />
                )
            }
        </> 
        : <Loader size="3xlarge" title="Loading..." variant="interaction" />
        }
        
        </div>
    )
}