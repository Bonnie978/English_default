# 简化本地开发指南 🚀

## 🎯 推荐方案：前端本地开发 + 生产API

由于后端使用Vercel函数架构，最简单的本地开发方式是：
- ✅ **前端**：本地开发 (localhost:3000)
- ✅ **后端**：使用生产API (english-default-steel.vercel.app)

## 🚀 快速启动

### 方法1：只启动前端（推荐）
```bash
cd vocabulary-app
npm start
# 前端运行在 http://localhost:3000
# 自动连接到生产API
```

### 方法2：使用启动脚本
```bash
# 停止现有服务
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 启动前端
cd vocabulary-app && npm start
```

## 🧪 本地测试流程

### 前端测试
```bash
cd vocabulary-app
npm run build    # 测试构建
npm test         # 运行测试
```

### 功能测试
在浏览器中访问 `http://localhost:3000` 并测试：
- [ ] 页面正常加载
- [ ] 单词列表显示正确
- [ ] 进度统计正常
- [ ] 路由跳转正常
- [ ] 无JavaScript错误

## 📝 开发工作流

1. **修改代码** → 2. **浏览器测试** → 3. **构建测试** → 4. **部署**

```bash
# 开发过程中的快速测试
npm start          # 启动开发服务器
# 在浏览器中测试功能

# 部署前的完整测试
npm run build      # 确保构建成功
# 如果构建成功且功能正常，则可以部署

git add .
git commit -m "你的提交信息"
git push origin main
```

## ⚡ 快速命令

```bash
# 停止所有端口占用
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null

# 启动前端开发
cd vocabulary-app && npm start

# 测试构建
cd vocabulary-app && npm run build

# 查看日志
# 浏览器 F12 Console 查看前端日志
# Network 标签查看API请求
```

## 🐛 常见问题

### Q: 端口3000被占用
```bash
lsof -ti:3000 | xargs kill -9
cd vocabulary-app && npm start
```

### Q: API请求失败
- 检查网络连接
- 查看浏览器Network标签
- 确认API地址正确

### Q: 单词不显示
- 检查浏览器Console错误
- 验证API返回数据格式
- 检查组件字段映射

---
💡 **提示：这种方式避免了本地后端配置的复杂性，让您专注于前端开发！** 