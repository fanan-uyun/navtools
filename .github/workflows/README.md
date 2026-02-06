# GitHub Actions Secrets 配置说明

在 GitHub 仓库设置中添加以下 Secrets:

## Vercel 相关 (可选)

| Secret | 获取方式 |
|--------|----------|
| `VERCEL_TOKEN` | Vercel Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel Project Settings → General → Organization ID |
| `VERCEL_BACKEND_PROJECT_ID` | 后端项目 ID |
| `VERCEL_FRONTEND_PROJECT_ID` | 前端项目 ID |

获取 Project ID:
```bash
vercel projects list
# 或查看项目设置页面的 URL
```

## 部署步骤

1. 安装 Vercel CLI:
```bash
npm i -g vercel
```

2. 登录并获取 Token:
```bash
vercel login
vercel tokens create
```

3. 在 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

4. 添加所有 Secrets

5. 推送代码后自动触发部署
