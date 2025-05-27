export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'vocabulary-api',
    method: req.method,
    url: req.url
  });
} 