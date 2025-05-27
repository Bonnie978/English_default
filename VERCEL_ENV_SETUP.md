# Vercel 环境变量配置指南

## 🚀 修复线上部署问题

### 问题分析
1. **API 404错误**: Vercel API处理器路径问题已修复
2. **Supabase认证错误**: 需要在Vercel中配置环境变量

### 📋 需要在Vercel中配置的环境变量

#### 前端环境变量 (用于React应用)
```
REACT_APP_SUPABASE_URL=https://yuglaystxeopuymtinfs.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzEwNzQsImV4cCI6MjA2MzkwNzA3NH0.DxBxpc1JpUhfeL9Ojpvwy3y
```

#### 后端环境变量 (用于API函数)
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://yuglaystxeopuymtinfs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODMzMTA3NCwiZXhwIjoyMDYzOTA3MDc0fQ.your_service_role_key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzEwNzQsImV4cCI6MjA2MzkwNzA3NH0.DxBxpc1JpUhfeL9Ojpvwy3y
JWT_SECRET=your_jwt_secret_key_here
```

### 🔧 Vercel配置步骤

1. **登录Vercel控制台**
   - 访问 https://vercel.com/dashboard
   - 找到您的项目 `eapp-delta`

2. **配置环境变量**
   - 进入项目设置 → Environment Variables
   - 添加上述所有环境变量
   - 确保选择正确的环境 (Production, Preview, Development)

3. **重新部署**
   - 在Vercel控制台触发重新部署
   - 或者推送新的代码提交自动触发部署

### 🔍 已修复的问题

#### ✅ API路由修复
- 修复了 `vocabulary-api/api/index.ts` 中的路径处理
- 现在保留 `/api` 前缀，与Express路由配置一致

#### ✅ 代码推送
- 更新了 `.gitignore` 配置
- 推送了最新的修复代码

### 🧪 测试步骤

部署完成后，测试以下功能：

1. **API端点测试**
   ```bash
   curl https://eapp-delta.vercel.app/api/health
   # 应该返回: {"status":"ok",...}
   ```

2. **认证测试**
   - 访问应用首页
   - 检查浏览器控制台是否还有404错误
   - 尝试登录功能

3. **Supabase连接测试**
   - 检查认证token刷新是否正常
   - 确认API调用返回正确的认证错误而非404

### 📝 注意事项

- 环境变量配置后需要重新部署才能生效
- 确保所有密钥都是有效的
- 生产环境中不要暴露敏感的service role key

### 🆘 如果仍有问题

1. 检查Vercel部署日志
2. 确认环境变量是否正确设置
3. 验证Supabase项目状态
4. 检查API路由是否正确响应 