#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

console.log('🔍 检查 Vercel 部署状态...\n');

// 从用户输入获取域名
const domain = process.argv[2];

if (!domain) {
  console.log('❌ 请提供你的 Vercel 域名');
  console.log('用法: node check-deployment.js your-domain.vercel.app');
  process.exit(1);
}

// 检查的端点列表
const endpoints = [
  { path: '/', description: '前端首页' },
  { path: '/api/health', description: '后端健康检查' },
  { path: '/favicon.ico', description: 'Favicon' },
  { path: '/manifest.json', description: 'Manifest' },
  { path: '/static/css/', description: 'CSS 静态资源', partial: true },
  { path: '/static/js/', description: 'JS 静态资源', partial: true }
];

// 检查单个端点
function checkEndpoint(domain, endpoint) {
  return new Promise((resolve) => {
    const url = `https://${domain}${endpoint.path}`;
    
    https.get(url, (res) => {
      const status = res.statusCode;
      const success = status >= 200 && status < 400;
      
      resolve({
        ...endpoint,
        status,
        success,
        url
      });
    }).on('error', (err) => {
      resolve({
        ...endpoint,
        status: 'ERROR',
        success: false,
        error: err.message,
        url
      });
    });
  });
}

// 主检查函数
async function checkDeployment() {
  console.log(`🌐 检查域名: ${domain}\n`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    if (endpoint.partial) {
      // 对于部分路径，我们只检查是否返回合理的状态
      console.log(`⏳ 检查 ${endpoint.description}...`);
      const result = await checkEndpoint(domain, endpoint);
      results.push(result);
    } else {
      console.log(`⏳ 检查 ${endpoint.description}...`);
      const result = await checkEndpoint(domain, endpoint);
      results.push(result);
    }
  }
  
  console.log('\n📊 检查结果:\n');
  
  let allGood = true;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.status === 'ERROR' ? result.error : result.status;
    
    console.log(`${icon} ${result.description}: ${status}`);
    
    if (!result.success && !result.partial) {
      allGood = false;
    }
  });
  
  console.log('\n📋 诊断建议:\n');
  
  if (allGood) {
    console.log('🎉 部署看起来正常！');
  } else {
    console.log('⚠️  发现一些问题，建议检查：');
    
    results.forEach(result => {
      if (!result.success) {
        switch (result.path) {
          case '/':
            console.log('- 前端构建可能失败，检查 Vercel 构建日志');
            break;
          case '/api/health':
            console.log('- 后端 API 无法访问，检查环境变量和函数日志');
            break;
          case '/favicon.ico':
          case '/manifest.json':
            console.log('- 静态资源路由配置问题，检查 vercel.json');
            break;
        }
      }
    });
  }
  
  console.log('\n🔧 常见解决方案:');
  console.log('1. 检查 Vercel 项目的 Deployments 页面查看构建日志');
  console.log('2. 确认环境变量已正确设置');
  console.log('3. 验证 vercel.json 配置文件');
  console.log('4. 检查 Functions 页面查看 API 日志');
  console.log('5. 确保所有代码已提交并推送到 Git');
}

// 运行检查
checkDeployment().catch(console.error); 