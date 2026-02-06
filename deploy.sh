#!/bin/bash
# NavTools - 自动部署脚本
# 需要环境变量: GITHUB_TOKEN, VERCEL_TOKEN, VERCEL_TEAM_ID(可选)

set -e

echo "=========================================="
echo "  NavTools 自动部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查环境变量
check_env() {
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}错误: 缺少 GITHUB_TOKEN 环境变量${NC}"
        echo "请在 https://github.com/settings/tokens 创建 Personal Access Token"
        echo "需要权限: repo, workflow"
        exit 1
    fi

    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${RED}错误: 缺少 VERCEL_TOKEN 环境变量${NC}"
        echo "请在 https://vercel.com/account/tokens 创建 Token"
        exit 1
    fi

    echo -e "${GREEN}✓ 环境变量检查通过${NC}"
}

# 创建 GitHub 仓库
create_github_repo() {
    echo ""
    echo "步骤 1/4: 创建 GitHub 仓库..."
    
    REPO_NAME=${1:-"navtools"}
    
    # 检查仓库是否已存在
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${YELLOW}⚠ 仓库 $GITHUB_USERNAME/$REPO_NAME 已存在${NC}"
        return 0
    fi
    
    # 创建仓库
    curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -d "{\"name\":\"$REPO_NAME\",\"description\":\"NavTools - 实用工具导航平台\",\"private\":false,\"auto_init\":false}" \
        "https://api.github.com/user/repos" > /dev/null
    
    echo -e "${GREEN}✓ GitHub 仓库创建成功: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
}

# 推送代码到 GitHub
push_code() {
    echo ""
    echo "步骤 2/4: 推送代码到 GitHub..."
    
    REPO_NAME=${1:-"navtools"}
    
    # 配置 git
    git config user.name "NavTools Deploy" || true
    git config user.email "deploy@navtools.local" || true
    
    # 初始化 git (如果没有)
    if [ ! -d ".git" ]; then
        git init
    fi
    
    # 添加远程仓库
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    
    # 提交并推送
    git add .
    git commit -m "Initial commit: NavTools v1.0" || echo -e "${YELLOW}⚠ 没有新变更需要提交${NC}"
    git branch -M main
    git push -u origin main --force
    
    echo -e "${GREEN}✓ 代码推送成功${NC}"
}

# 创建 Vercel 项目
setup_vercel() {
    echo ""
    echo "步骤 3/4: 创建 Vercel 项目..."
    
    REPO_NAME=${1:-"navtools"}
    
    # 安装 Vercel CLI (如果没有)
    if ! command -v vercel &> /dev/null; then
        echo "安装 Vercel CLI..."
        npm install -g vercel
    fi
    
    # 创建后端项目
    echo "创建后端项目..."
    cd backend
    
    # 创建 vercel.json 如果不存在
    if [ ! -f "vercel.json" ]; then
        echo '{"version":2,"builds":[{"src":"main.py","use":"@vercel/python"}],"routes":[{"src":"/(.*)","dest":"main.py"}]}' > vercel.json
    fi
    
    # 链接并部署
    vercel --token "$VERCEL_TOKEN" --confirm --name "navtools-backend" --scope "$VERCEL_TEAM_ID" 2>/dev/null || \
    vercel --token "$VERCEL_TOKEN" --confirm --name "navtools-backend"
    
    cd ..
    
    # 创建前端项目
    echo "创建前端项目..."
    cd frontend
    
    # 创建 vercel.json 如果不存在
    if [ ! -f "vercel.json" ]; then
        echo '{"version":2,"name":"navtools-frontend","builds":[{"src":"package.json","use":"@vercel/static-build","config":{"distDir":"dist"}}],"routes":[{"src":"/(.*)","dest":"/index.html"}]}' > vercel.json
    fi
    
    vercel --token "$VERCEL_TOKEN" --confirm --name "navtools-frontend" --scope "$VERCEL_TEAM_ID" 2>/dev/null || \
    vercel --token "$VERCEL_TOKEN" --confirm --name "navtools-frontend"
    
    cd ..
    
    echo -e "${GREEN}✓ Vercel 项目创建成功${NC}"
}

# 设置 GitHub Secrets
setup_github_secrets() {
    echo ""
    echo "步骤 4/4: 配置 GitHub Secrets..."
    
    REPO_NAME=${1:-"navtools"}
    
    # 设置 Secrets
    curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/actions/secrets/VERCEL_TOKEN" \
        -d "{\"encrypted_value\":\"$VERCEL_TOKEN\",\"key_id\":\"$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/actions/secrets/public-key | grep -o '"key_id":"[^"]*' | cut -d'"' -f4)\"}" > /dev/null 2>&1 || true
    
    echo -e "${YELLOW}⚠ 请手动在 GitHub 仓库设置中添加以下 Secrets:${NC}"
    echo "  - VERCEL_TOKEN: $VERCEL_TOKEN"
    echo "  - VERCEL_ORG_ID: 你的 Vercel Team ID (如果有)"
    echo "  - VERCEL_BACKEND_PROJECT_ID: 后端项目 ID"
    echo "  - VERCEL_FRONTEND_PROJECT_ID: 前端项目 ID"
    echo ""
    echo -e "${GREEN}✓ 部署配置完成${NC}"
}

# 主函数
main() {
    # 获取参数
    REPO_NAME=${1:-"navtools"}
    GITHUB_USERNAME=${2:-$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*' | cut -d'"' -f4)}
    
    if [ -z "$GITHUB_USERNAME" ]; then
        echo -e "${RED}错误: 无法获取 GitHub 用户名${NC}"
        echo "请手动指定: ./deploy.sh [repo_name] [github_username]"
        exit 1
    fi
    
    export GITHUB_USERNAME
    
    echo "仓库名: $REPO_NAME"
    echo "GitHub 用户: $GITHUB_USERNAME"
    echo ""
    
    # 执行步骤
    check_env
    create_github_repo "$REPO_NAME"
    push_code "$REPO_NAME"
    setup_vercel "$REPO_NAME"
    setup_github_secrets "$REPO_NAME"
    
    echo ""
    echo "=========================================="
    echo -e "${GREEN}  NavTools 部署完成!${NC}"
    echo "=========================================="
    echo ""
    echo "下一步:"
    echo "1. 访问 https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "2. 在 GitHub Secrets 中添加数据库连接字符串"
    echo "3. 在 Vercel Dashboard 中配置环境变量"
    echo "4. 推送代码触发自动部署"
    echo ""
}

# 运行
main "$@"
