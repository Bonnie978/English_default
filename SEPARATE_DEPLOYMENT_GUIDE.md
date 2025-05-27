# 前后端分开部署指南

## 概述
本项目现在支持前后端分开部署，每个部分都有独立的 Vercel 配置。

## ⚠️ 重要：准备工作

**在开始分开部署之前，必须删除或重命名根目录的 `vercel.json` 文件！**

根目录的 `vercel.json` 会干扰分开部署，因为 Vercel 会优先使用它。请确保：
- 删除根目录的 `vercel.json` 文件，或者
- 将其重命名为 `vercel.json.backup`

## 部署步骤

### 1. 部署后端 API (vocabulary-api)

1. **在 Vercel 创建新项目**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 选择 GitHub 仓库：`Bonnie978/English_default`
   - **重要**：在 "Root Directory" 设置为 `vocabulary-api`
   - 项目名称建议：`vocabulary-api` 或 `english-vocab-api`

2. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **部署完成后**
   - 记录 API 域名，例如：`https://vocabulary-api.vercel.app`
   - 测试端点：`https://your-api-domain.vercel.app/api/test`

### 2. 部署前端应用 (vocabulary-app)

1. **在 Vercel 创建另一个新项目**
   - 再次点击 "New Project"
   - 选择同一个 GitHub 仓库：`Bonnie978/English_default`
   - **重要**：在 "Root Directory" 设置为 `vocabulary-app`
   - 项目名称建议：`vocabulary-app` 或 `english-vocab-frontend`

2. **配置环境变量**
   在前端项目设置中添加：
   ```
   REACT_APP_API_URL=https://your-api-domain.vercel.app
   ```

3. **部署完成后**
   - 前端应用将可以通过新域名访问
   - 前端会自动连接到后端 API

## 项目结构

```
English_default/
├── vocabulary-api/          ← 后端项目根目录
│   ├── vercel.json         ← 后端 Vercel 配置
│   ├── api/
│   │   ├── index.ts        ← 主 API 处理函数
│   │   └── test.ts         ← 测试端点
│   ├── src/
│   └── package.json
├── vocabulary-app/          ← 前端项目根目录
│   ├── vercel.json         ← 前端 Vercel 配置
│   ├── src/
│   ├── public/
│   └── package.json
└── vercel.json.backup      ← 原始配置（已重命名）
```

## 优势

1. **独立部署**：前后端可以独立更新和部署
2. **更好的性能**：每个服务都可以独立优化
3. **更容易调试**：问题定位更精确
4. **配置简单**：每个项目都有自己的简单配置

## 测试端点

### 后端 API 测试
- 健康检查：`GET /api/health`
- 测试端点：`GET /api/test`
- 调试信息：`GET /api/debug`
- 单词统计：`GET /api/words/stats`

### 前端应用测试
- 访问主页确认应用正常加载
- 检查网络请求是否正确指向后端 API

## 注意事项

1. **CORS 配置**：后端已配置允许所有来源，生产环境建议限制具体域名
2. **环境变量**：确保所有必要的环境变量都已在 Vercel 中设置
3. **域名更新**：部署后需要更新前端的 API 地址配置

## 故障排除

1. **API 404 错误**：检查后端项目的 Root Directory 是否设置为 `vocabulary-api`
2. **CORS 错误**：确认后端 CORS 配置正确
3. **环境变量**：检查 Vercel 项目设置中的环境变量配置
4. **构建失败**：查看 Vercel 部署日志中的具体错误信息 