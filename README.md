# NavTools

基于 FastAPI + React + Supabase 的实用工具集合平台，采用粗野主义设计风格。

[English](./README_EN.md) | 简体中文

## 在线演示

- 前台: https://navtools-demo.vercel.app
- 后台: https://navtools-demo.vercel.app/admin/login

## 功能特性

### 前台
- 🏠 首页展示 - 精选工具、分类导航
- 🔍 搜索功能 - 实时搜索
- 🎨 8种主题 - 可切换配色
- 📱 响应式设计

### 后台
- 🔐 JWT 认证
- 🛠️ 工具/分类/图标管理
- ⚙️ 网站配置
- 👥 多管理员支持
- 📋 审计日志

### 自研工具
- 📰 公众号文章提取
- 📊 JSON 格式化

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18, Vite, Tailwind CSS |
| 后端 | FastAPI, SQLAlchemy 2.0 |
| 数据库 | Supabase PostgreSQL |
| 部署 | Vercel |

## 快速开始

### 方式一：Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/navtools)

### 方式二：本地开发

```bash
# 1. 克隆项目
git clone https://github.com/your-username/navtools.git
cd navtools

# 2. 启动后端
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 设置数据库
python main.py

# 3. 启动前端 (新终端)
cd frontend
npm install
npm run dev
```

访问:
- 前台: http://localhost:5173
- 后台: http://localhost:5173/admin/login (admin / Admin@123)

## 部署文档

详见 [DEPLOY.md](./DEPLOY.md)

## 项目结构

```
NavTools/
├── backend/           # FastAPI 后端
│   ├── app/          # 核心代码
│   ├── devtools/     # 自研工具
│   └── main.py       # 入口
├── frontend/         # React 前端
│   └── src/
│       ├── pages/    # 页面
│       └── components/
└── DEPLOY.md         # 部署指南
```

## 环境变量

### 后端 (.env)
```
DATABASE_URL=postgresql+asyncpg://...
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 前端 (.env)
```
VITE_API_BASE_URL=https://your-backend.vercel.app
```

## 截图

![首页](./docs/screenshot-home.png)
![后台](./docs/screenshot-admin.png)

## 贡献

欢迎 Issue 和 PR!

## 许可证

MIT License
