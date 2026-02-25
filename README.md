# 微信公众号文章 AI 摘要系统

> 自动抓取订阅的公众号文章，使用 AI 提炼核心观点，推送结果到飞书多维表格，打造高效的知识管理系统。

## ✨ 特点

- 📰 **自动抓取**：从 WeWe RSS 订阅源自动抓取公众号文章
- 🤖 **AI 分析**：使用智谱 AI (GLM-4-Flash) 自动分析文章，提炼核心观点、金句和新概念
- 🚀 **飞书集成**：一键将分析结果推送到飞书多维表格，建立知识库
- 💾 **本地数据库**：基于 SQLite 的本地数据存储，完全掌控数据
- 🎨 **优雅界面**：温暖的褐色系配色，优雅的中文排版
- 📱 **响应式设计**：支持桌面和移动设备

## 🛠️ 技术栈

- **前端框架**：Next.js 15 (App Router)
- **样式方案**：Tailwind CSS
- **数据库**：SQLite (better-sqlite3) - 本地数据库
- **RSS 解析**：自定义解析器
- **AI 引擎**：智谱 AI GLM-4-Flash (完全免费)
- **飞书集成**：飞书开放平台 API

## 📋 系统架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  WeWe RSS   │────▶│  Next.js    │────▶│   SQLite    │
│ (抓取文章)   │     │  (Web应用)   │     │  (本地存储)  │
│ 部署在服务器  │     │              │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │智谱 AI   │  │飞书多维表格│  │  Web UI  │
     │(AI分析)  │  │(知识沉淀)  │  │(展示界面) │
     └──────────┘  └──────────┘  └──────────┘
```

## 🚀 快速开始

### 前置要求

- Node.js 18+
- WeWe RSS 服务器（用于抓取公众号文章）
- 智谱 AI API Key（免费，从 https://open.bigmodel.cn/ 获取）
- 飞书账号（可选，用于推送数据到多维表格）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/wechat-digest.git
cd wechat-digest
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 并创建 `.env.local`：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的配置：

```bash
# WeWe RSS 配置
WEWE_RSS_BASE_URL=http://YOUR_SERVER_IP:4000

# 智谱 AI 配置（免费）
ZHIPU_API_KEY=your_zhipu_api_key

# 飞书配置（可选）
FEISHU_APP_ID=your_feishu_app_id
FEISHU_APP_SECRET=your_feishu_app_secret
FEISHU_BITABLE_APP_TOKEN=your_bitable_app_token
FEISHU_TABLE_ID=your_table_id
```

**获取配置信息**：
- **智谱 AI Key**: 访问 https://open.bigmodel.cn/ 注册并获取
- **飞书配置**: 参考 [FEISHU_SETUP.md](./FEISHU_SETUP.md)

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 使用方法

### 1. 添加 WeWe RSS 订阅源

```bash
# 使用便捷脚本添加订阅
./scripts/add-sub.sh "公众号名称" "RSS地址"

# 示例
./scripts/add-sub.sh "极客公园" "http://139.199.206.225:4000/feeds/MP_WXS_xxx"
```

**获取 RSS 地址**：
1. 访问你的 WeWe RSS (如 http://139.199.206.225:4000)
2. 微信读书扫码登录
3. 添加公众号
4. 复制 RSS 订阅地址

### 2. 抓取文章

```bash
./scripts/fetch.sh
```

### 3. AI 分析并推送飞书

```bash
./scripts/analyze-and-push.sh
```

该脚本会：
- 从数据库获取未分析的文章
- 使用智谱 AI 进行分析
- 保存分析结果到数据库
- 推送到飞书多维表格

### 4. 查看分析结果

**方式 1：Web 界面**
- 访问 http://localhost:3000

**方式 2：命令行**
```bash
# 查看所有文章
npx tsx scripts/view-db.ts articles

