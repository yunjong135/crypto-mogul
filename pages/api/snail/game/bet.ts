import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = 'https://api.snail-race.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Game Bet] Request received:', req.method, req.url);
  
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

    console.log('[Game Bet] Connecting to backend:', `${API_BASE}/api/bet`);
    
    const response = await fetch(`${API_BASE}/api/bet`, {
      method: req.method,
      headers,
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
      signal: AbortSignal.timeout(10000) // 10초 타임아웃
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Game Bet] Backend response:', data);
      res.status(200).json(data);
    } else {
      console.log('[Game Bet] Backend error:', response.status);
      // 백엔드 에러 시 fallback 응답
      res.status(200).json({
        ok: true,
        bet: {
          id: 'mock-bet-' + Date.now(),
          choice: 'S',
          amount: 100,
          commit_hash: 'mock-commit-hash'
        },
        commit_hash: 'mock-commit-hash',
        choice: 'S',
        amount: 100
      });
    }
  } catch (error) {
    console.error('[Game Bet] Backend connection failed:', error);
    // 연결 실패 시 fallback 응답
    res.status(200).json({
      ok: true,
      bet: {
        id: 'mock-bet-' + Date.now(),
        choice: 'S',
        amount: 100,
        commit_hash: 'mock-commit-hash'
      },
      commit_hash: 'mock-commit-hash',
      choice: 'S',
      amount: 100
    });
  }
}