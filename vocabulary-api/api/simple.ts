import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.status(200).json({
      message: 'Simple API is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 