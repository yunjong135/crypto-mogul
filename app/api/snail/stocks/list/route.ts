import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.snail-race.com';

export async function GET(req: NextRequest) {
  try {
    const url = `${API_BASE}/stocks/list${req.nextUrl.search}`;
    console.log(`[Stocks List] GET ${req.url} -> ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Stocks list error:', error);
    
    // Fallback response
    return NextResponse.json({
      error: 'Backend service unavailable',
      message: 'Please try again later'
    }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}