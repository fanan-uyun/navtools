#!/bin/bash

# NavTools 启动脚本

echo "========================================"
echo "  NavTools - 实用工具集合平台"
echo "========================================"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 Python3，请先安装 Python 3.10+"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

# 启动后端
echo "[1/2] 启动后端服务..."
cd backend

if [ ! -d "venv" ]; then
    echo "  创建虚拟环境..."
    python3 -m venv venv
fi

echo "  激活虚拟环境并安装依赖..."
source venv/bin/activate
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
    echo "  创建环境变量文件..."
    cp .env.example .env
fi

echo "  启动 FastAPI 服务..."
python main.py &
BACKEND_PID=$!
cd ..

# 启动前端
echo ""
echo "[2/2] 启动前端服务..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "  安装前端依赖..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "  创建环境变量文件..."
    cp .env.example .env
fi

echo "  启动 Vite 开发服务器..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  服务已启动!"
echo "========================================"
echo ""
echo "  前台地址: http://localhost:5173"
echo "  后台地址: http://localhost:5173/admin/login"
echo "  API文档:  http://localhost:8000/docs"
echo ""
echo "  默认账号: admin / Admin@123"
echo ""
echo "  按 Ctrl+C 停止服务"
echo ""

# 等待中断
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
