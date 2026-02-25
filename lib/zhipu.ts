/**
 * 智谱 AI (ZhipuAI / ChatGLM) 服务
 * 使用 GLM-4-Flash 免费模型进行文章分析
 */

export interface ArticleAnalysis {
  summary: string;
  insights: Array<{
    point: string;
    evidence: string;
  }>;
  quotes: string[];
  newConcepts: Array<{
    term: string;
    explanation: string;
  }>;
}

/**
 * 调用智谱 AI API
 */
async function callZhipuAPI(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.ZHIPU_API_KEY;

  if (!apiKey) {
    throw new Error('未设置 ZHIPU_API_KEY');
  }

  // 智谱 API 端点
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages,
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`智谱 API 调用失败: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

/**
 * 使用智谱 AI 分析公众号文章
 */
export async function analyzeArticle(
  title: string,
  content: string
): Promise<ArticleAnalysis> {
  if (!content || content.length < 100) {
    throw new Error('文章内容太短，无法分析');
  }

  try {
    const response = await callZhipuAPI([
      {
        role: 'user',
        content: `请分析以下公众号文章，并严格按照 JSON 格式输出分析结果。

文章标题：${title}

文章内容：
${content.substring(0, 15000)}

请按以下 JSON 格式输出（不要输出任何其他文字，直接输出 JSON）：
{
  "summary": "100-200字的摘要，概括文章核心内容和价值",
  "insights": [
    {
      "point": "核心观点（一句话）",
      "evidence": "支撑论据（50-100字）"
    }
  ],
  "quotes": ["金句1", "金句2"],
  "newConcepts": [
    {
      "term": "新概念或术语",
      "explanation": "解释说明"
    }
  ]
}

分析原则：
1. insights 数组包含文章的3-5个核心观点，按重要性排序
2. quotes 提取原文中最有洞察力的3-5个金句，必须是原话
3. newConcepts 提取文章中的新兴概念、专业术语或关键概念
4. 如果文章质量低或内容空洞，在 summary 中如实说明

请直接输出 JSON，不要包含任何其他文字或标记。`,
      },
    ]);

    const analysisText = response.choices[0]?.message?.content || '';

    // 清理可能的 markdown 代码块标记
    let jsonStr = analysisText.trim();

    // 移除可能的 ```json 和 ``` 标记
    jsonStr = jsonStr.replace(/^```json\s*/i, '');
    jsonStr = jsonStr.replace(/^```\s*/i, '');
    jsonStr = jsonStr.replace(/\s*```$/, '');

    // 解析 JSON
    const analysis = JSON.parse(jsonStr) as ArticleAnalysis;

    return analysis;
  } catch (error) {
    console.error('智谱 AI 调用失败:', error);

    // 返回一个默认的分析结果
    return {
      summary: 'AI 分析失败，无法生成摘要',
      insights: [
        {
          point: '分析失败',
          evidence: '智谱 AI 调用出现错误，请检查 API Key 或稍后重试',
        },
      ],
      quotes: [],
      newConcepts: [],
    };
  }
}

/**
 * 批量分析文章（带并发控制）
 */
export async function analyzeArticlesBatch(
  articles: Array<{ title: string; content: string }>,
  concurrency: number = 3
): Promise<ArticleAnalysis[]> {
  const results: ArticleAnalysis[] = [];
  const chunks: Array<Array<{ title: string; content: string; index: number }>> = [];

  // 将文章分块，每块大小为 concurrency
  for (let i = 0; i < articles.length; i += concurrency) {
    const chunk = articles
      .slice(i, i + concurrency)
      .map((article, idx) => ({ ...article, index: i + idx }));
    chunks.push(chunk);
  }

  // 依次处理每个块
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    console.log(`正在处理第 ${chunkIndex + 1}/${chunks.length} 批文章...`);

    const chunkResults = await Promise.all(
      chunk.map(async (article) => {
        try {
          const analysis = await analyzeArticle(article.title, article.content);
          return { index: article.index, analysis };
        } catch (error) {
          console.error(`分析文章失败: ${article.title}`, error);
          return {
            index: article.index,
            analysis: {
              summary: '分析失败',
              insights: [{ point: '错误', evidence: String(error) }],
              quotes: [],
              newConcepts: [],
            },
          };
        }
      })
    );

    // 按原始顺序添加结果
    chunkResults
      .sort((a, b) => a.index - b.index)
      .forEach((result) => results.push(result.analysis));
  }

  return results;
}
