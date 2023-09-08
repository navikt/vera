import { NextRequest, NextResponse } from 'next/server';
import {diffEnvironments} from '../../../../lib/controllers/diffService';

export async function GET(request: NextRequest) {
    //const {searchParams} = new URL(request.url);
    const searchParams = request.nextUrl.searchParams;
    //const searchParams = new URLSearchParams(url.search);
    console.log(searchParams)
    console.log(searchParams.keys())
    let params = {}
    if (!searchParams.get("base") || !searchParams.get("comparewith")) {
        return NextResponse.json({}, { status: 400});
    }
/*     for (const key in searchParams.entries()) {
        const value = searchParams.get(key);
        console.log(`${key}, ${value}`);
        params[key] = value;
    } */
    const header= {"Content-Type": "application/json; charset=utf-8"};
    const comparedEvents = await diffEnvironments(searchParams.get("base"), searchParams.get("comparewith"));
    console.log("compatedEvent");
    console.log(comparedEvents)
    return NextResponse.json(comparedEvents);
}