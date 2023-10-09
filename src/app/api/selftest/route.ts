import { NextResponse } from "next/server"
import { selftest } from "../../../lib/controllers/monitoring"

export async function GET() {
    const { statusCode, selftestResult } = await selftest()
    return NextResponse.json(selftestResult, {
        status: statusCode,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
    })
}
