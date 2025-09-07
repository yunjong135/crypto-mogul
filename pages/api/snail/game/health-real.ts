import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = 'https://api.snail-race.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Real Backend Health] Testing connection to:', API_BASE);
  
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      timeout: 5000, // 5초 타임아웃
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Real Backend] Health check successful:', data);
      res.status(200).json({
        status: 'connected',
        backend: 'real',
        data: data
      });
    } else {
      console.log('[Real Backend] Health check failed:', response.status);
      res.status(503).json({
        status: 'backend_error',
        backend: 'real',
        error: `Backend returned ${response.status}`
      });
    }
  } catch (error) {
    console.error('[Real Backend] Connection failed:', error);
    res.status(503).json({
      status: 'connection_failed',
      backend: 'real',
      error: error.message
    });
  }
}