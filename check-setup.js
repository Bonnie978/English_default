#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Supabase 集成设置状态');
console.log('=====================================\n');

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} (缺失)`);
    return false;
  }
}

function checkPackageJson(packagePath, dependencies) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    let allPresent = true;
    dependencies.forEach(dep => {
      if (deps[dep]) {
        console.log(`✅ 依赖 ${dep}: ${deps[dep]}`);
      } else {
        console.log(`❌ 依赖 ${dep}: 未安装`);
        allPresent = false;
      }
    });
    
    return allPresent;
  } catch (error) {
    console.log(`❌ 无法读取 ${packagePath}`);
    return false;
  }
}

let allGood = true;

console.log('📁 检查核心文件...');
allGood &= checkFile('vocabulary-app/src/config/supabase.ts', '前端 Supabase 配置');
allGood &= checkFile('vocabulary-api/src/config/supabase.ts', '后端 Supabase 配置');
allGood &= checkFile('vocabulary-app/src/services/authService.ts', '前端认证服务');
allGood &= checkFile('vocabulary-app/src/services/dataService.ts', '前端数据服务');
allGood &= checkFile('vocabulary-api/src/services/supabaseService.ts', '后端 Supabase 服务');
allGood &= checkFile('vocabulary-api/src/routes/supabase.ts', '后端 API 路由');
allGood &= checkFile('supabase/migrations/001_initial_schema.sql', '数据库迁移脚本');

console.log('\n📦 检查前端依赖...');
allGood &= checkPackageJson('vocabulary-app/package.json', ['@supabase/supabase-js']);

console.log('\n📦 检查后端依赖...');
allGood &= checkPackageJson('vocabulary-api/package.json', ['@supabase/supabase-js']);

console.log('\n🔧 检查环境变量文件...');
const frontendEnvExists = checkFile('vocabulary-app/.env', '前端环境变量');
const backendEnvExists = checkFile('vocabulary-api/.env', '后端环境变量');

console.log('\n📋 总结：');
if (allGood && frontendEnvExists && backendEnvExists) {
  console.log('🎉 所有文件都已准备就绪！您可以开始使用 Supabase 了。');
  console.log('\n下一步：');
  console.log('1. 测试连接：cd vocabulary-api && npm run test:supabase');
  console.log('2. 启动应用：');
  console.log('   前端：cd vocabulary-app && npm start');
  console.log('   后端：cd vocabulary-api && npm run dev');
} else if (allGood && (!frontendEnvExists || !backendEnvExists)) {
  console.log('⚠️  核心文件已准备就绪，但需要配置环境变量。');
  console.log('运行：node setup-supabase.js 来完成设置');
} else {
  console.log('❌ 还有一些文件缺失或依赖未安装。');
  console.log('请检查上面的错误信息并解决问题。');
}

console.log('\n📚 相关文档：');
console.log('- SUPABASE_SETUP.md - 详细设置指南');
console.log('- SUPABASE_INTEGRATION_COMPLETE.md - 完整集成报告'); 