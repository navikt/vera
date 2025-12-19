import { NextRequest, NextResponse } from "next/server"
import { deployLog, registerEvent, returnCSVPayload } from "../../../../lib/controllers/versionApi"
import { IEventEnriched } from "@/interfaces/IEvent"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const params = Object.fromEntries(searchParams.entries())
    const result: IEventEnriched[] = await deployLog(params)
    let header = {}
    if (searchParams.get("csv")) {
        header = {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=exported-vera.csv",
        }
        const csvData = returnCSVPayload(result)

        return NextResponse.json(csvData, {
            headers: header,
        })
    } else {
        header = { "Content-Type": "application/json; charset=utf-8" }

        return NextResponse.json(result, {
            headers: header,
        })
    }
}

export async function POST(request: Request) {
    const body = await request.json()
    //const headers = new Headers(request.headers)
    if (!body.environment) {
        return NextResponse.json("Property environment is missing in request", {
            status: 400,
        })
    }
    if (body.version !== undefined && body.version.trim() === "") {
        return NextResponse.json(
            "Property version is empty. If you are trying to undeploy you must remove the property.",
            {
                status: 400,
            },
        )
    }

    const response = await fetch("http://deploy-forwarder.nais-analyse/api/deployment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: request.body,
    })
    if (!response.ok) {
        console.log("Failed to forward the request: ", response.statusText)
        console.log(body)
    }

    const savedEvent = await registerEvent(body)
    return NextResponse.json({ savedEvent })
}
