# 智谱 AI (ZhipuAI) 配置指南

本项目使用智谱 AI 的 GLM-4-Flash 免费模型进行文章分析。

## 为什么选择智谱 AI？

- ✅ **完全免费** - GLM-4-Flash 模型免费使用，无额外费用
- ✅ **中文优化** - 专门针对中文场景优化，分析效果更好
- ✅ **稳定可靠** - 国内服务，访问稳定，无需科学上网
- ✅ **简单易用** - API 接口简洁，集成方便

## 快速开始

### 1. 注册账号

访问 [智谱 AI 开放平台](https://open.bigmodel.cn/) 并注册账号。

### 2. 获取 API Key

1. 登录后，进入右上角 **"API Key"** 页面
2. 点击 **"新增 API Key"**
3. 复制生成的 API Key（格式如：`xxxxxxxxxxxxx.xxxxxxxx`）

### 3. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```bash
ZHIPU_API_KEY=你的API_Key
```

### 4. 测试配置

运行测试脚本验证配置是否正确：

```bash
./scripts/test-zhipu-api.sh
```

## 模型说明

### GLM-4-Flash（本项目使用）

- **费用**: 完全免费
- **速度**: 响应快
- **适用场景**: 文本分析、摘要、问答等日常任务
- **限制**: 速率限制为每分钟 20 次请求

### 其他模型（可选）

如果你需要更强的分析能力，可以考虑：

| 模型 | 费用 | 特点 |
|------|------|------|
| GLM-4-Air | 低成本 | 性价比高，适合大多数场景 |
| GLM-4-Plus | 按量计费 | 最强性能，适合复杂任务 |

切换模型：编辑 `lib/zhipu.ts` 文件，将 `model: 'glm-4-flash'` 改为你想要的模型。

## API 使用限制

### GLM-4-Flash 免费额度

- **请求频率**: 每分钟 20 次
- **每日限制**: 根据账号等级有所不同
- **Token 限制**: 单次请求最大 128K tokens

### 速率控制

代码中已实现批量分析和并发控制，默认并发数为 3，可以避免触发速率限制。

如需调整，在调用时修改 `concurrency` 参数：

```typescript
// analyze-and-push/route.ts
const analyses = await analyzeArticlesBatch(
  articles.map((a) => ({ title: a.title, content: a.content || '' })),
  3  // 并发数，可根据需要调整
);
```

## 分析结果格式

智谱 AI 会返回以下结构化的分析结果：

```typescript
{
  "summary": "100-200字的文章摘要",
  "insights": [
    {
      "point": "核心观点",
      "evidence": "支撑论据"
    }
  ],
  "quotes": ["金句1", "金句2"],
  "newConcepts": [
    {
      "term": "新概念",
      "explanation": "解释说明"
    }
  ]
}
```

## 常见问题

### 1. API 调用失败 401

**原因**: API Key 无效或已过期

**解决**:
- 检查 `.env.local` 中的 `ZHIPU_API_KEY` 是否正确
- 确认 API Key 没有过期（长期有效）
- 重新生成一个新的 API Key

### 2. 请求过于频繁 429

**原因**: 超过了速率限制

**解决**:
- 降低并发数（修改 `concurrency` 参数）
- 在请求之间增加延迟
- 考虑升级到付费模型

### 3. 分析结果为空

**原因**:
- 文章内容太短（少于 100 字）
- 文章格式不规范
- API 解析失败

**解决**:
- 确保文章内容完整且足够长
- 检查 API 返回的原始日志
- 尝试调整提示词

### 4. Token 不足

**原因**: 单篇文章太长，超过了模型限制

**解决**:
- 代码已自动截取前 15000 字符
- 如需处理更长文章，考虑分块分析

## 费用说明

| 项目 | 费用 |
|------|------|
| GLM-4-Flash 模型 | **完全免费** |
| API 调用 | 无额外费用 |
| 总计 | **¥0/月** |

## 与其他模型对比

| 特性 | 智谱 GLM-4-Flash | Claude 3.5 Sonnet | GPT-4o-mini |
|------|------------------|-------------------|-------------|
| 费用 | ✅ 免费 | 按量计费 | 按量计费 |
| 中文支持 | ✅ 优秀 | ✅ 优秀 | 一般 |
| 国内访问 | ✅ 无需翻墙 | ❌ 需要代理 | ❌ 需要代理 |
| 速度 | ✅ 快 | 中等 | 中等 |
| 分析质量 | ✅ 良好 | ✅ 优秀 | 良好 |

## 开发调试

### 查看详细日志

在运行分析时，控制台会输出详细日志：

```bash
./scripts/analyze-and-push.sh
```

日志包含：
- 处理进度
- API 调用结果
- Token 使用情况
- 错误信息

### 单独测试一篇文章

创建测试脚本：

```typescript
import { analyzeArticle } from '@/lib/zhipu';

const result = await analyzeArticle('文章标题', '文章内容...');
console.log(result);
```

## 技术支持

- 智谱 AI 文档: https://open.bigmodel.cn/dev/api
- 智谱 AI 社区: https://open.bigmodel.cn/dev/aq
- 项目 Issues: 在 GitHub 提交问题

## 下一步

配置完成后，你可以：

1. ✅ 运行测试: `./scripts/test-zhipu-api.sh`
2. ✅ 分析文章: `./scripts/analyze-and-push.sh`
3. ✅ 推送到飞书: 自动推送分析结果
4. ✅ Web 查看: 访问 http://localhost:3000 查看结果
