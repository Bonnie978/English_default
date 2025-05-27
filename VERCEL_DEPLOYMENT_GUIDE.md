# Vercel 前后端一体化部署指南

本指南将帮助你将词汇学习应用（前端 + 后端）部署到 Vercel 平台。

## 项目结构

```
项目根目录/
├── vercel.json                 # Vercel 配置文件
├── vocabulary-app/             # React 前端应用
│   ├── src/
│   ├── package.json
│   └── build/                  # 构建输出目录
├── vocabulary-api/             # Express 后端 API
│   ├── src/
│   ├── api/
│   │   └── index.ts           # Vercel Serverless Function 入口
│   └── package.json
└── README.md
```

## 部署配置说明

### 1. Vercel 配置 (vercel.json)

根目录的 `vercel.json` 配置了：
- **前端构建**：使用 `@vercel/static-build` 构建 React 应用
- **后端 API**：使用 `@vercel/node` 运行 Express 应用作为 Serverless Functions
- **路由规则**：
  - `/api/*` 路径转发到后端 API
  - 其他路径转发到前端应用

### 2. API 路由配置

- 前端 API 调用：`/api/*`
- 后端处理：`vocabulary-api/api/index.ts`
- 生产环境下，前后端运行在同一域名下

## 部署步骤

### 第一步：准备代码

1. 确保所有代码已提交到 Git 仓库
2. 确保项目结构符合上述要求

### 第二步：在 Vercel 上创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 Git 仓库
4. 配置项目设置：
   - **Framework Preset**: Other
   - **Root Directory**: `./` (项目根目录)
   - **Build Command**: `cd vocabulary-app && npm run build`
   - **Output Directory**: `vocabulary-app/build`
   - **Install Command**: `npm install && cd vocabulary-app && npm install && cd ../vocabulary-api && npm install`

### 第三步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 前端环境变量 (REACT_APP_ 前缀)
```
REACT_APP_SUPABASE_URL=https://yuglaystxeopuymtinfs.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzEwNzQsImV4cCI6MjA2MzkwNzA3NH0.DxBxpc1JpUhfeL9Ojpvwy3yHR9sh9tcXj7zRnYq8JS8
REACT_APP_ENVIRONMENT=production
```

#### 后端环境变量
```
SUPABASE_URL=https://yuglaystxeopuymtinfs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzEwNzQsImV4cCI6MjA2MzkwNzA3NH0.DxBxpc1JpUhfeL9Ojpvwy3yHR9sh9tcXj7zRnYq8JS8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODMzMTA3NCwiZXhwIjoyMDYzOTA3MDc0fQ.fEgfymwY-qKWuauqo-DTCZVz71Z-qDWGV4_5RXHhmuI
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret-key
```

### 第四步：部署

1. 点击 "Deploy" 开始部署
2. 等待构建和部署完成
3. 获取部署 URL

## 验证部署

部署完成后，验证以下功能：

1. **前端访问**：访问 Vercel 提供的 URL，确保前端页面正常加载
2. **API 连接**：检查前端是否能正常调用后端 API
3. **Supabase 连接**：确保数据库连接正常工作
4. **用户认证**：测试登录/注册功能

## 常见问题解决

### 1. API 调用失败
- 检查 CORS 配置
- 确认环境变量设置正确
- 查看 Vercel Functions 日志

### 2. 构建失败
- 检查依赖安装是否正确
- 确认 TypeScript 编译无错误
- 查看构建日志详细信息

### 3. 数据库连接问题
- 确认 Supabase 环境变量正确
- 检查 Supabase 项目状态
- 验证 API 密钥权限

## 本地开发

在本地开发时：

1. 运行环境变量创建脚本：
   ```bash
   node create-env-files.js
   ```

2. 启动后端：
   ```bash
   cd vocabulary-api
   npm run dev
   ```

3. 启动前端：
   ```bash
   cd vocabulary-app
   npm start
   ```

## 更新部署

当代码更新时：
1. 提交代码到 Git 仓库
2. Vercel 会自动触发重新部署
3. 监控部署状态和日志

---

## 技术栈

- **前端**: React + TypeScript + Styled Components
- **后端**: Express.js + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel Serverless Functions
- **认证**: Supabase Auth

## 支持

如果遇到问题，请检查：
1. Vercel 部署日志
2. Supabase 项目状态
3. 环境变量配置
4. 网络连接状态 