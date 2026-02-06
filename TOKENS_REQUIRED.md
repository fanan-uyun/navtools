# NavTools - Token 权限申请清单

## 需要的 Token 列表

### 1. GitHub Personal Access Token (必需)

**用途**: 创建仓库、推送代码、配置 Secrets

**申请步骤**:
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 设置:
   - **Note**: NavTools Deploy
   - **Expiration**: 1 year (推荐)
   - **Scopes**: 
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)

4. 点击 "Generate token"
5. **立即复制保存** (⚠️ 只显示一次!)

**格式**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 2. Vercel Token (必需)

**用途**: 部署前后端服务

**申请步骤**:
1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 设置:
   - **Name**: NavTools Deploy
4. 点击 "Create"
5. **立即复制保存**

**格式**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 3. Supabase 数据库连接字符串 (必需)

**用途**: 生产环境数据库

**申请步骤**:
1. 访问 https://supabase.com
2. 使用 GitHub 登录
3. New Project → 创建项目
4. 进入项目 → Settings → Database
5. 复制 **URI** 格式连接字符串

**格式**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## 使用方法

### 方式一: 交互式部署

```bash
cd NavTools

# 设置环境变量
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export VERCEL_TOKEN="xxxxxxxxxxxx"

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 方式二: 手动提供给我

你可以直接发送:
1. `GITHUB_TOKEN=ghp_...`
2. `VERCEL_TOKEN=...`
3. `SUPABASE_URL=postgresql://...`

我会执行自动化部署。

---

## 部署后访问地址

部署完成后，你将获得:
- 前台: `https://navtools-frontend-xxxx.vercel.app`
- 后台: `https://navtools-frontend-xxxx.vercel.app/admin/login`
- API: `https://navtools-backend-xxxx.vercel.app`

默认账号: **admin** / **Admin@123**

---

## 安全提示

⚠️ **重要**:
- Token 相当于密码，请妥善保管
- 建议设置 1 年过期，到期前续期
- 如 Token 泄露，立即在 GitHub/Vercel 撤销并重新生成
- 生产环境数据库密码请使用强密码

---

## 权限说明

### GitHub Token 权限详解

| 权限 | 用途 |
|------|------|
| `repo` | 创建/删除仓库、推送代码、管理 Issues |
| `workflow` | 更新 GitHub Actions 工作流文件 |

### Vercel Token 权限

- 部署项目
- 管理环境变量
- 查看部署日志

---

## 验证 Token 有效性

### 验证 GitHub Token
```bash
curl -H "Authorization: token ghp_xxxx" https://api.github.com/user
curl -H "Authorization: token ghp_xxxx" -X GET https://api.github.com/user/repos
```

### 验证 Vercel Token
```bash
npx vercel@latest whoami --token=xxxx
```

---

## 下一步

提供 Token 后，我将:
1. ✅ 创建 GitHub 仓库
2. ✅ 推送代码
3. ✅ 部署后端到 Vercel
4. ✅ 部署前端到 Vercel
5. ✅ 配置环境变量
6. ✅ 设置 GitHub Actions 自动部署

完成后你将收到:
- GitHub 仓库链接
- 前端访问地址
- 后台管理地址
- API 文档地址
