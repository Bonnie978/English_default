# English Learning Application

这是一个英语学习应用，包含词汇练习功能的完整前后端项目。

## 项目结构

```
English_default/
├── vocabulary-app/     # 前端React应用
├── vocabulary-api/     # 后端Node.js API
├── vercel.json        # Vercel部署配置
├── VERCEL_DEPLOYMENT_GUIDE.md  # 部署指南
└── Steps/             # 项目开发步骤文档
```

## 功能特性

- 词汇学习和练习
- 听力练习
- 阅读练习
- 写作练习
- 用户进度跟踪
- Supabase 数据库集成
- 用户认证系统

## 技术栈

### 前端 (vocabulary-app)
- React + TypeScript
- Styled Components
- React Router
- Supabase Auth
- Axios

### 后端 (vocabulary-api)
- Node.js + TypeScript
- Express.js
- Supabase (PostgreSQL)
- JWT 认证
- CORS 支持

### 部署
- Vercel Serverless Functions
- 前后端一体化部署
- 自动 CI/CD

## 快速开始

### 本地开发

1. **创建环境变量文件**
```bash
node create-env-files.js
```

2. **启动后端API**
```bash
cd vocabulary-api
npm install
npm run dev
```

3. **启动前端应用**
```bash
cd vocabulary-app
npm install
npm start
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:3001

### 部署到 Vercel

1. **检查部署配置**
```bash
node test-deployment.js
```

2. **按照部署指南操作**
详细步骤请查看 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

## 环境变量

### 前端环境变量
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_ENVIRONMENT=development
```

### 后端环境变量
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret
```

## 开发文档

- [Vercel 部署指南](./VERCEL_DEPLOYMENT_GUIDE.md)
- [Supabase 集成文档](./SUPABASE_INTEGRATION_COMPLETE.md)
- 详细的开发文档和实现步骤请查看各个子目录中的README文件

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License 