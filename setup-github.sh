#!/bin/bash
# NavTools - GitHub 仓库创建和代码推送脚本
# 需要: GITHUB_TOKEN 环境变量

set -e

REPO_NAME=${1:-"navtools"}
GITHUB_USERNAME=${2:-""}

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "  NavTools - GitHub 仓库初始化"
echo "=========================================="
echo ""

# 检查 Token
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}错误: 缺少 GITHUB_TOKEN 环境变量${NC}"
    exit 1
fi

# 获取用户名
if [ -z "$GITHUB_USERNAME" ]; then
    echo "获取 GitHub 用户名..."
    GITHUB_USERNAME=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/user | grep -o '"login":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}错误: 无法获取 GitHub 用户名，请手动指定${NC}"
    exit 1
fi

echo "仓库名: $REPO_NAME"
echo "用户名: $GITHUB_USERNAME"
echo ""

# 创建仓库
echo "创建 GitHub 仓库..."
RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"NavTools - 实用工具导航平台\",\"private\":false,\"auto_init\":false,\"gitignore_template\":\"Python\",\"license_template\":\"mit\"}" \
    "https://api.github.com/user/repos")

if echo "$RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}仓库已存在，继续推送代码...${NC}"
elif echo "$RESPONSE" | grep -q '"id":'; then
    echo -e "${GREEN}✓ 仓库创建成功${NC}"
else
    echo -e "${RED}创建仓库失败:${NC}"
    echo "$RESPONSE"
    exit 1
fi

# 配置 git
echo "配置 Git..."
git config user.name "NavTools Deploy" 2>/dev/null || true
git config user.email "deploy@navtools.local" 2>/dev/null || true

# 初始化 git
if [ ! -d ".git" ]; then
    git init
fi

# 添加远程仓库
git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 提交代码
echo "提交代码..."
git add .
git commit -m "Initial commit: NavTools v1.0" || echo -e "${YELLOW}没有新变更${NC}"

# 推送
echo "推送到 GitHub..."
git branch -M main
git push -u origin main --force

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  完成!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "下一步: 部署到 Vercel"
echo "1. 访问 https://vercel.com"
echo "2. 导入 GitHub 仓库"
echo "3. 按 DEPLOY.md 配置环境变量"
