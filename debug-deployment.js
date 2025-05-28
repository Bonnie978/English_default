#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Vercel 部署问题详细诊断\n');

// 1. 检查Git配置
console.log('📧 Git 配置检查:');
try {
  const userName = execSync('git config --global user.name', { encoding: 'utf8' }).trim();
  const userEmail = execSync('git config --global user.email', { encoding: 'utf8' }).trim();
  console.log(`✅ Git 用户名: ${userName}`);
  console.log(`✅ Git 邮箱: ${userEmail}`);
  
  // 检查最近提交的作者信息
  const lastCommitInfo = execSync('git log -1 --pretty=format:"%an <%ae>"', { encoding: 'utf8' }).trim();
  console.log(`📝 最新提交作者: ${lastCommitInfo}`);
  
  if (lastCommitInfo.includes(userEmail)) {
    console.log('✅ 提交作者邮箱与Git配置匹配');
  } else {
    console.log('❌ 提交作者邮箱与Git配置不匹配！');
  }
} catch (error) {
  console.log('❌ Git 配置检查失败');
}

// 2. 检查GitHub远程仓库
console.log('\n🔗 GitHub 仓库检查:');
try {
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  console.log(`📍 远程仓库: ${remoteUrl}`);
  
  // 提取GitHub用户名和仓库名
  const match = remoteUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
  if (match) {
    const [, owner, repo] = match;
    console.log(`👤 GitHub 用户: ${owner}`);
    console.log(`📦 仓库名: ${repo}`);
  }
} catch (error) {
  console.log('❌ GitHub 仓库信息获取失败');
}

// 3. 检查最近的提交SHA
console.log('\n📋 最近提交记录:');
try {
  const commits = execSync('git log --oneline -5', { encoding: 'utf8' }).trim().split('\n');
  commits.forEach((commit, index) => {
    const [sha, ...messageParts] = commit.split(' ');
    const message = messageParts.join(' ');
    console.log(`${index + 1}. ${sha} - ${message}`);
  });
  
  // 获取最新提交的完整SHA
  const latestSHA = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  console.log(`\n🔑 最新提交完整SHA: ${latestSHA}`);
} catch (error) {
  console.log('❌ 提交记录获取失败');
}

// 4. 检查Vercel配置
console.log('\n⚙️ Vercel 配置检查:');
if (fs.existsSync('.vercel/project.json')) {
  try {
    const config = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
    console.log(`✅ Vercel 项目ID: ${config.projectId}`);
    console.log(`✅ Vercel 组织ID: ${config.orgId}`);
  } catch (error) {
    console.log('❌ Vercel 配置文件格式错误');
  }
} else {
  console.log('❌ Vercel 配置文件不存在');
}

// 5. 检查分离部署配置
console.log('\n🔄 分离部署配置检查:');
const frontendConfig = fs.existsSync('vocabulary-app/vercel.json');
const backendConfig = fs.existsSync('vocabulary-api/vercel.json');
const rootConfig = fs.existsSync('vercel.json');

console.log(`${frontendConfig ? '✅' : '❌'} 前端 vercel.json`);
console.log(`${backendConfig ? '✅' : '❌'} 后端 vercel.json`);
console.log(`${rootConfig ? '⚠️' : '✅'} 根目录 ${rootConfig ? '存在' : '不存在'} vercel.json ${rootConfig ? '(可能干扰分离部署)' : '(正确)'}`);

// 6. 诊断建议
console.log('\n💡 问题诊断和解决建议:');
console.log('');
console.log('🔍 请检查以下几点:');
console.log('1. 确认您的 Vercel 账户邮箱与 GitHub 账户邮箱完全一致');
console.log('2. 检查 GitHub 仓库的 Settings → Webhooks 是否有 Vercel webhook');
console.log('3. 确认您只有一个 Vercel 账户连接到这个 GitHub 账户');
console.log('4. 检查 Vercel 项目设置中的 Root Directory 配置');
console.log('');
console.log('🛠️ 立即尝试的解决方案:');
console.log('1. 在 Vercel Dashboard 中手动点击 "Redeploy"');
console.log('2. 断开并重新连接 GitHub 集成');
console.log('3. 检查是否需要创建两个独立的 Vercel 项目（前端和后端）');
console.log('');
console.log('📞 如果问题持续存在:');
console.log(`请访问 https://vercel.com/help 并提供最新的提交SHA: ${execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()}`); 