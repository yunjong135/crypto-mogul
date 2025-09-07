import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Game Reveal] Request received:', req.method);
  
  if (req.method === 'GET' || req.method === 'POST') {
    res.status(200).json({
      ok: true,
      winner: 'S',
      choice: 'S',
      amount: 100,
      payout: 250,
      revealed: true,
      server_seed: 'mock-server-seed-' + Date.now(),
      nonce: Math.floor(Math.random() * 1000000)
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}