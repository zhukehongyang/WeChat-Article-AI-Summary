#!/bin/bash

# 添加 WeWe RSS 订阅源脚本
#
# 使用方法:
#   ./scripts/add-sub.sh "公众号名称" "WeWe RSS订阅地址"
#
# 示例:
#   ./scripts/add-sub.sh "公众号名称" "http://139.199.206.225:4000/feeds/MP_WXS_1432156401"

set -e

cd "$(dirname "$0")/.."

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ $# -ne 2 ]; then
  echo -e "${RED}❌ 使用方法: $0 \"公众号名称\" \"WeWe RSS订阅地址\"${NC}"
  echo ""
  echo "示例:"
  echo "  $0 \"公众号名称\" \"http://139.199.206.225:4000/feeds/MP_WXS_1432156401\""
  echo ""
  echo "💡 获取 WeWe RSS 订阅地址:"
  echo "  1. 访问 http://139.199.206.225:4000"
  echo "  2. 微信读书扫码登录"
  echo "  3. 添加公众号"
  echo "  4. 复制 RSS 订阅地址（格式：http://139.199.206.225:4000/feeds/MP_WXS_xxx）"
  exit 1
fi

NAME=$1
RSS_URL=$2

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}添加订阅源${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo "公众号名称: $NAME"
echo "RSS 地址: $RSS_URL"
echo ""

# 调用 API 添加订阅
RESPONSE=$(curl -s -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"rss_url\": \"$RSS_URL\",
    \"is_active\": true
  }")

# 显示结果
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo -e "${GREEN}✅ 完成！${NC}"
echo ""
echo "💡 下一步: 运行抓取脚本"
echo "   ./scripts/fetch.sh"
