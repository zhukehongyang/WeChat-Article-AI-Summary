/**
 * 飞书多维表格服务
 * 使用直接 fetch API 调用飞书开放平台
 */

/**
 * 获取飞书访问令牌
 */
async function getAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID!;
  const appSecret = process.env.FEISHU_APP_SECRET!;

  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`获取飞书 Token 失败: ${data.msg}`);
  }

  return data.tenant_access_token;
}

/**
 * 向飞书多维表格添加记录
 */
export async function addRecordToBitable(
  article: {
    title: string;
    link: string;
    source: string;
    pub_date: string | null;
    summary: string;
    insights: string;
    quotes: string;
    newConcepts: string;
  },
  options: {
    appToken?: string;
    tableId?: string;
  } = {}
): Promise<{ success: boolean; recordId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken();

    // 从环境变量或参数中获取表格信息
    const appToken = options.appToken || process.env.FEISHU_BITABLE_APP_TOKEN;
    const tableId = options.tableId || process.env.FEISHU_TABLE_ID;

    if (!appToken || !tableId) {
      throw new Error(
        '缺少飞书多维表格配置，请设置 FEISHU_BITABLE_APP_TOKEN 和 FEISHU_TABLE_ID'
      );
    }

    // 构造记录数据
    const recordData = {
      fields: {
        title: article.title,
        link: { link: article.link }, // 飞书的 URL 类型字段需要对象格式
        source: article.source,
        summary: article.summary,
        insights: article.insights,
        quotes: article.quotes,
        new_concepts: article.newConcepts,
      },
    };

    // 调用飞书 API 添加记录
    const response = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      }
    );

    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      console.error('飞书 API 响应失败:', data);
      return {
        success: false,
        error: `API 调用失败: ${JSON.stringify(data)}`,
      };
    }

    return {
      success: true,
      recordId: data.data.record.record_id,
    };
  } catch (error) {
    console.error('添加记录到飞书多维表格失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 批量添加记录到飞书多维表格
 */
export async function addRecordsToBitable(
  articles: Array<{
    title: string;
    link: string;
    source: string;
    pub_date: string | null;
    summary: string;
    insights: string;
    quotes: string;
    newConcepts: string;
  }>,
  options: {
    appToken?: string;
    tableId?: string;
  } = {}
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    const accessToken = await getAccessToken();
    const appToken = options.appToken || process.env.FEISHU_BITABLE_APP_TOKEN;
    const tableId = options.tableId || process.env.FEISHU_TABLE_ID;

    if (!appToken || !tableId) {
      throw new Error(
        '缺少飞书多维表格配置，请设置 FEISHU_BITABLE_APP_TOKEN 和 FEISHU_TABLE_ID'
      );
    }

    // 批量添加，每次最多 500 条
    const batchSize = 500;
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);

      const records = batch.map((article) => ({
        fields: {
          title: article.title,
          link: { link: article.link }, // 飞书的 URL 类型字段需要对象格式
          source: article.source,
          summary: article.summary,
          insights: article.insights,
          quotes: article.quotes,
          new_concepts: article.newConcepts,
        },
      }));

      const response = await fetch(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.code === 0) {
        results.success += batch.length;
      } else {
        results.failed += batch.length;
        results.errors.push(`批量添加失败: ${JSON.stringify(data)}`);
      }
    }
  } catch (error) {
    results.failed += articles.length;
    results.errors.push(error instanceof Error ? error.message : String(error));
  }

  return results;
}

/**
 * 检查记录是否已存在（根据链接）
 */
export async function checkRecordExists(
  link: string,
  options: {
    appToken?: string;
    tableId?: string;
  } = {}
): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    const appToken = options.appToken || process.env.FEISHU_BITABLE_APP_TOKEN;
    const tableId = options.tableId || process.env.FEISHU_TABLE_ID;

    if (!appToken || !tableId) {
      return false;
    }

    const response = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          filter: `CurrentValue.[link] = "${link}"`,
        },
      }
    );

    const data = await response.json();

    if (data.code === 0 && data.data?.items && data.data.items.length > 0) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('检查记录存在性失败:', error);
    return false;
  }
}

/**
 * 格式化分析结果为字符串
 */
export function formatAnalysisForFeishu(analysis: {
  summary: string;
  insights: Array<{ point: string; evidence: string }>;
  quotes: string[];
  newConcepts: Array<{ term: string; explanation: string }>;
}): {
  summary: string;
  insights: string;
  quotes: string;
  newConcepts: string;
} {
  return {
    summary: analysis.summary,
    insights: analysis.insights
      .map((insight, i) => `${i + 1}. ${insight.point}\n   ${insight.evidence}`)
      .join('\n\n'),
    quotes: analysis.quotes.map((quote, i) => `${i + 1}. ${quote}`).join('\n'),
    newConcepts: analysis.newConcepts
      .map((concept, i) => `${i + 1}. ${concept.term}: ${concept.explanation}`)
      .join('\n'),
  };
}
