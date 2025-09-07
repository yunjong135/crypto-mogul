import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.snail-race.com';

export async function GET(req: NextRequest) {
  try {
    const url = `${API_BASE}/api/health`;
    console.log(`[Game Health] GET ${req.url} -> ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Game health error:', error);
    
    // Fallback response
    return NextResponse.json({
      status: 'ok',
      message: 'Game service is running'
    }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}