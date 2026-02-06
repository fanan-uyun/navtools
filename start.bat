@echo off
chcp 65001 >nul

:: NavTools 启动脚本 (Windows)

echo ========================================
echo   NavTools - 实用工具集合平台
echo ========================================
echo.

:: 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Python，请先安装 Python 3.10+
    exit /b 1
)

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Node.js，请先安装 Node.js 18+
    exit /b 1
)

:: 启动后端
echo [1/2] 启动后端服务...
cd backend

if not exist "venv" (
    echo   创建虚拟环境...
    python -m venv venv
)

echo   激活虚拟环境并安装依赖...
call venv\Scripts\activate
pip install -q -r requirements.txt

if not exist ".env" (
    echo   创建环境变量文件...
    copy .env.example .env
)

echo   启动 FastAPI 服务...
start "Backend" python main.py

cd ..

:: 启动前端
echo.
echo [2/2] 启动前端服务...
cd frontend

if not exist "node_modules" (
    echo   安装前端依赖...
    npm install
)

if not exist ".env" (
    echo   创建环境变量文件...
    copy .env.example .env
)

echo   启动 Vite 开发服务器...
start "Frontend" npm run dev

cd ..

echo.
echo ========================================
echo   服务已启动!
echo ========================================
echo.
echo   前台地址: http://localhost:5173
echo   后台地址: http://localhost:5173/admin/login
echo   API文档:  http://localhost:8000/docs
echo.
echo   默认账号: admin / Admin@123
echo.
echo   关闭此窗口将停止服务
echo.

pause
