import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Trade Sell] Request received:', req.method);
  
  if (req.method === 'GET' || req.method === 'POST') {
    res.status(200).json({
      ok: true,
      message: 'Trade executed successfully',
      transaction_id: 'mock-tx-' + Date.now()
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}