import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Game Bet] Request received:', req.method, req.url);
  
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tg-user-id');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET' || req.method === 'POST') {
    res.status(200).json({
      ok: true,
      bet: {
        id: 'mock-bet-' + Date.now(),
        choice: 'S',
        amount: 100,
        commit_hash: 'mock-commit-hash'
      },
      commit_hash: 'mock-commit-hash'
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}