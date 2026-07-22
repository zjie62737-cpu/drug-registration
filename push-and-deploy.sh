#!/bin/bash
echo "=== 药品注册系统 - 推送到GitHub ==="
export HTTPS_PROXY="http://127.0.0.1:1082"
export https_proxy="http://127.0.0.1:1082"

echo "输入GitHub用户名 (或直接回车跳过):"
read GH_USER
echo "输入GitHub Personal Access Token (在 github.com/settings/tokens 创建):"
read -s GH_TOKEN

# Push with credentials
git push "https://${GH_USER}:${GH_TOKEN}@github.com/zjie62737-cpu/drug-registration.git" main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 推送成功！现在部署到Render获得永久域名："
  echo "1. 打开 https://render.com"
  echo "2. 注册并连接GitHub"
  echo "3. New Web Service → 选择 drug-registration 仓库"
  echo "4. Build Command: npm run install:all && npm run build && cd server && npx prisma generate && npx prisma migrate deploy"
  echo "5. Start Command: bash start.sh"
  echo "6. 部署完成后你会获得 https://xxx.onrender.com 永久域名"
fi
