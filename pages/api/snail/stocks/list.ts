import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = 'https://api.snail-race.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Stocks List] Request received:', req.method);
  
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
    console.log('[Stocks List] Connecting to backend:', `${API_BASE}/stocks/list`);
    
    const response = await fetch(`${API_BASE}/stocks/list${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Stocks List] Backend response:', data);
      res.status(200).json(data);
    } else {
      console.log('[Stocks List] Backend error:', response.status);
      // 백엔드 에러 시 fallback 응답
      res.status(200).json([
        { symbol: 'NVSL', price: 100, change: 5.2, changePercent: 5.5 },
        { symbol: 'TSLA', price: 250, change: -10.5, changePercent: -4.0 },
        { symbol: 'AAPL', price: 180, change: 2.1, changePercent: 1.2 }
      ]);
    }
  } catch (error) {
    console.error('[Stocks List] Backend connection failed:', error);
    // 연결 실패 시 fallback 응답
    res.status(200).json([
      { symbol: 'NVSL', price: 100, change: 5.2, changePercent: 5.5 },
      { symbol: 'TSLA', price: 250, change: -10.5, changePercent: -4.0 },
      { symbol: 'AAPL', price: 180, change: 2.1, changePercent: 1.2 }
    ]);
  }
}