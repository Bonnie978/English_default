import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    success: true,
    stats: {
      totalWordsLearned: 0,
      masteredWords: 0,
      streakDays: 0,
      totalExercises: 0
    },
    message: 'Mock data - database not connected yet'
  });
} 