# 飞书多维表格集成配置指南

本文档介绍如何配置飞书多维表格，将文章分析结果自动推送。

## 步骤 1: 创建飞书自建应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 登录后，点击「创建自建应用」
3. 填写应用信息：
   - 应用名称：如「公众号文章助手」
   - 应用描述：自动推送公众号文章分析
4. 创建完成后，记录以下信息：
   - `App ID`: 在应用概览页面
   - `App Secret`: 在应用概览页面，点击查看

将这些信息填入 `.env.local`:

```bash
FEISHU_APP_ID=cli_xxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
```

## 步骤 2: 申请权限

在飞书开放平台的应用配置中：

1. 进入「权限管理」
2. 搜索并开通以下权限：
   - `bitable:app` - 查看、评论和编辑多维表格
   - `bitable:app:readonly` - 只读权限（如果只查看）
   - `bitable:app:write` - 写入权限

3. 进入「版本管理与发布」
4. 点击「创建版本」
5. 填写版本信息后点击「申请发布」
6. 在「发布管理」中，选择「全员可用」并发布

## 步骤 3: 创建多维表格

1. 在飞书中创建一个新的多维表格
2. 添加以下字段（字段名称可以根据需要调整）：

| 字段名称 | 字段类型 | 说明 |
|---------|---------|------|
| title | 文本 | 文章标题 |
| link | URL | 文章链接 |
| source | 文本 | 公众号名称 |
| pub_date | 日期 | 发布时间 |
| summary | 多行文本 | AI 摘要 |
| insights | 多行文本 | 核心观点 |
| quotes | 多行文本 | 金句 |
| new_concepts | 多行文本 | 新概念 |
| created_at | 日期 | 创建时间 |

## 步骤 4: 获取表格配置

### 方法 1: 从 URL 获取（推荐）

1. 打开创建的多维表格
2. 从浏览器 URL 中获取 `app_token`:
   ```
   https://xxx.feishu.cn/base/{app_token}/app{app_token}
   ```
   记录 `{app_token}` 部分

### 方法 2: 使用 API 获取

```bash
# 获取访问令牌
curl -X POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "your_app_id",
    "app_secret": "your_app_secret"
  }'

# 获取所有数据表
curl -X GET "https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables" \
  -H "Authorization: Bearer {tenant_access_token}"
```

从响应中找到你创建的表格的 `table_id`。

将获取的配置填入 `.env.local`:

```bash
FEISHU_BITABLE_APP_TOKEN=your_app_token
FEISHU_TABLE_ID=your_table_id
```

## 步骤 5: 测试连接

运行测试脚本验证配置：

```bash
curl -X POST http://localhost:3000/api/analyze-and-push \
  -H "Content-Type: application/json" \
  -d '{"concurrency": 1, "pushToFeishu": true}'
```

或使用便捷脚本：

```bash
./scripts/analyze-and-push.sh
```

## 常见问题

### 1. 权限不足错误

确保：
- 已在开放平台申请了相关权限
- 已发布应用并设置为「全员可用」
- 有权限访问目标多维表格

### 2. 找不到 table_id

使用飞书开放平台的 API Explorer 或运行上述 API 命令获取。

### 3. 字段映射错误

确保代码中的字段名称与飞书表格中的字段名称一致。如果不一致，需要修改 `lib/feishu.ts` 中的 `fields` 映射。

## 字段映射说明

在 `lib/feishu.ts` 中，代码使用了以下字段映射：

```typescript
{
  title: article.title,           // → title 字段
  link: article.link,             // → link 字段
  source: article.source,         // → source 字段
  pub_date: timestamp,            // → pub_date 字段（时间戳）
  summary: article.summary,       // → summary 字段
  insights: article.insights,     // → insights 字段
  quotes: article.quotes,         // → quotes 字段
  new_concepts: article.newConcepts, // → new_concepts 字段
  created_at: timestamp,          // → created_at 字段
}
```

如果飞书表格使用不同的字段名称，请修改上述映射。

## 安全提示

- 不要将 `.env.local` 提交到 Git
- 定期轮换 App Secret
- 限制应用的访问范围和权限
