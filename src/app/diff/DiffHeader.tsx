'use client'
import { BranchingIcon, QuestionmarkDiamondFillIcon } from '@navikt/aksel-icons';
import { Button, Link, TextField, HStack  } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import axios from "axios";
import DiffTable from './DiffTable';
import { useSearchParams } from 'next/navigation'
import { IEvent } from '@/interfaces/IEvent';

export default function DiffHeader() {
    const searchParams = useSearchParams();

    const [data, setData] = useState<IEvent[]>([]);
    //const [loading, isLoading] = useState(false);
    const [baseEnvironment, setBaseEnvironment] = useState<string>(searchParams.get("base") || "");
    const [environmentsToCompare, setEnvironmentsToCompare] = useState<string[]>(searchParams.get("comparewith")?.split(',') || []);
    const [appFilter, setAppFilter] = useState<string[]>(searchParams.get("appFilter")?.split(',') || []);
    const buildUrlQuery = "?base=" + baseEnvironment + "&comparewith=" + environmentsToCompare.join(',');
    const [isDataFetched, setIsDataFetched] = useState(false);

    const makeRequest = async () => {
        //appFilter.forEach((app) => console.log( "filter: ", app))

        const query: string = buildUrlQuery
        await axios.get('/api/v1/diff'+query)
            .then(({ data }) => {
                setData(data)
                setIsDataFetched(true);
            })
    }

    useEffect(() => {
        if ( baseEnvironment != "" && environmentsToCompare.length != 0 && !isDataFetched) {
            makeRequest()
        }
    }, [ isDataFetched]);

    

         
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
        let query = buildUrlQuery
        
        if (appFilter)
        query += "&appFilter="+appFilter.join(",")
    
        setIsDataFetched(false)
        location.replace(query)
    }

    return (
        <div>
        <HStack gap={{ xs: "1", sm: "2", md: "6", lg: "10", xl: "16" }} justify='center' > 
        {/* <form style={{display: "flex", margin: "5px"}}> */}
            <TextField label="baseEnvironment" name="baseEnvironment" style={{width: 200}} type="text" defaultValue={baseEnvironment} onInput={(e) => setBaseEnvironment(e.currentTarget.value)}/>
            <TextField label="comparewith" name="comparewith" style={{width: 200}} type="text" defaultValue={environmentsToCompare.join(",")} onInput={(e) => setEnvironmentsToCompare(e.currentTarget.value.split(","))} onKeyUp={(e) => checkKeyboard(e.key)}/>
            <TextField label="appFilter" name="appFilter" style={{width: 200}} defaultValue={appFilter.join(",")} onInput={(e) =>setAppFilter(e.currentTarget.value.split(","))} type="text" onKeyUp={(e) => checkKeyboard(e.key)}/>
            <Button variant="primary-neutral" onClick={() => makeApplyButton()} onKeyDown={(e) => checkKeyboard(e.key)} icon={<BranchingIcon title="diff" fontSize="1.5rem"/>}>diff</Button>
            <Link href='https://confluence.adeo.no/display/AURA/versjonsnummer+i+vera'><QuestionmarkDiamondFillIcon title="vera's version numbers" fontSize="1.5rem" />vera&apos;s take on version numbers</Link>
        {/* </form> */}
        </HStack>
        <DiffTable environments={getEnvironments()} diffResult={data} baseEnvironment={baseEnvironment.toLowerCase()} appFilter={appFilter}/>
        </div>
    )
}