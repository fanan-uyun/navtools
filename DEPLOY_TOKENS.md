# NavTools - 自动部署指南

## 需要的 Token 和权限

### 1. GitHub Personal Access Token

**获取地址**: https://github.com/settings/tokens

**需要权限**:
- ✅ `repo` - 完全控制仓库
- ✅ `workflow` - 更新 GitHub Actions 工作流

**创建步骤**:
1. 点击 "Generate new token (classic)"
2. 选择过期时间 (建议 1年)
3. 勾选 `repo` 和 `workflow`
4. 点击 "Generate token"
5. **立即复制并保存 Token** (只显示一次!)

---

### 2. Vercel Token

**获取地址**: https://vercel.com/account/tokens

**创建步骤**:
1. 点击 "Create Token"
2. 名称: `NavTools Deploy`
3. 点击 "Create"
4. **立即复制并保存 Token**

---

### 3. 可选: Vercel Team ID

如果使用 Vercel Team:
- 在 Vercel Dashboard URL 中查看: `vercel.com/team-name/...`
- Team ID 是 team-name 部分

---

## 使用方法

### 方式一: 交互式部署 (推荐)

```bash
# 1. 进入项目目录
cd NavTools

# 2. 设置环境变量
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export VERCEL_TOKEN="xxxxxxxxxxxx"

# 3. 运行部署脚本
chmod +x deploy.sh
./deploy.sh

# 或者指定仓库名和用户名
./deploy.sh navtools your-username
```

### 方式二: 手动步骤

#### 1. 创建 GitHub 仓库
```bash
# 创建仓库
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{"name":"navtools","description":"NavTools - 实用工具导航平台","private":false}'
```

#### 2. 推送代码
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/navtools.git
git push -u origin main
```

#### 3. 部署到 Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署后端
cd backend
vercel --name navtools-backend

# 部署前端
cd ../frontend
vercel --name navtools-frontend
```

---

## GitHub Actions 自动部署

项目已包含 `.github/workflows/deploy.yml`，配置 Secrets 后自动部署:

| Secret | 说明 | 获取方式 |
|--------|------|----------|
| `VERCEL_TOKEN` | Vercel Token | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel Team ID | 可选，个人用户留空 |
| `VERCEL_BACKEND_PROJECT_ID` | 后端项目 ID | Vercel 项目设置 |
| `VERCEL_FRONTEND_PROJECT_ID` | 前端项目 ID | Vercel 项目设置 |

---

## Vercel 环境变量配置

### 后端项目
```
DATABASE_URL=postgresql+asyncpg://postgres:xxx@db.xxx.supabase.co:5432/postgres
SECRET_KEY=your-secret-key-32-chars-min
DEBUG=false
ALLOWED_ORIGINS=https://your-frontend.vercel.app
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=Admin@123
```

### 前端项目
```
VITE_API_BASE_URL=https://your-backend.vercel.app
```

---

## 故障排查

### GitHub 认证失败
```
错误: Bad credentials
解决: 检查 GITHUB_TOKEN 是否正确，是否有过期
```

### Vercel 部署失败
```
错误: Project not found
解决: 确保 VERCEL_TOKEN 有权限，或手动创建项目
```

### 数据库连接失败
```
错误: could not translate host name
解决: 检查 DATABASE_URL 格式，确保使用 postgresql+asyncpg://
```

---

## 部署后检查

```bash
# 测试后端
curl https://your-backend.vercel.app/health
# 应返回: {"status":"ok"}

# 测试前端
# 访问 https://your-frontend.vercel.app
```
