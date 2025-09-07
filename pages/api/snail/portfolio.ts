import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = 'https://api.snail-race.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Portfolio] Request received:', req.method, req.url);
  
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tg-user-id');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 실제 백엔드 서버에 연결 시도
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // x-tg-user-id 헤더 전달
    if (req.headers['x-tg-user-id']) {
      headers['x-tg-user-id'] = req.headers['x-tg-user-id'];
    }

    console.log('[Portfolio] Connecting to backend:', `${API_BASE}/portfolio`);
    
    const response = await fetch(`${API_BASE}/portfolio${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`, {
      method: req.method,
      headers,
      signal: AbortSignal.timeout(10000) // 10초 타임아웃
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Portfolio] Backend response:', data);
      res.status(200).json(data);
    } else {
      console.log('[Portfolio] Backend error:', response.status);
      // 백엔드 에러 시 fallback 응답
      res.status(200).json({
        ok: true,
        cash: 1000,
        portfolio_value: 0,
        cost_basis: 0,
        pnl: 0,
        pnl_rate: 0,
        positions: []
      });
    }
  } catch (error) {
    console.error('[Portfolio] Backend connection failed:', error);
    // 연결 실패 시 fallback 응답
    res.status(200).json({
      ok: true,
      cash: 1000,
      portfolio_value: 0,
      cost_basis: 0,
      pnl: 0,
      pnl_rate: 0,
      positions: []
    });
  }
}