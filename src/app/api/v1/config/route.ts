import { NextResponse } from 'next/server';
import { getConfig } from '../../../../lib/controllers/versionApi';

export async function GET(request: Request) {
    const result = getConfig();
    return NextResponse.json(result);
}