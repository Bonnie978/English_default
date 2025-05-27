# 更新现有 Vercel 项目设置

如果你已经在 Vercel 上有项目，需要修改设置来支持前后端一体化部署。

## 🔧 步骤一：修改项目构建设置

1. **访问项目设置**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 找到你的项目并点击进入
   - 点击 **Settings** 标签

2. **修改 Build & Output Settings**
   
   在 **Settings** → **General** → **Build & Output Settings** 中：
   
   - **Framework Preset**: 选择 `Other`
   - **Root Directory**: 设置为 `.` (项目根目录)
   - **Build Command**: 设置为 `cd vocabulary-app && npm run build`
   - **Output Directory**: 设置为 `vocabulary-app/build`
   - **Install Command**: 设置为 `npm install && cd vocabulary-app && npm install && cd ../vocabulary-api && npm install`

   点击 **Save** 保存设置。

## 🌍 步骤二：配置环境变量

在 **Settings** → **Environment Variables** 中添加以下变量：

### 前端环境变量
```
REACT_APP_SUPABASE_URL = https://yuglaystxeopuymtinfs.supabase.co
REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzEwNzQsImV4cCI6MjA2MzkwNzA3NH0.DxBxpc1JpUhfeL9Ojpvwy3yHR9sh9tcXj7zRnYq8JS8
REACT_APP_ENVIRONMENT = production
```

### 后端环境变量
```
SUPABASE_URL = https://yuglaystxeopuymtinfs.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzEwNzQsImV4cCI6MjA2MzkwNzA3NH0.DxBxpc1JpUhfeL9Ojpvwy3yHR9sh9tcXj7zRnYq8JS8
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODMzMTA3NCwiZXhwIjoyMDYzOTA3MDc0fQ.fEgfymwY-qKWuauqo-DTCZVz71Z-qDWGV4_5RXHhmuI
NODE_ENV = production
JWT_SECRET = your-production-jwt-secret-key-here
```

**重要提示**：
- 每个环境变量都要设置为 **Production**、**Preview** 和 **Development** 环境
- 点击 **Add** 添加每个变量
- `JWT_SECRET` 请设置为一个强密码

## 🚀 步骤三：触发重新部署

1. **提交代码更改**
   ```bash
   git add .
   git commit -m "更新 Vercel 配置支持前后端一体化部署"
   git push
   ```

2. **手动触发部署**（可选）
   - 在 Vercel 项目页面点击 **Deployments** 标签
   - 点击 **Redeploy** 按钮重新部署

## 🔍 步骤四：验证部署

部署完成后，检查以下内容：

### 基础验证
- [ ] 访问你的 Vercel 域名，前端页面正常加载
- [ ] 访问 `your-domain.vercel.app/api/health` 检查后端 API
- [ ] 检查浏览器控制台是否有错误

### 功能验证
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 前端能正常调用后端 API
- [ ] Supabase 数据库连接正常

## 🐛 常见问题解决

### 如果构建失败
1. 检查 **Deployments** 页面的构建日志
2. 确认所有文件都已正确提交到 Git
3. 验证 `vercel.json` 配置文件格式正确

### 如果 API 调用失败
1. 检查环境变量是否正确设置
2. 确认 `vocabulary-api/api/index.ts` 文件存在
3. 查看 **Functions** 标签下的日志

### 如果页面显示异常
1. 检查前端构建是否成功
2. 确认 `vocabulary-app/build` 目录生成正确
3. 检查路由配置是否正确

## 📋 快速检查清单

在修改设置前，确保：
- [ ] 已运行 `node test-deployment.js` 验证配置
- [ ] 所有代码更改已提交到 Git
- [ ] `vercel.json` 文件在项目根目录
- [ ] `vocabulary-api/api/index.ts` 文件存在

## 💡 提示

- 修改设置后，Vercel 会自动触发重新部署
- 首次部署可能需要几分钟时间
- 如果遇到问题，可以查看详细的构建日志进行排查
- 环境变量修改后需要重新部署才能生效 