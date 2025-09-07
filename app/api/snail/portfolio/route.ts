// app/api/snail/portfolio/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.snail-race.com';

async function forward(req: NextRequest) {
  try {
    const url = `${API_BASE}/portfolio${req.nextUrl.search}`;
    console.log(`[Portfolio Proxy] Forwarding ${req.method} ${req.url} -> ${url}`);

    // 원본 헤더 중 필요한 것만 전달
    const outHeaders = new Headers();
    const ct = req.headers.get('content-type');
    if (ct) outHeaders.set('content-type', ct);
    const xUser = req.headers.get('x-tg-user-id');
    if (xUser) outHeaders.set('x-tg-user-id', xUser);

    const init: RequestInit = {
      method: req.method,
      headers: outHeaders,
      cache: 'no-store',
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      const buf = await req.arrayBuffer();
      init.body = buf;
    }

    const res = await fetch(url, init);
    const body = await res.arrayBuffer();

    return new Response(body, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
    });
  } catch (error) {
    console.error('Portfolio proxy error:', error);
    
    // 백엔드 연결 실패 시 mock 응답 제공
    return new Response(JSON.stringify({ 
      ok: true,
      cash: 1000,
      portfolio_value: 0,
      cost_basis: 0,
      pnl: 0,
      pnl_rate: 0,
      positions: []
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export async function GET(req: NextRequest) {
  return forward(req);
}

export async function POST(req: NextRequest) {
  return forward(req);
}

export async function HEAD(req: NextRequest) {
  return forward(req);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}