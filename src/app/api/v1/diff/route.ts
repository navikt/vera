import { NextRequest, NextResponse } from "next/server"
import { diffEnvironments } from "../../../../lib/controllers/diffService"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    if (!searchParams.get("base") || !searchParams.get("comparewith")) {
        return NextResponse.json({}, { status: 400 })
    }

    const header = { "Content-Type": "application/json; charset=utf-8" }
    const comparedEvents = await diffEnvironments(searchParams.get("base") || "", searchParams.get("comparewith") || "")
    return NextResponse.json(comparedEvents, {
        headers: header,
    })
}
