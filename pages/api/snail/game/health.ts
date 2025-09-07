import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = 'https://api.snail-race.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Game Health] Request received:', req.method);
  
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
    console.log('[Game Health] Connecting to backend:', `${API_BASE}/api/health`);
    
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 5초 타임아웃
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Game Health] Backend response:', data);
      res.status(200).json({
        status: 'ok',
        backend: 'connected',
        data: data,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('[Game Health] Backend error:', response.status);
      // 백엔드 에러 시 fallback 응답
      res.status(200).json({
        status: 'ok',
        backend: 'fallback',
        message: 'Game service is running (fallback mode)',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Game Health] Backend connection failed:', error);
    // 연결 실패 시 fallback 응답
    res.status(200).json({
      status: 'ok',
      backend: 'fallback',
      message: 'Game service is running (fallback mode)',
      timestamp: new Date().toISOString()
    });
  }
}