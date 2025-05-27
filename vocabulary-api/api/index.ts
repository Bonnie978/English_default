import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';

// Vercel Serverless Function Handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
} 