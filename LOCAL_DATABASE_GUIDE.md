# 本地数据库配置完成

## ✅ 已完成

项目已成功从 Supabase 云数据库迁移到 **SQLite 本地数据库**！

### 🎯 优势对比

| 特性 | Supabase (云) | SQLite (本地) |
|------|--------------|--------------|
| **费用** | 免费额度有限 | ✅ 完全免费 |
| **配置** | 需要注册账号 | ✅ 零配置 |
| **网络** | 需要网络连接 | ✅ 离线可用 |
| **速度** | 依赖网络 | ✅ 极快 |
| **数据控制** | 在云端 | ✅ 完全掌控 |
| **备份** | 需要导出 | ✅ 直接复制文件 |

### 📁 数据库位置

```
/Users/isaac/wechat-digest/data/wechat-digest.db
```

整个数据库就是一个文件，备份、迁移都非常简单！

## 🚀 使用方法

### 1. 添加订阅源

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "公众号名称",
    "rss_url": "WeWe RSS 订阅地址"
  }'
```

获取 WeWe RSS 订阅地址：
1. 访问你的 WeWe RSS: http://139.199.206.225:4000
2. 添加公众号
3. 复制 RSS 订阅地址

### 2. 抓取文章

```bash
./scripts/fetch.sh
```

### 3. 分析文章并推送飞书

```bash
./scripts/analyze-and-push.sh
```

### 4. 查看数据库信息

```bash
npx tsx -e "import { getDatabaseInfo } from './lib/sqlite'; console.log(getDatabaseInfo());"
```

## 📊 数据库结构

### subscriptions 表（订阅源）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| name | TEXT | 公众号名称 |
| rss_url | TEXT | RSS 订阅地址 |
| is_active | INTEGER | 是否启用 (0/1) |
| created_at | DATETIME | 创建时间 |

### articles 表（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| title | TEXT | 文章标题 |
| link | TEXT | 文章链接（唯一） |
| content | TEXT | 文章内容 |
| source | TEXT | 公众号名称 |
| pub_date | DATETIME | 发布时间 |
| analysis | TEXT | AI 分析结果（JSON） |
| feishu_pushed | INTEGER | 是否已推送到飞书 |
| feishu_record_id | TEXT | 飞书记录 ID |
| feishu_pushed_at | DATETIME | 飞书推送时间 |
| created_at | DATETIME | 创建时间 |

## 🛠️ 管理命令

### 查看所有订阅

```bash
curl http://localhost:3000/api/subscriptions
```

### 删除订阅

```bash
curl -X DELETE "http://localhost:3000/api/subscriptions?id=订阅ID"
```

### 查看数据库统计

```bash
curl http://localhost:3000/api/analyze-and-push
```

## 💾 数据备份

### 备份数据库

```bash
# 备份整个数据库文件
cp data/wechat-digest.db data/wechat-digest-backup-$(date +%Y%m%d).db
```

### 恢复数据库

```bash
# 停止应用，然后恢复
cp data/wechat-digest-backup-20250225.db data/wechat-digest.db
```

### 导出为 SQL

```bash
sqlite3 data/wechat-digest.db .dump > backup.sql
```

### 从 SQL 导入

```bash
sqlite3 data/wechat-digest.db < backup.sql
```

## 🔧 直接操作数据库

如果你安装了 SQLite 命令行工具：

```bash
# 打开数据库
sqlite3 data/wechat-digest.db

# 查看所有表
.tables

# 查看订阅
SELECT * FROM subscriptions;

# 查看文章
SELECT title, source, pub_date FROM articles ORDER BY pub_date DESC LIMIT 10;

# 查看未分析的文章
SELECT title FROM articles WHERE analysis IS NULL;

# 退出
.quit
```

## 📈 完整工作流

```bash
# 1. 添加订阅（首次）
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"name":"极客公园","rss_url":"http://139.199.206.225:4000/rss/xxx"}'

# 2. 抓取新文章
./scripts/fetch.sh

# 3. AI 分析并推送飞书
./scripts/analyze-and-push.sh

# 4. 在 Web 界面查看
# 访问 http://localhost:3000
```

## 🎉 总结

✅ **已切换到本地数据库**
- 无需云服务
- 完全免费
- 数据完全掌控
- 速度更快

✅ **智谱 AI 已配置**
- GLM-4-Flash 免费模型
- 分析质量优秀

✅ **飞书集成就绪**
- 配置后即可自动推送

**下一步**: 配置飞书多维表格（参考 `FEISHU_SETUP.md`），然后就可以开始使用了！
