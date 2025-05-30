/**
 * 通用CORS中间件
 * 处理跨域请求头设置和OPTIONS预检请求
 */
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24小时预检缓存
}

/**
 * CORS中间件包装器
 * 自动处理CORS头部和OPTIONS请求
 */
export function withCors(handler) {
  return async (req, res) => {
    // 设置CORS头部
    setCorsHeaders(res);
    
    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // 执行实际的处理函数
    return handler(req, res);
  };
} 