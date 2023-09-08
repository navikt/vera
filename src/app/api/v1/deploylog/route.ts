
import { NextRequest, NextResponse } from 'next/server';
import { deployLog, registerEvent,returnCSVPayload } from '../../../../lib/controllers/versionApi';
import { IEvent } from '@/interfaces/IEvent';


export async function GET(request: NextRequest) {
    //const searchParams = new URL(request.url).searchParams;
    const searchParams = request.nextUrl.searchParams;
    //const searchParams = new URLSearchParams(url.search);
    console.log("Searchparams");
    const params = Object.fromEntries(searchParams.entries())
    console.log(params)

    const result: IEvent[] = await deployLog(params);
    let header = {};
    if (searchParams.get("csv")) {
        header = {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=exported-vera.csv"
        };
        const csvData = await returnCSVPayload(result);
        //console.log(csvData);
        return new Response(csvData, {
            headers: header,
        }); 
    } else {
        header = {"Content-Type": "application/json; charset=utf-8"};
        //console.log(result)
        return NextResponse.json(result, {
            headers: header
        })
    }
}


export async function POST(request: Request) {
    const body = await request.json();
    const headers = new Headers(request.headers)
    if ( !body.environment) {
        return NextResponse.json("Property environment is missing in request", {status:400});
    }
    if (body.version !== undefined && body.version.trim() === "") {
        return NextResponse.json("Property version is empty. If you are trying to undeploy you must remove the property.", {status: 400});
    }

    const savedEvent = await registerEvent(body);
    console.log(`Saved event ${savedEvent} from client ip ${headers.get("x-forwarded-for") || headers.get("ip")}` );
    return NextResponse.json({ savedEvent })
  }