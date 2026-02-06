# 快速部署指南

5 分钟完成 NavTools 部署到 Vercel + Supabase

## 1. 创建 Supabase 数据库 (1分钟)

1. 登录 [supabase.com](https://supabase.com)
2. New Project → 设置密码 → Create
3. Settings → Database → 复制 Connection string

## 2. 部署后端到 Vercel (2分钟)

1. [vercel.com](https://vercel.com) → Add New Project
2. 导入 GitHub 仓库
3. Root Directory: `backend`
4. Framework Preset: `Other`
5. 添加环境变量:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:密码@db.xxx.supabase.co:5432/postgres
   SECRET_KEY=随机32位字符串
   DEBUG=false
   ```
6. Deploy

记下域名: `https://xxx.vercel.app`

## 3. 部署前端到 Vercel (1分钟)

1. Add New Project → 导入同一仓库
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. 添加环境变量:
   ```
   VITE_API_BASE_URL=https://xxx.vercel.app (上一步的域名)
   ```
5. Deploy

## 4. 配置 CORS (30秒)

1. 后端项目 → Settings → Environment Variables
2. 添加 `ALLOWED_ORIGINS=https://你的前端域名.vercel.app`
3. Redeploy

## 5. 验证 (30秒)

- 前台: `https://前端域名.vercel.app`
- 后台: `https://前端域名.vercel.app/admin/login`
- 默认账号: admin / Admin@123

---

## 常见错误

| 错误 | 解决 |
|------|------|
| 数据库连接失败 | 检查密码是否 URL 编码 (@ → %40) |
| CORS 错误 | 更新 ALLOWED_ORIGINS 并重新部署 |
| 404 | 检查 Root Directory 是否正确 |

---

## 需要修改的文件

### backend/.env (本地开发)
```
DATABASE_URL=postgresql+asyncpg://...
SECRET_KEY=xxx
```

### frontend/.env (本地开发)
```
VITE_API_BASE_URL=http://localhost:8000
```

生产环境使用 Vercel 环境变量，不要提交 .env 文件!
