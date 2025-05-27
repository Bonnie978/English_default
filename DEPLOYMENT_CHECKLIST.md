# Vercel 部署检查清单

在部署到 Vercel 之前，请确保完成以下检查项：

## 📋 部署前检查

### ✅ 代码准备
- [ ] 所有代码已提交到 Git 仓库
- [ ] 项目结构符合要求（前端在 vocabulary-app，后端在 vocabulary-api）
- [ ] 运行 `node test-deployment.js` 检查配置

### ✅ 配置文件
- [ ] 根目录存在 `vercel.json` 配置文件
- [ ] 后端存在 `vocabulary-api/api/index.ts` 入口文件
- [ ] 前端 package.json 包含 build 脚本
- [ ] 后端 package.json 包含 @vercel/node 依赖

### ✅ 环境变量准备
准备以下环境变量（在 Vercel 项目设置中配置）：

#### 前端环境变量
- [ ] `REACT_APP_SUPABASE_URL`
- [ ] `REACT_APP_SUPABASE_ANON_KEY`
- [ ] `REACT_APP_ENVIRONMENT=production`

#### 后端环境变量
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET`（生产环境密钥）

## 🚀 Vercel 项目设置

### 项目配置
- [ ] Framework Preset: **Other**
- [ ] Root Directory: **.**（项目根目录）
- [ ] Build Command: **cd vocabulary-app && npm run build**
- [ ] Output Directory: **vocabulary-app/build**
- [ ] Install Command: **npm install && cd vocabulary-app && npm install && cd ../vocabulary-api && npm install**

### 环境变量配置
- [ ] 在 Vercel 项目设置 → Environment Variables 中添加所有必需的环境变量
- [ ] 确保所有环境变量都设置为 Production、Preview 和 Development 环境

## 🔍 部署后验证

### 基础功能测试
- [ ] 前端页面正常加载
- [ ] API 端点响应正常（访问 `your-domain.vercel.app/api/health`）
- [ ] 前端能成功调用后端 API
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] Supabase 数据库连接正常

### 性能检查
- [ ] 页面加载速度正常
- [ ] API 响应时间合理
- [ ] 没有控制台错误

## 🐛 常见问题排查

### 如果部署失败
1. 检查 Vercel 构建日志
2. 确认所有依赖都已正确安装
3. 验证 TypeScript 编译无错误
4. 检查环境变量是否正确设置

### 如果 API 调用失败
1. 检查 CORS 配置
2. 验证 API 路由配置
3. 确认环境变量在 Vercel 中正确设置
4. 查看 Vercel Functions 日志

### 如果数据库连接失败
1. 确认 Supabase 项目状态正常
2. 验证 Supabase 环境变量正确
3. 检查 API 密钥权限
4. 确认网络连接正常

## 📞 获取帮助

如果遇到问题：
1. 查看 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) 详细指南
2. 检查 Vercel 官方文档
3. 查看项目的 GitHub Issues
4. 联系项目维护者

---

**提示**: 首次部署可能需要几分钟时间，请耐心等待。部署成功后，Vercel 会提供一个可访问的 URL。 