#!/bin/bash

echo "🧪 本地功能测试..."

# 测试后端API
test_backend() {
    echo "📡 测试后端API..."
    
    # 测试基本连接
    if curl -s http://localhost:3001/api/hello > /dev/null; then
        echo "✅ 后端API服务正常"
    else
        echo "❌ 后端API服务连接失败"
        return 1
    fi
    
    # 测试单词API
    if curl -s "http://localhost:3001/api/words-daily?limit=5" | grep -q "success"; then
        echo "✅ 单词API正常"
    else
        echo "❌ 单词API测试失败"
        return 1
    fi
    
    # 测试统计API
    if curl -s http://localhost:3001/api/words-stats | grep -q "success"; then
        echo "✅ 统计API正常"
    else
        echo "❌ 统计API测试失败"
        return 1
    fi
}

# 测试前端构建
test_frontend() {
    echo "🎨 测试前端构建..."
    cd vocabulary-app
    
    # 测试构建
    if npm run build > /dev/null 2>&1; then
        echo "✅ 前端构建成功"
        cd ..
        return 0
    else
        echo "❌ 前端构建失败"
        cd ..
        return 1
    fi
}

# 运行测试
echo "开始测试..."
echo ""

# 检查服务是否运行
if ! curl -s http://localhost:3001/api/hello > /dev/null; then
    echo "⚠️  后端服务未运行，请先启动："
    echo "   cd vocabulary-api && npm run dev"
    echo ""
fi

if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  前端服务未运行，请先启动："
    echo "   cd vocabulary-app && npm start"
    echo ""
fi

# 执行测试
BACKEND_OK=0
FRONTEND_OK=0

if test_backend; then
    BACKEND_OK=1
fi

echo ""

if test_frontend; then
    FRONTEND_OK=1
fi

echo ""
echo "📊 测试结果："
echo "后端API: $([ $BACKEND_OK -eq 1 ] && echo "✅ 通过" || echo "❌ 失败")"
echo "前端构建: $([ $FRONTEND_OK -eq 1 ] && echo "✅ 通过" || echo "❌ 失败")"

if [ $BACKEND_OK -eq 1 ] && [ $FRONTEND_OK -eq 1 ]; then
    echo ""
    echo "🎉 所有测试通过！可以安全部署。"
    echo ""
    echo "部署命令："
    echo "git add ."
    echo "git commit -m '你的提交信息'"
    echo "git push origin main"
else
    echo ""
    echo "⚠️  测试未完全通过，请修复问题后再部署。"
fi 