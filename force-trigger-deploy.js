#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 强制触发 Vercel 部署\n');

// 1. 创建一个新的触发文件
const timestamp = new Date().toISOString();
const triggerContent = `# 部署触发器
时间: ${timestamp}
提交SHA: ${execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()}
触发原因: 强制重新部署

## 变更说明
- 强制触发前后端部署
- 解决自动部署问题
- 测试 Vercel 集成
`;

fs.writeFileSync('DEPLOY_TRIGGER.md', triggerContent);
console.log('✅ 创建部署触发文件');

// 2. 修改前端关键文件
const frontendPackage = JSON.parse(fs.readFileSync('vocabulary-app/package.json', 'utf8'));
frontendPackage.version = `0.1.${Date.now().toString().slice(-6)}`;
frontendPackage.description = `Vocabulary learning application frontend - Force Deploy ${timestamp}`;
fs.writeFileSync('vocabulary-app/package.json', JSON.stringify(frontendPackage, null, 2));
console.log('✅ 更新前端 package.json');

// 3. 修改后端关键文件
const backendPackage = JSON.parse(fs.readFileSync('vocabulary-api/package.json', 'utf8'));
backendPackage.version = `1.0.${Date.now().toString().slice(-6)}`;
backendPackage.description = `Vocabulary learning application backend API - Force Deploy ${timestamp}`;
fs.writeFileSync('vocabulary-api/package.json', JSON.stringify(backendPackage, null, 2));
console.log('✅ 更新后端 package.json');

// 4. 提交并推送
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "🚨 EMERGENCY DEPLOY TRIGGER - ${timestamp}"`, { stdio: 'inherit' });
  console.log('✅ 提交更改');
  
  execSync('git push origin main --force-with-lease', { stdio: 'inherit' });
  console.log('✅ 推送到远程仓库');
  
  // 5. 创建空提交作为备用
  execSync(`git commit --allow-empty -m "🔄 EMPTY COMMIT BACKUP TRIGGER - ${timestamp}"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ 创建并推送空提交');
  
} catch (error) {
  console.log('❌ Git 操作失败:', error.message);
}

console.log('\n🎯 强制触发完成！');
console.log('\n📋 接下来请检查:');
console.log('1. Vercel Dashboard 是否显示新的部署');
console.log('2. GitHub 仓库的 Settings → Webhooks 是否有 Vercel webhook');
console.log('3. 如果仍然失败，请手动在 Vercel 中点击 "Redeploy"');
console.log('\n🔑 最新提交SHA:', execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()); 