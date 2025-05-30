const https = require('https');
const http = require('http');

// 您的Vercel部署URL（请替换为实际URL）
const BASE_URL = 'https://your-app-name.vercel.app';

// 测试端点列表
const apiEndpoints = [
  '/api/hello',
  '/api/words-daily',
  '/api/words-stats',
  '/api/words-progress',
  '/api/words-review'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject({
        url,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        url,
        error: 'Request timeout'
      });
    });
  });
}

async function checkDeployment() {
  console.log('🔍 检查API部署状态...\n');
  
  for (const endpoint of apiEndpoints) {
    const url = BASE_URL + endpoint;
    
    try {
      console.log(`测试: ${endpoint}`);
      const result = await makeRequest(url);
      
      console.log(`✅ 状态: ${result.status}`);
      
      if (result.status === 200) {
        try {
          const json = JSON.parse(result.body);
          console.log(`📄 响应:`, JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(`📄 响应: ${result.body.substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ 错误响应: ${result.body.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.error || error.message}`);
    }
    
    console.log('---\n');
  }
}

// 使用说明
console.log('📋 使用说明:');
console.log('1. 请将 BASE_URL 替换为您的实际 Vercel 部署 URL');
console.log('2. 运行: node check-api-deployment.js');
console.log('3. 检查每个API端点的响应状态\n');

// 如果BASE_URL还是默认值，显示警告
if (BASE_URL.includes('your-app-name')) {
  console.log('⚠️  警告: 请先更新 BASE_URL 为您的实际部署地址！\n');
} else {
  checkDeployment();
} 