# 查看某篇文章的分析
npx tsx scripts/view-db.ts analysis 1
```

**方式 3：SQLite Viewer**
- 安装 VSCode 插件 `SQLite Viewer`
- 打开 `data/wechat-digest.db`
- 查看 `articles` 表的 `analysis` 列

## 📁 项目结构

```
wechat-digest/
├── app/                         # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── fetch-articles/        # 抓取文章 API
│   │   ├── analyze-and-push/      # 分析和推送 API
│   │   └── subscriptions/         # 订阅管理 API
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
├── components/                   # React 组件
│   ├── ArticleCard.tsx
│   └── ArticleList.tsx
├── lib/                          # 工具库
│   ├── rss.ts                    # RSS 解析器
│   ├── sqlite.ts                 # SQLite 数据库服务
│   ├── zhipu.ts                  # 智谱 AI 服务
│   └── feishu.ts                 # 飞书 API 服务
├── scripts/                      # 便捷脚本
│   ├── fetch.sh                  # 抓取文章
│   ├── analyze-and-push.sh       # 分析和推送
│   ├── add-sub.sh                # 添加订阅
│   ├── view-db.ts                # 查看数据库
│   └── push-to-feishu.ts         # 推送到飞书
├── types/                        # TypeScript 类型
│   └── index.ts
├── docs/                         # 文档
│   ├── WEWE_RSS_SETUP.md         # WeWe RSS 设置
│   ├── ZHIPU_SETUP.md            # 智谱 AI 配置
│   └── FEISHU_QUICK_START.md     # 飞书配置指南
├── .env.local.example             # 环境变量示例
└── .env.local                    # 环境变量（不提交）
```

## 💾 数据库结构

### subscriptions 表（订阅源）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| name | TEXT | 公众号名称 |
| rss_url | TEXT | RSS 订阅地址 |
| is_active | INTEGER | 是否启用 (0/1) |
| created_at | TEXT | 创建时间 |

### articles 表（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| title | TEXT | 文章标题 |
| link | TEXT | 文章链接（唯一） |
| content | TEXT | 文章内容 |
| source | TEXT | 公众号名称 |
| pub_date | TEXT | 发布时间 |
| analysis | TEXT | AI 分析结果（JSON） |
| feishu_pushed | INTEGER | 是否已推送到飞书 |
| feishu_record_id | TEXT | 飞书记录 ID |
| feishu_pushed_at | TEXT | 飞书推送时间 |
| created_at | TEXT | 创建时间 |

## 🧪 测试脚本

```bash
# 测试智谱 AI 配置
npx tsx scripts/test-zhipu-direct.ts

# 测试飞书连接
npx tsx scripts/test-feishu-simple.ts

# 获取飞书 table_id
npx tsx scripts/get-feishu-table-id.ts
```

## 📚 详细文档

- [WeWe RSS 部署指南](./docs/WEWE_RSS_SETUP.md)
- [智谱 AI 配置指南](./ZHIPU_SETUP.md)
- [飞书多维表格配置](./docs/FEISHU_QUICK_START.md)
- [本地数据库使用指南](./LOCAL_DATABASE_GUIDE.md)

## 💰 费用说明

| 项目 | 月费用 |
|------|--------|
| WeWe RSS 服务器 | ¥30-50 |
| SQLite 本地数据库 | ¥0（免费） |
| 智谱 AI GLM-4-Flash | ¥0（免费） |
| 飞书开放平台 | ¥0（免费额度） |
| Claude Code | 已包含在订阅中 |
| **合计** | **约 ¥30-50/月** |

## 🔧 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 抓取文章
./scripts/fetch.sh

# 分析并推送
./scripts/analyze-and-push.sh

# 查看数据库
npx tsx scripts/view-db.ts
```

## ⚠️ 注意事项

1. **WeWe RSS 登录状态**：微信读书登录会过期，需定期检查并重新登录
2. **抓取频率**：不要太频繁抓取，避免被限制
3. **API 密钥安全**：`.env.local` 不要提交到 Git
4. **数据库备份**：定期备份 `data/wechat-digest.db` 文件

## 📝 更新日志

### v2.0.0 (最新)

- ✅ 迁移到 SQLite 本地数据库
- ✅ 集成智谱 AI (GLM-4-Flash) 完全免费
- ✅ 集成飞书多维表格
- ✅ 完整的命令行工具链

### v1.0.0

- ✅ WeWe RSS 集成
- ✅ Supabase 云数据库
- ✅ 基础 Web 界面

## 📄 License

MIT

## 🙏 致谢

- [WeWe RSS](https://github.com/cooderl/wewe-rss) - 公众号 RSS 生成器
- [Next.js](https://nextjs.org/) - React 框架
- [SQLite](https://www.sqlite.org/) - 轻量级数据库
- [智谱 AI](https://open.bigmodel.cn/) - AI 模型服务
- [飞书开放平台](https://open.feishu.cn/) - 企业协作平台
- [Claude Code](https://claude.ai/claude-code) - AI 编程助手
