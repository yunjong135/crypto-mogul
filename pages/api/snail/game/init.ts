import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Game Init] Request received:', req.method);
  
  if (req.method === 'GET' || req.method === 'POST') {
    res.status(200).json({
      ok: true,
      user: {
        id: 'mock-user-id',
        tg_user_id: 'mock-tg-user-id',
        username: 'mock-user',
        balance: 1000
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}