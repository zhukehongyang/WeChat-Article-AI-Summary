#!/bin/bash

# 获取脚本所在目录的父目录（项目根目录）
cd "$(dirname "$0")/.."

echo "📰 正在抓取公众号文章..."

# 调用 API 抓取文章
response=$(curl -s -X POST http://localhost:3000/api/fetch-articles)

# 显示结果
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"

echo ""
echo "✅ 完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "💡 提示：访问 http://localhost:3000 查看文章列表"
