import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Stocks List] Request received:', req.method);
  
  if (req.method === 'GET' || req.method === 'POST') {
    res.status(200).json([
      { symbol: 'NVSL', price: 100, change: 5.2, changePercent: 5.5 },
      { symbol: 'TSLA', price: 250, change: -10.5, changePercent: -4.0 },
      { symbol: 'AAPL', price: 180, change: 2.1, changePercent: 1.2 }
    ]);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}