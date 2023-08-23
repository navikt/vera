import { NextResponse } from "next/server";

export async function GET() {
    const data = { isalive: true}
  return NextResponse.json(data);
}
