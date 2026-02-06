# Vercel + Supabase 部署检查清单

## 部署前准备

### 1. 代码准备
- [ ] 所有代码已提交到 GitHub
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] `backend/.env.example` 包含所有必要变量
- [ ] `frontend/.env.example` 包含所有必要变量

### 2. 账号注册
- [ ] [GitHub](https://github.com) 账号
- [ ] [Vercel](https://vercel.com) 账号 (可用 GitHub 登录)
- [ ] [Supabase](https://supabase.com) 账号 (可用 GitHub 登录)

---

## Supabase 配置

### 创建项目
- [ ] 登录 Supabase Dashboard
- [ ] 点击 "New Project"
- [ ] 设置项目名称: `navtools`
- [ ] 设置强密码 (保存到密码管理器!)
- [ ] 选择区域: `Asia Pacific (Singapore)`
- [ ] 等待项目创建完成

### 获取连接信息
- [ ] 进入 Settings → Database
- [ ] 复制 Connection string (URI 格式)
- [ ] 格式: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

---

## Vercel 后端部署

### 导入项目
- [ ] Vercel Dashboard → Add New Project
- [ ] 导入 `navtools` GitHub 仓库
- [ ] Root Directory: `backend`

### 构建设置
- [ ] Framework Preset: `Other`
- [ ] Build Command: (留空)
- [ ] Output Directory: (留空)
- [ ] Install Command: `pip install -r requirements.txt`

### 环境变量
添加以下环境变量:

| 变量名 | 值示例 |
|--------|--------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:xxx@db.xxx.supabase.co:5432/postgres` |
| `SECRET_KEY` | `your-super-secret-key-32-chars-minimum-length` |
| `DEBUG` | `false` |
| `ALLOWED_ORIGINS` | (先留空，部署后填) |
| `LOG_LEVEL` | `INFO` |
| `DEFAULT_ADMIN_USERNAME` | `admin` |
| `DEFAULT_ADMIN_PASSWORD` | `Admin@123` |
| `DEFAULT_ADMIN_EMAIL` | `admin@yourdomain.com` |

### 部署
- [ ] 点击 Deploy
- [ ] 等待构建完成 (~2-3分钟)
- [ ] 记下域名: `https://navtools-xxxx.vercel.app`
- [ ] 测试 API: 访问 `https://xxx.vercel.app/health`

---

## Vercel 前端部署

### 导入项目
- [ ] Vercel Dashboard → Add New Project
- [ ] 导入同一个 GitHub 仓库
- [ ] Root Directory: `frontend`

### 构建设置
- [ ] Framework Preset: `Vite`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### 环境变量
| 变量名 | 值 |
|--------|-----|
| `VITE_API_BASE_URL` | `https://your-backend.vercel.app` |

### 部署
- [ ] 点击 Deploy
- [ ] 等待构建完成
- [ ] 记下域名: `https://navtools-xxxx.vercel.app`

---

## CORS 配置 (重要!)

### 更新后端环境变量
- [ ] Vercel → 后端项目 → Settings → Environment Variables
- [ ] 编辑 `ALLOWED_ORIGINS`
- [ ] 值: `https://your-frontend.vercel.app,https://your-frontend-git-main.vercel.app`
- [ ] 保存并重新部署 (Redeploy)

---

## 验证部署

### 后端测试
- [ ] 访问 `https://backend.vercel.app/health` → 返回 `{"status": "ok"}`
- [ ] 访问 `https://backend.vercel.app/docs` → 显示 Swagger 文档

### 前端测试
- [ ] 访问 `https://frontend.vercel.app` → 显示首页
- [ ] 分类列表正常显示
- [ ] 工具列表正常显示

### 后台测试
- [ ] 访问 `https://frontend.vercel.app/admin/login`
- [ ] 使用 admin / Admin@123 登录
- [ ] 登录成功，进入仪表盘

---

## 配置自定义域名 (可选)

### 前端
- [ ] Vercel → 前端项目 → Settings → Domains
- [ ] Add Custom Domain
- [ ] 输入: `tools.yourdomain.com`
- [ ] 按提示配置 DNS CNAME

### 后端
- [ ] 同样方式添加: `api.yourdomain.com`
- [ ] 更新前端环境变量 `VITE_API_BASE_URL`
- [ ] 重新部署前端

---

## 安全加固

### 必做
- [ ] 登录后台后立即修改默认密码
- [ ] 创建新的超级管理员账号
- [ ] 删除或禁用默认 admin 账号 (可选)

### 建议
- [ ] 启用 Supabase Row Level Security (RLS)
- [ ] 设置 Vercel 部署保护 (Production Branch)
- [ ] 配置 GitHub Secrets 用于自动部署

---

## 故障排查

### 数据库连接失败
```
错误: Connection refused / Timeout
```
- 检查 `DATABASE_URL` 是否正确
- 确认密码不含特殊字符 (@ 改为 %40)
- 检查 Supabase 项目是否活跃

### CORS 错误
```
错误: CORS policy: No 'Access-Control-Allow-Origin'
```
- 更新 `ALLOWED_ORIGINS` 包含前端域名
- 必须包含 `https://` 前缀
- 重新部署后端

### 404 错误
```
错误: 404 Not Found
```
- 检查 `vercel.json` 配置
- 确认路由规则正确
- 检查 `routes` 配置

---

## 完成! 🎉

你的 NavTools 已成功部署:
- 🌐 前台: `https://your-frontend.vercel.app`
- 🔧 后台: `https://your-frontend.vercel.app/admin/login`
- 📊 API: `https://your-backend.vercel.app`
- 💾 数据库: Supabase PostgreSQL

---

## 后续维护

### 更新代码
```bash
git add .
git commit -m "Update: xxx"
git push origin main
# Vercel 自动部署
```

### 监控
- Vercel Dashboard 查看访问统计
- Supabase Dashboard 查看数据库状态
- 设置 Vercel 告警 (可选)
