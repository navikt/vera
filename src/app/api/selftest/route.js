import { NextResponse } from "next/server";
import { selftest } from "../../../lib/controllers/monitoring";

export async function GET() {

    const { statusCode, selftestResult } = selftest();
    console.log(statusCode)
    console.log(selftestResult)
    return NextResponse.json(selftestResult, {
        status: statusCode,
        headers:{
            "Content-Type": "application/json; charset=utf-8"
        }
    });
}
