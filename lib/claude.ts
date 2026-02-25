import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
 * 使用 Claude API 分析公众号文章
 */
export async function analyzeArticle(
  title: string,
  content: string
): Promise<ArticleAnalysis> {
  if (!content || content.length < 100) {
    throw new Error('文章内容太短，无法分析');
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `请分析以下公众号文章，并严格按照 JSON 格式输出分析结果。

文章标题：${title}

文章内容：
${content.substring(0, 15000)}

请按以下 JSON 格式输出（不要输出任何其他文字）：
\`\`\`json
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
\`\`\`

分析原则：
1. insights 数组包含文章的3-5个核心观点，按重要性排序
2. quotes 提取原文中最有洞察力的3-5个金句，必须是原话
3. newConcepts 提取文章中的新兴概念、专业术语或关键概念
4. 如果文章质量低或内容空洞，在 summary 中如实说明`,
        },
      ],
    });

    // 提取回复中的 JSON 内容
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // 尝试提取 JSON 代码块
    const jsonMatch =
      responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
      responseText.match(/```\s*([\s\S]*?)\s*```/);

    let jsonStr = jsonMatch ? jsonMatch[1] : responseText;

    // 清理可能的 markdown 格式
    jsonStr = jsonStr.trim();

    const analysis = JSON.parse(jsonStr) as ArticleAnalysis;

    return analysis;
  } catch (error) {
    console.error('Claude API 调用失败:', error);

    // 返回一个默认的分析结果
    return {
      summary: 'AI 分析失败，无法生成摘要',
      insights: [
        {
          point: '分析失败',
          evidence: 'Claude API 调用出现错误，请检查 API Key 或稍后重试',
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
  const chunks: Array<
    Array<{ title: string; content: string; index: number }>
  > = [];

  // 将文章分块，每块大小为 concurrency
  for (let i = 0; i < articles.length; i += concurrency) {
    const chunk = articles
      .slice(i, i + concurrency)
      .map((article, idx) => ({ ...article, index: i + idx }));
    chunks.push(chunk);
  }

  // 依次处理每个块
  for (const chunk of chunks) {
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
