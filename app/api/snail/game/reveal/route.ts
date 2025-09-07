import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.snail-race.com';

export async function POST(req: NextRequest) {
  try {
    const url = `${API_BASE}/api/reveal`;
    console.log(`[Game Reveal] POST ${req.url} -> ${url}`);

    const headers = new Headers();
    headers.set('content-type', 'application/json');
    const xUser = req.headers.get('x-tg-user-id');
    if (xUser) headers.set('x-tg-user-id', xUser);

    const body = await req.text();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Game reveal error:', error);
    
    // Fallback response
    return NextResponse.json({
      error: 'Backend service unavailable',
      message: 'Please try again later'
    }, { status: 503 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}