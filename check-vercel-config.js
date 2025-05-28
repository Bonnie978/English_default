#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Vercel 配置和部署状态...\n');

// 检查项目结构
console.log('📁 项目结构检查:');
const checkDir = (dirPath, name) => {
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${name} 目录存在`);
    return true;
  } else {
    console.log(`❌ ${name} 目录不存在`);
    return false;
  }
};

const frontendExists = checkDir('./vocabulary-app', '前端 (vocabulary-app)');
const backendExists = checkDir('./vocabulary-api', '后端 (vocabulary-api)');

// 检查配置文件
console.log('\n📋 配置文件检查:');
const checkFile = (filePath, name) => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${name} 存在`);
    return true;
  } else {
    console.log(`❌ ${name} 不存在`);
    return false;
  }
};

// 检查根目录是否有vercel.json（应该没有）
if (fs.existsSync('./vercel.json')) {
  console.log('⚠️  根目录存在 vercel.json - 这可能会干扰分离部署！');
  console.log('   建议将其重命名为 vercel.json.backup');
} else {
  console.log('✅ 根目录没有 vercel.json（正确）');
}

// 检查前后端配置
if (frontendExists) {
  checkFile('./vocabulary-app/vercel.json', '前端 vercel.json');
  checkFile('./vocabulary-app/package.json', '前端 package.json');
}

if (backendExists) {
  checkFile('./vocabulary-api/vercel.json', '后端 vercel.json');
  checkFile('./vocabulary-api/package.json', '后端 package.json');
}

// 检查Vercel项目配置
console.log('\n🔧 Vercel 项目配置:');
if (fs.existsSync('./.vercel/project.json')) {
  try {
    const projectConfig = JSON.parse(fs.readFileSync('./.vercel/project.json', 'utf8'));
    console.log('✅ Vercel 项目配置存在');
    console.log(`   项目ID: ${projectConfig.projectId}`);
    console.log(`   组织ID: ${projectConfig.orgId}`);
  } catch (error) {
    console.log('❌ Vercel 项目配置格式错误');
  }
} else {
  console.log('❌ Vercel 项目配置不存在');
}

// 检查Git状态
console.log('\n📝 Git 状态:');
const { execSync } = require('child_process');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim() === '') {
    console.log('✅ 工作区干净，没有未提交的更改');
  } else {
    console.log('⚠️  有未提交的更改:');
    console.log(gitStatus);
  }
  
  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' });
  console.log(`📌 最新提交: ${lastCommit.trim()}`);
  
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' });
  console.log(`🔗 远程仓库: ${remoteUrl.trim()}`);
} catch (error) {
  console.log('❌ Git 命令执行失败');
}

console.log('\n💡 部署故障排除建议:');
console.log('1. 检查 Vercel Dashboard 中的项目设置');
console.log('2. 确认 Root Directory 设置:');
console.log('   - 前端项目: vocabulary-app');
console.log('   - 后端项目: vocabulary-api');
console.log('3. 检查 GitHub 集成是否正常');
console.log('4. 查看 Vercel 部署日志中的错误信息');
console.log('5. 尝试手动触发部署（Redeploy 按钮）');

console.log('\n🌐 如果部署成功，测试端点:');
console.log('- 后端健康检查: https://your-api-domain.vercel.app/api/simple');
console.log('- 前端应用: https://your-frontend-domain.vercel.app'); 