'use client'
import { TextField, Button, Dropdown, Tooltip, Pagination, Loader, Switch, HelpText } from "@navikt/ds-react";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { ArrowsSquarepathIcon, TrashIcon, CaretDownIcon } from '@navikt/aksel-icons';
import VersionTable from "./versionTable";
import buildVersionMatrix from "../lib/vera-parser";
import { IFilteredJsonData } from "@/interfaces/IFilteredJsonData";
import { IEventEnriched } from "@/interfaces/IEvent";
import { lastDeployFilterMapping } from "../interfaces/lastDeployFilterMapping";
import { ToggleButtonGroup } from "@/component/toggle-button-group";
import { useSearchParams } from "next/navigation";
import { regexpMatchByValuesIEventEnriched } from "@/lib/frontendlibs/utils";
import { useRouter } from "next/navigation";


const regexpTooltipsString = "rexep values '.' and '*' are allowed";

export default function VeraTable() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const applicationFilter = (searchParams.get("application") || "") as string;
    const environmentFilter = (searchParams.get("environment") || "") as string;
    const environmentClassFilter = (searchParams.get("environmentClass") || "t,q,p") as string;
    const [data, setData] = useState<IEventEnriched[]>([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [inverseTable, setInverseTable] = useState(false);
    const [deployEventTimeLimit, setdeployEventTimeLimit] = useState("1y");
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

    const setEnvClassFilter = (envClasses: string[]) => {
        updateURL("environmentClass", envClasses.join(","))
    }

     const updateURL= (key: string, value: string): void => {
        console.log("UpdateURL")
        let url: string = ""
        if (key == "application") {
            url = `?${new URLSearchParams({
                application: value,
                environment: environmentFilter,
                environmentClass: environmentClassFilter
            })}`
        } else if (key == "environment") {
            url = `?${new URLSearchParams({
                application: applicationFilter,
                environment: value,
                environmentClass: environmentClassFilter
            })}`
        } else if (key == "environmentClass") {
            url = `?${new URLSearchParams({
                application: applicationFilter,
                environment: environmentFilter,
                environmentClass: value
            })}`
        }

        router.push(url, {scroll: true})
    } 

    const getContextAsEnv = ():IEventEnriched[] =>{
        const remappedEnvs2: IEventEnriched[] = data.map((item: IEventEnriched) => {
            return {
                ...item,
                environment: item.cluster ? item.cluster : item.environment,
            }

        })
        return remappedEnvs2;
    }
    const applyFilters = (): IFilteredJsonData => {
        let filteredJsonData: IEventEnriched[] = useClusterAsEnvironment ? getContextAsEnv() : [...data];
        if (applicationFilter != "") {
            filteredJsonData = regexpMatchByValuesIEventEnriched(filteredJsonData, "application", applicationFilter.split(","))

        }
        if (environmentFilter != "") {
            filteredJsonData = regexpMatchByValuesIEventEnriched(filteredJsonData, "environment", environmentFilter.split(","))

        }
        if (environmentClassFilter != "") {
            filteredJsonData = regexpMatchByValuesIEventEnriched(filteredJsonData, "environmentClass", environmentClassFilter.split(","))
        }
    
        return buildVersionMatrix(filteredJsonData, inverseTable);
    }

    const filteredJsonData: IFilteredJsonData = applyFilters()

    const sortData = filteredJsonData.body.length > 1 ? filteredJsonData.body.slice((page -1) * rowsPerPage, page * rowsPerPage): filteredJsonData.body
    
    useEffect(() => {
        if ( !isDataFetched) {
            console.log("data is not fetched")
            makeRequest(deployEventTimeLimit);
        }
    }, [isDataFetched, deployEventTimeLimit]);
    
  
    const handleClearFilters = (): void => {
        setInverseTable(false)
        router.push("/")
    }
    const makeContextAsEnvSwitch = () => {
        setUseClusterAsEnvironment(useClusterAsEnvironment ? false: true)
    }
    const onApplicationFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateURL("application", e.target.value)
    }
    const onEnvironmentFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateURL("environment", e.target.value)
    }

    return (
        <div style={{marginRight: "auto", marginLeft: "auto", padding: "15px"}}>
        <div style={{display: "flex", justifyContent: "space-evenly", alignItems: "baseline"}}>
            <div style={{display:"inherit", alignItems: "inherit"}}>
                <Tooltip content={regexpTooltipsString}>
                <TextField label="application" hideLabel placeholder="application" style={{width: 200, margin:4}} value={applicationFilter} onChange={onApplicationFilter}/>
                </Tooltip>
                <Tooltip content={regexpTooltipsString}>
                <TextField label="environment" hideLabel placeholder="environment" style={{width: 200, margin:4}} value={environmentFilter} onChange={onEnvironmentFilter}/>
                </Tooltip>
                <HelpText title="Helptext">{regexpTooltipsString}</HelpText>
            </div>
            <div style={{display:"inherit", justifyContent: "inherit", alignItems:"inherit"}}>
                <Button variant="primary" size="small" style={{margin:4}} onClick={handleClearFilters} icon={<TrashIcon title="clear-filters"/>} >clear filter</Button>
                <Button variant={inverseTable? "primary-neutral": "primary"} size="small" style={{margin:4}} onClick={changeInverseTable} icon={<ArrowsSquarepathIcon title="invertere tabell" fontSize="1.5rem" />} >inverse</Button>
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
            </div>
            <div style={{display:"inherit", alignItems: "inherit"}}>
            <Tooltip content="Show envclasses">
            <ToggleButtonGroup onChange={setEnvClassFilter} style={{margin:4}} defaultValue={environmentClassFilter.split(",")} variant="action" >
                    <ToggleButtonGroup.Item value="u">u</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="t">t</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="q">q</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="p">p</ToggleButtonGroup.Item>
            </ToggleButtonGroup>
            </Tooltip>
            </div>
            <div style={{display:"inherit", alignItems: "inherit"}}>
            <span style={{verticalAlign:"bottom"}}>#rows</span>
                <Tooltip content="Rows per page">
                    <TextField label="rowsPerPage" hideLabel placeholder="rowsPerPage" style={{width: 60, margin:4}} inputMode="numeric" defaultValue={rowsPerPage} onInput={(e) => setRowsPerPageHandler(+e.currentTarget.value)}/>
                </Tooltip>
            </div>
            <div style={{display:"inherit", alignItems: "inherit"}}>
                <Switch size="small" onClick={makeContextAsEnvSwitch} checked={useClusterAsEnvironment}>Use kubernetes context as environmet</Switch>
            </div>
        </div>
        { isDataFetched ? 
        <>
            <VersionTable filteredJsonData={sortData} headers={filteredJsonData.header} inverseTable={inverseTable}/>
            {
                sortData && (filteredJsonData.body.length > rowsPerPage) && (
                <Pagination
                page={page > Math.ceil(sortData.length / rowsPerPage) ? Math.ceil(sortData.length / rowsPerPage) : page}
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