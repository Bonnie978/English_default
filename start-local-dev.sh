#!/bin/bash

echo "🚀 启动本地开发环境..."

# 检查是否在正确的目录
if [ ! -d "vocabulary-app" ] || [ ! -d "vocabulary-api" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 函数：启动后端
start_backend() {
    echo "📡 启动后端API服务..."
    cd vocabulary-api
    
    # 检查是否有.env文件
    if [ ! -f ".env" ]; then
        echo "❌ 后端缺少.env文件，请检查配置"
        exit 1
    fi
    
    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo "📦 安装后端依赖..."
        npm install
    fi
    
    # 启动开发服务器
    echo "🔗 后端服务将运行在 http://localhost:3001"
    npm run dev &
    BACKEND_PID=$!
    cd ..
}

# 函数：启动前端
start_frontend() {
    echo "🎨 启动前端应用..."
    cd vocabulary-app
    
    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo "📦 安装前端依赖..."
        npm install
    fi
    
    # 设置本地开发环境变量
    export REACT_APP_API_URL=http://localhost:3001
    export REACT_APP_ENVIRONMENT=local
    
    # 启动开发服务器
    echo "🌐 前端应用将运行在 http://localhost:3000"
    npm start &
    FRONTEND_PID=$!
    cd ..
}

# 清理函数
cleanup() {
    echo "🛑 停止开发服务器..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# 捕获中断信号
trap cleanup SIGINT SIGTERM

# 启动服务
start_backend
sleep 3  # 等待后端启动
start_frontend

echo ""
echo "✅ 开发环境启动完成！"
echo "📡 后端API: http://localhost:3001"
echo "🌐 前端应用: http://localhost:3000" 
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait 