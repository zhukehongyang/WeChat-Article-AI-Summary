#!/bin/bash

# 微信公众号文章分析并推送到飞书脚本
#
# 功能：
# 1. 从数据库获取未分析的文章
# 2. 调用 Claude API 进行 AI 分析
# 3. 推送分析结果到飞书多维表格
#
# 使用方法：
# ./scripts/analyze-and-push.sh

set -e

cd "$(dirname "$0")/.."

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}公众号文章 AI 分析 & 飞书推送工具${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 检查开发服务器是否运行
check_server() {
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null
}

# 检查环境变量
check_env() {
  if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}❌ 错误: 未设置 ANTHROPIC_API_KEY${NC}"
    echo "请在 .env.local 中设置 Claude API Key"
    exit 1
  fi

  if [ -z "$FEISHU_APP_ID" ] || [ -z "$FEISHU_APP_SECRET" ]; then
    echo -e "${YELLOW}⚠️  警告: 未设置飞书配置，将跳过飞书推送${NC}"
  fi

  if [ -z "$FEISHU_BITABLE_APP_TOKEN" ] || [ -z "$FEISHU_TABLE_ID" ]; then
    echo -e "${YELLOW}⚠️  警告: 未设置飞书多维表格配置，将跳过飞书推送${NC}"
  fi
}

# 获取统计信息
get_stats() {
  echo -e "${BLUE}📊 获取文章统计...${NC}"
  curl -s http://localhost:3000/api/analyze-and-push | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        stats = data.get('statistics', {})
        print(f'总文章数: {stats.get(\"total\", 0)}')
        print(f'已分析: {stats.get(\"analyzed\", 0)}')
        print(f'待分析: {stats.get(\"unanalyzed\", 0)}')
    else:
        print('获取统计失败')
except:
    print('解析响应失败')
"
  echo ""
}

# 启动开发服务器（如果未运行）
if [ "$(check_server)" != "200" ]; then
  echo -e "${YELLOW}开发服务器未运行，正在启动...${NC}"
  npm run dev &
  DEV_SERVER_PID=$!

  # 等待服务器启动
  echo "等待服务器启动..."
  for i in {1..30}; do
    if [ "$(check_server)" = "200" ]; then
      echo -e "${GREEN}✅ 服务器已启动${NC}"
      break
    fi
    sleep 1
  done

  if [ "$(check_server)" != "200" ]; then
    echo -e "${RED}❌ 服务器启动失败${NC}"
    exit 1
  fi
  echo ""
fi

# 检查环境配置
echo -e "${BLUE}🔍 检查环境配置...${NC}"
check_env
echo ""

# 显示当前统计
get_stats

# 询问是否继续
read -p "是否开始分析和推送？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}已取消${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}🤖 开始 AI 分析并推送到飞书...${NC}"
echo ""

# 调用 API 进行分析和推送
RESPONSE=$(curl -s -X POST http://localhost:3000/api/analyze-and-push \
  -H "Content-Type: application/json" \
  -d '{"concurrency": 3, "pushToFeishu": true}')

# 解析并显示结果
echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        stats = data.get('statistics', {})
        total = stats.get('total', 0)
        analyzed = stats.get('analyzed', 0)
        pushed = stats.get('pushed', 0)
        errors = stats.get('errors', [])

        if total > 0:
            print(f'\033[0;32m✅ 分析完成: {analyzed}/{total} 篇文章\033[0m')
            if pushed > 0:
                print(f'\033[0;32m✅ 飞书推送: {pushed} 条记录\033[0m')
            if errors:
                print(f'\033[0;31m❌ 错误: {len(errors)} 个\033[0m')
                for err in errors[:3]:
                    print(f'   - {err}')
        else:
            print('\033[1;33m⚠️  没有需要分析的文章\033[0m')
    else:
        print(f'\033[0;31m❌ 错误: {data.get(\"error\", \"未知错误\")}\033[0m')
        if 'details' in data:
            print(f'   详情: {data[\"details\"]}')
except Exception as e:
    print(f'\033[0;31m❌ 解析响应失败: {e}\033[0m')
    print('原始响应:')
    print(sys.stdin.read())
"

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}完成时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${GREEN}======================================${NC}"
