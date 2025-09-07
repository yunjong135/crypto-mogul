// app/api/snail/game/[...path]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.snail-race.com';

async function forward(req: NextRequest, path: string[]) {
  try {
    // 게임 API는 백엔드의 /api/ 경로로 직접 매핑
    const backendPath = `/api/${path.join('/')}`;
    const url = `${API_BASE}${backendPath}${req.nextUrl.search}`;
    
    console.log(`[Game Proxy] Forwarding ${req.method} ${req.url} -> ${url}`);

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
    console.error('Game proxy error:', error);
    
    // 백엔드 연결 실패 시 mock 응답 제공
    const pathStr = path.join('/');
    if (pathStr === 'health') {
      return new Response(JSON.stringify({ status: 'ok', message: 'Game service is running' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } else if (pathStr === 'bet') {
      return new Response(JSON.stringify({ 
        error: 'Backend service unavailable',
        message: 'Please try again later'
      }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path ?? []);
}

export async function HEAD(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path ?? []);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}