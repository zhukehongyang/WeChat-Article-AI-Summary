# 公众号文章 AI 摘要系统

> 自动抓取订阅的公众号文章，使用 AI 提炼核心观点，打造高效的阅读体验。

## 功能特点

- 📰 **自动抓取**：从 WeWe RSS 订阅源自动抓取公众号文章
- 🤖 **AI 分析**：使用 Claude Code 提炼文章核心观点、金句和新概念
- 🎨 **优雅界面**：温暖的褐色系配色，优雅的中文排版
- 📱 **响应式设计**：支持桌面和移动设备
- 💾 **云端存储**：基于 Supabase 的数据持久化

## 技术栈

- **前端框架**：Next.js 15 (App Router)
- **样式方案**：Tailwind CSS
- **数据库**：Supabase (PostgreSQL)
- **RSS 解析**：自定义解析器
- **AI 引擎**：Claude Code

## 系统架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   WeWe RSS      │────▶│   Next.js App   │────▶│    Supabase     │
│  (公众号抓取)    │     │   (Web 应用)     │     │   (数据存储)     │
│  部署在服务器    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Claude Code   │
                        │  (AI 文章分析)   │
                        └─────────────────┘
```

## 前置要求

在部署此项目之前，你需要准备：

1. **云服务器**（如腾讯云轻量应用服务器）- 用于部署 WeWe RSS
2. **Supabase 账号** - 用于数据存储
3. **Node.js 18+** - 本地开发环境

## 快速开始

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
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
WEWE_RSS_BASE_URL=http://YOUR_SERVER_IP:4000
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署指南

### 部署 WeWe RSS 服务

详细步骤请参考 [WeWe RSS 部署指南](./wewe-rss安装部署指南.md)。

### 配置 Supabase 数据库

1. 创建 Supabase 项目
2. 在 SQL Editor 中执行以下 SQL：

```sql
-- 订阅表
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rss_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文章表
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  content TEXT,
  source TEXT,
  pub_date TIMESTAMPTZ,
  analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_articles_pub_date ON articles(pub_date DESC);
CREATE INDEX idx_articles_source ON articles(source);

-- 开启行级安全策略
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（开发环境）
CREATE POLICY "Enable all access for subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for articles" ON articles FOR ALL USING (true) WITH CHECK (true);
```

### 添加订阅

在 Supabase 的 `subscriptions` 表中添加订阅记录：

| 字段 | 值 |
|------|-----|
| name | 公众号名称 |
| rss_url | WeWe RSS 生成的订阅地址 |
| is_active | true |

## 使用方法

### 抓取文章

```bash
# 使用便捷脚本抓取
./scripts/fetch.sh

# 或直接调用 API
curl -X POST http://localhost:3000/api/fetch-articles
```

### 使用 AI 分析文章

1. 在文章详情页点击"复制正文"
2. 在 Claude Code 中输入 `/wechat-digest`
3. 粘贴文章内容
4. 获得 AI 分析结果

## 项目结构

```
wechat-digest/
├── app/                    # Next.js App Router
│   ├── article/           # 文章详情页
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── CopyButton.tsx
│   ├── api/               # API 路由
│   │   └── fetch-articles/
│   │       └── route.ts
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ArticleCard.tsx
│   └── ArticleList.tsx
├── lib/                  # 工具库
│   ├── rss.ts            # RSS 解析器
│   └── supabase.ts       # Supabase 客户端
├── types/                # TypeScript 类型
│   └── index.ts
├── scripts/              # 便捷脚本
│   └── fetch.sh         # 一键抓取脚本
├── .claude/             # Claude Code 技能
│   └── skills/
│       └── wechat-digest/
│           └── SKILL.md
└── .env.local           # 环境变量（不提交）
```

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 抓取文章
./scripts/fetch.sh
```

## 注意事项

1. **WeWe RSS 登录状态**：微信读书登录会过期，需定期检查并重新登录
2. **抓取频率**：不要太频繁抓取，避免被限制
3. **数据安全**：`.env.local` 不要提交到 Git
4. **文章分析**：使用 Claude Code 分析，无需额外 API 费用

## 费用说明

| 项目 | 月费用 |
|------|--------|
| 腾讯云服务器 | ¥30-50 |
| Supabase | ¥0（免费额度） |
| Claude Code | 已包含在订阅中 |
| **合计** | **约 ¥30-50/月** |

## License

MIT

## 致谢

- [WeWe RSS](https://github.com/cooderl/wewe-rss) - 公众号 RSS 生成器
- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 后端服务
- [Claude Code](https://claude.ai/claude-code) - AI 编程助手
