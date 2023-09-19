'use client'
import { BranchingIcon, QuestionmarkDiamondFillIcon } from '@navikt/aksel-icons';
import { Button, Link, TextField, HStack  } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import axios from "axios";
import { IEventResponse } from '@/interfaces/IFilteredJsonData';
import DiffTable from './DiffTable';

interface IDiffFilter {
    base: string;
    comparewith: string[];
    appFilter?: string[];
}


export default function DiffHeader({
    searchParams
}: {
    searchParams: {"base"?: string, "comparewith"?:string, "appFilter"?: string}
}) {
    const [data, setData] = useState<IEventResponse[]>([]);
    const [loading, isLoading] = useState(false);
    const [filters, setFilters] = useState<IDiffFilter>()
    const [baseEnvironment, setBaseEnvironment] = useState<string>("");
    const [environmentsToCompare, setEnvironmentsToCompare] = useState<string[]>([]);
    const [appFilter, setAppFilter] = useState<string[]>([]);

    const buildUrlQuery = "?base=" + baseEnvironment + "&comparewith=" + environmentsToCompare.join(',');

    const makeRequest = async () => {
        console.log("Fetching new status")
        console.log(baseEnvironment)
        console.log(environmentsToCompare)
        console.log(appFilter)
        if (baseEnvironment && environmentsToCompare) {
            const query: string = buildUrlQuery
/*             console.log("query")
            console.log(query) */
            await axios.get('/api/v1/diff'+query)
                .then(({ data }) => {
                    console.log(data)
                    setData(data)
                })
        }
    }
    
    const getQueryParam = (paramName: string): string => {
        const queryParam = searchParams[paramName];
        return queryParam || '';
    }

    useEffect(() => {
        const setStates = () => {
            setBaseEnvironment(getQueryParam("base"))
            setEnvironmentsToCompare(getQueryParam("comparewith").split(','))
            setAppFilter(getQueryParam("appFilter").split(","))
        }

        if ( baseEnvironment && environmentsToCompare) {
          console.log("data is not fetched")
          makeRequest();
        }
      }, []);

    const checkKeyboard = (e:string) => {
        if( e == "Enter" ) {
            makeRequest();
        }
    }

    const getEnvironments = ():string[] => {

        if (baseEnvironment && environmentsToCompare) {
            return [baseEnvironment].concat(environmentsToCompare).map(function(elem) {
                return elem.toLowerCase();
            });
        }
        return [];
    }

    const makeApplyButton = (): void => {
        makeRequest()
        let query = buildUrlQuery
        
        if (appFilter)
            query += "&appFilter="+appFilter.join(",")

        //location.replace(query)
    }

    return (
        <div>
        <HStack gap={{ xs: "1", sm: "2", md: "6", lg: "10", xl: "16" }} justify='center' >
            <TextField label="baseEnvironment" placeholder="baseEnvironment" style={{width: 200}} type="text" defaultValue={baseEnvironment} onInput={(e) => setBaseEnvironment(e.currentTarget.value)}/>
            <TextField label="comparewith"  placeholder="comparewith"  style={{width: 200}} type="text" defaultValue={environmentsToCompare.join(",")} onInput={(e) => setEnvironmentsToCompare(e.currentTarget.value.split(","))}/>
            <TextField label="appFilter" placeholder="appFilter" style={{width: 200}} defaultValue={appFilter.join(",")} onInput={(e) =>setAppFilter(e.currentTarget.value.split(","))} type="text"/>
            <Button variant="primary-neutral" onClick={() => makeApplyButton()} onKeyDown={(e) => checkKeyboard(e.key)} icon={<BranchingIcon title="diff" fontSize="1.5rem"/>} >diff</Button>
            <Link href='https://confluence.adeo.no/display/AURA/versjonsnummer+i+vera'><QuestionmarkDiamondFillIcon title="vera's version numbers" fontSize="1.5rem" />vera's take on version numbers</Link>
        </HStack>
        <DiffTable environments={getEnvironments()} diffResult={data} baseEnvironment={baseEnvironment.toLowerCase()} appFilter={appFilter}/>
        
        </div>

    )

}