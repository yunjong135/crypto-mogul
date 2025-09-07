import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Stocks History] Request received:', req.method);
  
  if (req.method === 'GET' || req.method === 'POST') {
    res.status(200).json([
      { timestamp: Date.now() - 3600000, price: 95 },
      { timestamp: Date.now() - 1800000, price: 98 },
      { timestamp: Date.now(), price: 100 }
    ]);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}