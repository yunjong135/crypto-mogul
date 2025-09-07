// app/api/snail/[...slug]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.snail-race.com';

// 프록시 허용 경로 화이트리스트 (안전)
const ALLOW = new Set(['stocks', 'portfolio', 'trade', 'game']);

// /api/snail/game/* -> /api/* 로 매핑하고
// /api/snail/stocks|portfolio|trade -> 동일 경로로 매핑
function mapToBackendPath(slug: string[]) {
  const [head, ...rest] = slug;
  if (!head || !ALLOW.has(head)) return null;

  if (head === 'game') {
    // /api/init|balance|bet|reveal 등
    const tail = rest.join('/');
    return `/api/${tail ?? ''}`;
  }
  // stocks / portfolio / trade
  return `/${[head, ...rest].join('/')}`;
}

async function forward(req: NextRequest, slug: string[]) {
  const path = mapToBackendPath(slug);
  if (!path) {
    return new Response(JSON.stringify({ error: 'not allowed' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  // 원본 헤더 중 필요한 것만 전달
  const outHeaders = new Headers();
  const ct = req.headers.get('content-type');
  if (ct) outHeaders.set('content-type', ct);
  const xUser = req.headers.get('x-tg-user-id');
  if (xUser) outHeaders.set('x-tg-user-id', xUser);

  const url = `${API_BASE}${path}${req.nextUrl.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: outHeaders,
    cache: 'no-store',
  };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    const buf = await req.arrayBuffer();
    init.body = buf;
  }

  // 같은 오리진 내부 API라 CORS 헤더는 불필요
  const res = await fetch(url, init);
  const body = await res.arrayBuffer();

  return new Response(body, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(req: NextRequest, ctx: { params: { slug: string[] } }) {
  return forward(req, ctx.params.slug ?? []);
}
export async function POST(req: NextRequest, ctx: { params: { slug: string[] } }) {
  return forward(req, ctx.params.slug ?? []);
}
export async function HEAD(req: NextRequest, ctx: { params: { slug: string[] } }) {
  return forward(req, ctx.params.slug ?? []);
}
export async function OPTIONS() {
  // 같은 오리진이라 프리플라이트 필요 없지만, 혹시 몰라 204
  return new Response(null, { status: 204 });
}