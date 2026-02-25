# 飞书多维表格配置指南

## 🎯 目标

将文章分析结果自动推送到飞书多维表格，建立知识库。

## 📋 前置准备

- 飞书账号（免费）
- 能访问飞书开放平台 https://open.feishu.cn/

## 步骤 1: 创建飞书自建应用

### 1.1 访问飞书开放平台

1. 打开 https://open.feishu.cn/
2. 登录你的飞书账号

### 1.2 创建自建应用

1. 点击右上角 **"创建自建应用"**
2. 填写应用信息：
   - **应用名称**: 公众号文章助手（或自定义）
   - **应用描述**: 自动推送公众号文章分析结果
3. 点击 **"创建"**

### 1.3 记录凭证

创建成功后，在应用概览页面记录：
- **App ID**: `cli_xxxxxxxxxxxxx`
- **App Secret**: 点击查看按钮复制

## 步骤 2: 申请权限

### 2.1 进入权限管理

在应用页面，点击左侧菜单 **"权限管理"**

### 2.2 搜索并开通权限

在搜索框中搜索以下权限并开通：

| 权限名称 | 说明 |
|---------|------|
| `bitable:app` | 查看、评论和编辑多维表格 |
| `bitable:app:readonly` | 只读权限 |
| `bitable:app:write` | 写入权限 |

或者直接开通 **"多维表格"** 分组下的所有权限。

### 2.3 发布应用

1. 点击左侧菜单 **"版本管理与发布"**
2. 点击 **"创建版本"**
3. 填写版本号（如 1.0.0）和描述
4. 点击 **"申请发布"**
5. 在发布管理页面，选择 **"全员可用"**
6. 点击 **"发布"**

## 步骤 3: 创建多维表格

### 3.1 创建新表格

1. 在飞书中，点击 **"工作台"** → **"多维表格"**
2. 点击 **"新建表格"**
3. 选择 **"空白表格"**
4. 输入表格名称，如 **"公众号文章知识库"**
5. 点击 **"创建"**

### 3.2 添加字段

在表格中添加以下字段（点击 **"+"** 添加新列）：

| 字段名称 | 字段类型 | 必填 | 说明 |
|---------|---------|------|------|
| title | 文本 | ✅ | 文章标题 |
| link | URL | ✅ | 文章链接 |
| source | 文本 | ✅ | 公众号名称 |
| pub_date | 日期 | - | 发布时间 |
| summary | 多行文本 | - | AI 摘要 |
| insights | 多行文本 | - | 核心观点 |
| quotes | 多行文本 | - | 金句 |
| new_concepts | 多行文本 | - | 新概念 |
| created_at | 日期 | - | 创建时间 |

**提示**:
- 如果找不到"多行文本"，可以使用"文本"类型
- "日期"类型可以选择"日期时间"格式

## 步骤 4: 获取表格配置

### 4.1 获取 app_token

1. 打开创建的多维表格
2. 从浏览器地址栏复制 URL
3. URL 格式：`https://xxx.feishu.cn/base/{app_token}/app{app_token}`
4. 复制 `{app_token}` 部分

**示例**:
- URL: `https://bytetrance.feishu.cn/base/bascnxxxxxx/appxxxxxxxxx`
- app_token: `bascnxxxxxx`

### 4.2 获取 table_id

**方法 1: 使用 API（推荐）**

我会提供一个脚本来获取：

```bash
npx tsx scripts/get-feishu-table-id.ts
```

**方法 2: 从 URL 获取（部分情况）**

如果 URL 中包含 `/tbl/`，后面的就是 table_id。

**方法 3: 使用飞书开放平台 API Explorer**

1. 访问 https://open.feishu.cn/api-explorer/
2. 选择 API: `bitable.v1.appTable.list`
3. 填入 app_token 和 access_token
4. 查看返回结果中的 table_id

## 步骤 5: 配置环境变量

将获取到的配置添加到 `.env.local` 文件：

```bash
# 飞书配置
FEISHU_APP_ID=cli_xxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
FEISHU_BITABLE_APP_TOKEN=bascnxxxxxx
FEISHU_TABLE_ID=tblxxxxxxxxxx
```

## 步骤 6: 测试连接

运行测试脚本验证配置：

```bash
npx tsx scripts/test-feishu.ts
```

如果配置正确，会显示成功的测试数据推送。

## 步骤 7: 开始使用

配置完成后，运行分析和推送脚本：

```bash
./scripts/analyze-and-push.sh
```

分析结果会自动推送到飞书多维表格！

## 常见问题

### Q1: 提示权限不足

**解决**:
1. 检查权限是否已开通
2. 确认应用已发布并设置为"全员可用"
3. 重新生成 access_token

### Q2: 找不到 table_id

**解决**: 使用我提供的脚本自动获取：
```bash
npx tsx scripts/get-feishu-table-id.ts
```

### Q3: 字段映射错误

**解决**: 确保表格中的字段名称与代码中的一致：
- title
- link
- source
- pub_date
- summary
- insights
- quotes
- new_concepts
- created_at

如果使用了不同的字段名称，需要修改 `lib/feishu.ts` 中的字段映射。

## 下一步

配置完成后：
1. 运行 `./scripts/fetch.sh` 抓取新文章
2. 运行 `./scripts/analyze-and-push.sh` 分析并推送
3. 在飞书中查看分析结果

需要帮助？随时告诉我！
