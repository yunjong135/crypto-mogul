import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = 'https://api.snail-race.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Game Balance] Request received:', req.method);
  
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
    
    if (req.headers['x-tg-user-id']) {
      headers['x-tg-user-id'] = req.headers['x-tg-user-id'];
    }

    console.log('[Game Balance] Connecting to backend:', `${API_BASE}/api/balance`);
    
    const response = await fetch(`${API_BASE}/api/balance`, {
      method: req.method,
      headers,
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Game Balance] Backend response:', data);
      res.status(200).json(data);
    } else {
      console.log('[Game Balance] Backend error:', response.status);
      // 백엔드 에러 시 fallback 응답
      res.status(200).json({
        ok: true,
        user: {
          id: 'mock-user-id',
          tg_user_id: 'mock-tg-user-id',
          username: 'mock-user',
          balance: 1000
        }
      });
    }
  } catch (error) {
    console.error('[Game Balance] Backend connection failed:', error);
    // 연결 실패 시 fallback 응답
    res.status(200).json({
      ok: true,
      user: {
        id: 'mock-user-id',
        tg_user_id: 'mock-tg-user-id',
        username: 'mock-user',
        balance: 1000
      }
    });
  }
}