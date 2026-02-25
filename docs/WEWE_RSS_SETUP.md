# 添加 WeWe RSS 订阅源指南

## 步骤 1: 访问 WeWe RSS

在浏览器中打开：
```
http://139.199.206.225:4000
```

## 步骤 2: 登录

1. 点击页面上的"微信读书扫码登录"
2. 使用微信扫描二维码
3. 在手机上确认登录

## 步骤 3: 添加公众号

1. 点击"添加订阅"或"添加公众号"
2. 搜索你想要的公众号名称
3. 点击"添加"按钮

推荐添加的公众号（举例）：
- 极客公园
- 36氪
- 虎嗅APP
- 产品思维
- 技术管理

## 步骤 4: 获取 RSS 订阅地址

添加公众号后，在公众号列表中：

1. 找到你添加的公众号
2. 点击"复制链接"或"RSS"按钮
3. 复制 RSS 订阅地址（格式类似）：
   ```
   http://139.199.206.225:4000/rss/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

## 步骤 5: 添加到本地数据库

获取 RSS 地址后，运行以下命令添加订阅：

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "公众号名称",
    "rss_url": "刚才复制的RSS地址"
  }'
```

### 示例

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "极客公园",
    "rss_url": "http://139.199.206.225:4000/rss/你的RSS ID"
  }'
```

## 步骤 6: 抓取文章

添加订阅后，运行抓取脚本：

```bash
./scripts/fetch.sh
```

## 步骤 7: 分析文章

```bash
./scripts/analyze-and-push.sh
```

---

## 快捷脚本

如果你想快速添加多个订阅，可以创建一个脚本：

```bash
#!/bin/bash
# add-subs.sh

curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "极客公园",
    "rss_url": "http://139.199.206.225:4000/rss/你的RSS1"
  }'

curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "36氪",
    "rss_url": "http://139.199.206.225:4000/rss/你的RSS2"
  }'
```

---

## 查看当前订阅

```bash
# 查看 API
curl http://localhost:3000/api/subscriptions

# 或使用查看脚本
npx tsx scripts/view-db.ts subs
```
