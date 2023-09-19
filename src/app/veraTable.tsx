'use client'
import { TextField, Button, Dropdown, Pagination, Tooltip } from "@navikt/ds-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { ArrowsSquarepathIcon, TrashIcon, CaretDownIcon } from '@navikt/aksel-icons';
import VersionTable from "./versionTable";
import _ from "lodash";
import moment from "moment";
import buildVersionMatrix from "../lib/vera-parser";
import { IEventEnriched } from "@/interfaces/IFilteredJsonData";
import { lastDeployFilterMapping } from "../interfaces/lastDeployFilterMapping";
import { ToggleButtonGroup } from "@/component/toggle-button-group";

const defaultFilter = {environmentClass: ['t', 'q', 'p']}

interface IFilter {
    application?: string[];
    environment?: string[];
    environmentClass: string[];
}

export default function VeraTable({searchparams}:{searchparams: {"apps"?: string, "envs"?:string}}) {
    const [data, setData] = useState<IEventEnriched[]>([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [filters, setFilters] = useState<IFilter>(defaultFilter);
    const [lastDeployedFilter, setLastDeployedFilter] = useState<string>();
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
        const isDeployedLast24Hrs = (logEvent: IEventEnriched, deployDateBackInTime) => {
            return logEvent.momentTimestamp.isAfter(deployDateBackInTime);
        };

        console.log("Fetching new status")
        await axios.get('/api/v1/deploylog?onlyLatest=true&filterUndeployed=true&last='+timespan)
            .then(({ data }) => {
                //const enrichedLogEvents = _.map(data, (logEvent) => {
                const enrichedLogEvents = data.map((logEvent) => {
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

    const applyFilters = () => {
        _.mixin({
            'regexpMatchByValues': function (collection, property, filters) {
                if (!filters || filters.length === 0) {
                    return collection;
                }
                return _.filter(collection, (item) => {
                    //console.log("Should do some filters")
                    //console.log(property + " " + filters)
                    let match = false;
                    for (let i = 0; i < filters.length; i++) {
                        //console.log("For-loop "+ i)
                        const filterPattern = new RegExp('\\b' + filters[i].trim().replace(new RegExp('\\*', 'g'), '.*') + '\\b');
                        //console.log(item[property])
                        //console.log(filterPattern)
                        if (item[property].toLocaleLowerCase().search(filterPattern) > -1) {
                            //console.log(match)
                            match = true;
                        }
                    }
                    return match;
                })
            }
        });
        let filteredJsonData: IEventEnriched[] = _.clone(data);
        //console.log(filters)
       if (filters) {
            _.keys(filters).forEach((key) => {
                filteredJsonData = _.regexpMatchByValues(filteredJsonData, key, filters[key]);
            })
        } 
 
        if(lastDeployedFilter) {
            const timespanPattern = /(^[0-9]+)([a-zA-Z]+$)/;
            const matches = lastDeployedFilter.match(timespanPattern);
            const quantity = matches[1];
            const timeUnit = matches[2];
            const deployedDateBackInTime = moment().subtract(quantity, timeUnit);
            filteredJsonData = filteredJsonData.filter((elem) => {
                return elem.momentTimestamp.isAfter(deployedDateBackInTime);
            });
        }

        return buildVersionMatrix(filteredJsonData, inverseTable);
    } 
    const filteredJsonData = applyFilters()
    /* const filteredJsonData = data.filter((row) => {
        return Object.keys(filters).every((key) => {
            const filtercontent = filters[key];
            let match = false;
            if( typeof(key) == string){

            }
         })
    }) */
    const getQueryParam = (paramName: string): string => {
        var queryParam = searchparams[paramName];
        return queryParam || '';
    }

    useEffect(() => {
        filters["application"] = getQueryParam("apps").split(',')
        filters["environment"] = getQueryParam("envs").split(',')
        if ( !isDataFetched) {
            console.log("data is not fetched")
            makeRequest(deployEventTimeLimit);
        }
    }, [isDataFetched, deployEventTimeLimit]);
    
    const applyFiltersButton = () => {
        location.href="?apps="+filters["application"]?.join(",").toLocaleLowerCase() +"&envs="+filters["environment"]?.join(",").toLocaleLowerCase();
    }
    //console.log(filteredJsonData)
    let sortData = filteredJsonData;
    sortData = sortData.length>1 ? sortData.slice((page - 1) * rowsPerPage, page * rowsPerPage): sortData;

    const clearFilters = (): void => {
        filters["application"] = ""
        filters["environment"] = ""
        setLastDeployedFilter("")
        setInverseTable(false)
        filters["environmentClass"] = defaultFilter.environmentClass

    }

    return (
        <div style={{marginRight: "auto", marginLeft: "auto", padding: "15px"}}>
        <div style={{display: "flex"}}>
            <TextField label="application" hideLabel placeholder="application" style={{width: 200}} defaultValue={filters["application"]?.join(",")} onInput={(e) => handleFilter("application", e.currentTarget.value)}/>
            <TextField label="environment" hideLabel placeholder="environment" style={{width: 200}} defaultValue={filters["environment"]?.join(",")} onInput={(e) => handleFilter("environment", e.currentTarget.value)}/>
            <Button variant="primary-neutral" size="small" onClick={() => applyFiltersButton()} icon={<ArrowsSquarepathIcon title="a11y-title" fontSize="1.5rem" />} >apply</Button>
            <Button variant="primary-neutral" size="small" onClick={() => clearFilters()} icon={<TrashIcon title="clear-filters"/>} >clear filter</Button>
            <Button variant="primary-neutral" size="small" onClick={changeInverseTable} icon={<ArrowsSquarepathIcon title="a11y-title" fontSize="1.5rem" />} >inverse</Button>
            <Dropdown>
            <Button as={Dropdown.Toggle} icon={<CaretDownIcon title="a11y-title" fontSize="1.5rem" />} size="small" variant="primary-neutral">
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
            <ToggleButtonGroup onChange={setEnvClassFilter} defaultValue={filters.environmentClass} variant="neutral" size="small">
                    <ToggleButtonGroup.Item value="u">u</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="t">t</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="q">q</ToggleButtonGroup.Item>
                    <ToggleButtonGroup.Item value="p">p</ToggleButtonGroup.Item>
            </ToggleButtonGroup>
            </Tooltip>
            <Tooltip content="Rows per page">
                <TextField label="rowsPerPage" hideLabel placeholder="rowsPerPage" style={{width: 50}} inputMode="numeric" defaultValue={rowsPerPage} onInput={(e) => setRowsPerPageHandler(e.currentTarget.value)}/>
            </Tooltip>
        </div>
        <VersionTable filteredJsonData={filteredJsonData} inverseTable={inverseTable}/>
        {
            /* sortData && (
            <Pagination
              page={page}
              onPageChange={setPage}
              count={Math.ceil(data.length / rowsPerPage)}
              size="small"
            />
            ) */
          }
        </div>
    )
}