import { NextResponse } from 'next/server';
import { getConfig } from '../../../../lib/controllers/versionApi';

export async function GET() {
  const result = getConfig();
  return NextResponse.json(result);
}
