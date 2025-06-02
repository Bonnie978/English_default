# 本地开发指南 🚀

## 📁 项目结构
```
English_default/
├── vocabulary-app/     # 前端React应用 (端口3000)
├── vocabulary-api/     # 后端API服务 (端口3001)
└── LOCAL_DEVELOPMENT.md
```

## 🛠️ 本地开发环境启动

### 1. 启动后端API服务
```bash
cd vocabulary-api
npm run dev
# 服务运行在 http://localhost:3001
```

### 2. 启动前端应用
```bash
cd vocabulary-app  
npm start
# 应用运行在 http://localhost:3000
```

## 🧪 本地测试流程

### 前端测试
```bash
cd vocabulary-app
npm test                    # 运行单元测试
npm run build              # 测试构建是否成功
```

### 后端测试
```bash
cd vocabulary-api
npm run test:supabase      # 测试数据库连接
node scripts/simpleTest.js # 测试API功能
```

### 手动测试检查清单
- [ ] 页面能正常加载
- [ ] API接口返回正确数据
- [ ] 单词显示正确（spelling, pronunciation, definitions, examples）
- [ ] 进度统计正确
- [ ] 错误处理正常
- [ ] 路由跳转正常

## 🚀 部署前检查

### 必要检查
1. **本地测试通过**：确保所有功能在本地正常工作
2. **控制台无错误**：检查浏览器和终端控制台
3. **数据格式正确**：验证API返回数据格式
4. **边界情况处理**：测试加载状态、错误状态、空数据等

### 部署命令
```bash
# 只有在本地测试完全通过后才执行
git add .
git commit -m "描述性提交信息"
git push origin main
```

## 🐛 调试技巧

### 前端调试
- 使用 `console.log()` 打印状态和数据
- 检查 Network 标签页的API请求
- 使用 React Developer Tools

### 后端调试  
- 查看终端输出的日志
- 检查 `app.log` 文件
- 使用 Postman 测试API接口

## 📝 开发最佳实践

### 代码变更流程
1. **本地开发** → 2. **本地测试** → 3. **确认无误** → 4. **提交部署**

### 避免频繁部署
- ✅ 在本地完成完整的功能开发和测试
- ✅ 一次性修复多个相关问题
- ✅ 确保代码质量后再部署
- ❌ 避免每个小修改都立即部署

### 提交信息规范
- 🐛 `fix: 修复单词显示问题`
- ✨ `feat: 添加新功能`
- 🎨 `style: UI样式调整`
- 🔧 `chore: 配置文件更新`

## 🔧 环境变量配置

### 前端 (.env)
```
REACT_APP_API_URL=http://localhost:3001  # 本地开发时指向本地API
```

### 后端 (.env)
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
DEEPSEEK_API_KEY=your_deepseek_key
```

## 📞 常见问题

### Q: CORS错误
A: 确保后端API设置了正确的CORS头

### Q: API连接失败
A: 检查后端服务是否在3001端口运行

### Q: 数据库连接失败
A: 验证Supabase环境变量配置

---
⚡ **记住：先本地验证，再触发部署！** 