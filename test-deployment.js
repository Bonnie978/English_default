#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Vercel 部署配置...\n');

// 检查必要文件
const requiredFiles = [
  'vercel.json',
  'vocabulary-app/package.json',
  'vocabulary-api/package.json',
  'vocabulary-api/api/index.ts',
  'vocabulary-api/src/index.ts'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log('✅', file);
  } else {
    console.log('❌', file, '- 文件不存在');
    allFilesExist = false;
  }
});

console.log('\n📋 检查配置文件内容...\n');

// 检查 vercel.json
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json 格式正确');
  
  // 检查构建配置
  if (vercelConfig.builds && vercelConfig.builds.length === 2) {
    console.log('✅ 构建配置包含前端和后端');
  } else {
    console.log('⚠️  构建配置可能不完整');
  }
  
  // 检查路由配置
  if (vercelConfig.routes && vercelConfig.routes.length >= 2) {
    console.log('✅ 路由配置正确');
  } else {
    console.log('⚠️  路由配置可能不完整');
  }
} catch (error) {
  console.log('❌ vercel.json 格式错误:', error.message);
  allFilesExist = false;
}

// 检查前端 package.json
try {
  const frontendPkg = JSON.parse(fs.readFileSync('vocabulary-app/package.json', 'utf8'));
  if (frontendPkg.scripts && frontendPkg.scripts.build) {
    console.log('✅ 前端构建脚本存在');
  } else {
    console.log('❌ 前端缺少构建脚本');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ 前端 package.json 错误:', error.message);
  allFilesExist = false;
}

// 检查后端 package.json
try {
  const backendPkg = JSON.parse(fs.readFileSync('vocabulary-api/package.json', 'utf8'));
  if (backendPkg.dependencies && backendPkg.dependencies['@vercel/node']) {
    console.log('✅ 后端包含 @vercel/node 依赖');
  } else if (backendPkg.devDependencies && backendPkg.devDependencies['@vercel/node']) {
    console.log('✅ 后端包含 @vercel/node 依赖 (devDependencies)');
  } else {
    console.log('❌ 后端缺少 @vercel/node 依赖');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ 后端 package.json 错误:', error.message);
  allFilesExist = false;
}

console.log('\n📝 部署建议:\n');

if (allFilesExist) {
  console.log('🎉 配置检查通过！可以开始部署。\n');
  
  console.log('📋 部署步骤：');
  console.log('1. 提交所有更改到 Git 仓库');
  console.log('2. 在 Vercel 上创建新项目');
  console.log('3. 配置环境变量（参考 VERCEL_DEPLOYMENT_GUIDE.md）');
  console.log('4. 开始部署');
  
  console.log('\n🔧 Vercel 项目设置：');
  console.log('- Framework Preset: Other');
  console.log('- Root Directory: ./');
  console.log('- Build Command: cd vocabulary-app && npm run build');
  console.log('- Output Directory: vocabulary-app/build');
  console.log('- Install Command: npm install && cd vocabulary-app && npm install && cd ../vocabulary-api && npm install');
  
} else {
  console.log('⚠️  配置存在问题，请修复后再部署。');
}

console.log('\n📖 详细部署指南请查看: VERCEL_DEPLOYMENT_GUIDE.md'); 