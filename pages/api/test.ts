import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Test API] Request received:', req.method);
  
  res.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
}