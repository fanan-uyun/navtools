# NavTools - Vercel + Supabase 部署指南

## 部署架构

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Vercel    │      │   Vercel    │      │  Supabase   │
│  Frontend   │◄────►│  Backend    │◄────►│ PostgreSQL  │
│  (React)    │      │  (FastAPI)  │      │   + Storage │
└─────────────┘      └─────────────┘      └─────────────┘
```

---

## 1. 准备工作

### 注册账号
- [Vercel](https://vercel.com) - 用于部署前后端
- [Supabase](https://supabase.com) - 用于 PostgreSQL 数据库
- [GitHub](https://github.com) - 代码仓库

---

## 2. 创建 GitHub 仓库

```bash
# 在项目根目录初始化 Git
cd NavTools
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: NavTools v1.0"

# 添加远程仓库 (替换 your-username 和 your-repo)
git remote add origin https://github.com/your-username/navtools.git

# 推送
git push -u origin main
```

---

## 3. 配置 Supabase 数据库

### 3.1 创建项目
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目名称 (如: navtools)
4. 设置数据库密码 (保存好!)
5. 选择区域 (建议选 Asia Pacific)
6. 等待项目创建完成 (~2分钟)

### 3.2 获取数据库连接
1. 进入项目 → Settings → Database
2. 找到 "Connection string"
3. 选择 URI 格式，复制连接字符串
4. 格式示例:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 3.3 初始化数据库表
1. 进入 SQL Editor
2. 粘贴并执行以下 SQL:

```sql
-- 创建表结构
-- 此 SQL 会在首次启动后端时自动创建，无需手动执行
-- 如需手动创建，可从 backend/app/models.py 生成
```

---

## 4. 部署后端到 Vercel

### 4.1 导入项目
1. 登录 [Vercel Dashboard](https://vercel.com)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库 `navtools`
4. 选择 `backend` 目录作为根目录

### 4.2 配置构建设置
- **Framework Preset**: Other
- **Build Command**: 留空
- **Output Directory**: 留空
- **Install Command**: `pip install -r requirements.txt`

### 4.3 配置环境变量
添加以下环境变量:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:xxx@db.xxx.supabase.co:5432/postgres` | Supabase 连接字符串 |
| `SECRET_KEY` | 随机字符串 (32位以上) | JWT 密钥 |
| `DEBUG` | `false` | 关闭调试模式 |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | 前端域名 |

### 4.4 部署
点击 "Deploy"，等待部署完成。

记下部署后的域名: `https://navtools-api.vercel.app`

---

## 5. 部署前端到 Vercel

### 5.1 创建新项目
1. 在 Vercel 点击 "Add New Project"
2. 导入同一个 GitHub 仓库
3. 选择 `frontend` 目录作为根目录

### 5.2 配置构建设置
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5.3 配置环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://navtools-api.vercel.app` | 后端 API 地址 |

### 5.4 部署
点击 "Deploy"，等待部署完成。

---

## 6. 配置 CORS (重要!)

部署完成后，需要更新后端的环境变量 `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-git-main.vercel.app
```

---

## 7. 初始化管理员账号

首次访问后端 API 时，系统会自动创建默认管理员:
- 用户名: `admin`
- 密码: `Admin@123`

**重要**: 登录后立即修改密码!

---

## 8. 自定义域名 (可选)

### 8.1 前端自定义域名
1. 进入前端项目的 Vercel 设置
2. Domains → Add Custom Domain
3. 输入你的域名 (如: `tools.yourdomain.com`)
4. 按提示配置 DNS

### 8.2 后端自定义域名
1. 同样方式添加自定义域名
2. 更新前端的环境变量 `VITE_API_BASE_URL`
3. 重新部署前端

---

## 9. 常用命令

### 本地开发
```bash
# 启动后端 (端口 8000)
cd backend
source venv/bin/activate
python main.py

# 启动前端 (端口 5173)
cd frontend
npm run dev
```

### 数据库迁移 (如需要)
```bash
cd backend
alembic init alembic
alembic revision --autogenerate -m "init"
alembic upgrade head
```

---

## 10. 故障排查

### 问题: 数据库连接失败
**解决**: 
- 检查 `DATABASE_URL` 是否正确
- 确认 Supabase 项目处于 Active 状态
- 检查 IP 白名单 (Supabase 默认允许所有 IP)

### 问题: CORS 错误
**解决**:
- 更新 `ALLOWED_ORIGINS` 包含前端完整域名
- 包含 `https://` 前缀
- 重新部署后端

### 问题: 前端 API 404
**解决**:
- 检查 `VITE_API_BASE_URL` 是否以 `https://` 开头
- 确认后端部署成功且可访问
- 检查浏览器 Network 面板查看具体错误

### 问题: 静态资源加载失败
**解决**:
- 检查 `vite.config.js` 中的 `base` 配置
- Vercel 部署通常不需要修改 base

---

## 11. 性能优化

### 启用 Vercel Edge Network
- 后端已自动使用 Vercel Edge
- 数据库连接使用连接池

### 数据库优化
- Supabase 免费版支持 500MB 数据
- 如需更多，可升级到 Pro ($25/月)

### 图片资源
- 建议将图片托管到 Supabase Storage 或 CDN

---

## 参考链接

- [Vercel Python Runtime](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python)
- [Supabase Docs](https://supabase.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

## 完成! 

你的 NavTools 现在运行在:
- 🌐 前端: `https://your-frontend.vercel.app`
- 🔧 后端: `https://your-backend.vercel.app`
- 💾 数据库: `Supabase PostgreSQL`
