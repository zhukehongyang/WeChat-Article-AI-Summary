import { NextResponse } from 'next/server';
import { analyzeArticlesBatch } from '@/lib/zhipu';
import { addRecordsToBitable, formatAnalysisForFeishu } from '@/lib/feishu';
import {
  getArticles,
  updateArticle,
  getDatabaseInfo,
} from '@/lib/sqlite';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { concurrency = 3, pushToFeishu = true } = body;

    // 获取未分析的文章
    const articles = getArticles({
      analyzed: false,
      limit: 20,
      orderBy: 'pub_date',
      order: 'DESC',
    });

    if (articles.length === 0) {
      const dbInfo = getDatabaseInfo();
      return NextResponse.json({
        success: true,
        message: '没有需要分析的文章',
        statistics: {
          total: 0,
          analyzed: 0,
          pushed: 0,
          database: {
            total: dbInfo.articles,
            analyzed: dbInfo.analyzed,
            unanalyzed: dbInfo.unanalyzed,
          },
        },
      });
    }

    console.log(`准备分析 ${articles.length} 篇文章...`);

    // 批量分析文章
    const analyses = await analyzeArticlesBatch(
      articles.map((a) => ({ title: a.title, content: a.content || '' })),
      concurrency
    );

    // 更新数据库中的分析结果
    let analyzedCount = 0;
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const analysis = analyses[i];

      updateArticle(article.id, { analysis });
      analyzedCount++;
      console.log(`✅ 已分析并保存: ${article.title}`);
    }

    // 推送到飞书多维表格
    let pushedCount = 0;
    let feishuErrors: string[] = [];

    if (pushToFeishu) {
      console.log('\n开始推送到飞书多维表格...');

      // 准备推送的数据
      const feishuRecords = articles.map((article, index) => {
        const analysis = analyses[index];
        const formatted = formatAnalysisForFeishu(analysis);

        return {
          title: article.title,
          link: article.link,
          source: article.source || '',
          pub_date: article.pub_date,
          ...formatted,
        };
      });

      // 批量添加到飞书
      const result = await addRecordsToBitable(feishuRecords);

      pushedCount = result.success;
      feishuErrors = result.errors;

      // 更新已推送状态
      if (pushedCount > 0) {
        for (let i = 0; i < Math.min(pushedCount, articles.length); i++) {
          updateArticle(articles[i].id, {
            feishu_pushed: true,
            feishu_pushed_at: new Date().toISOString(),
          });
        }
      }

      console.log(`✅ 飞书推送完成: 成功 ${pushedCount} 条, 失败 ${result.failed} 条`);
    }

    const dbInfo = getDatabaseInfo();

    return NextResponse.json({
      success: true,
      message: `分析完成 ${analyzedCount} 篇文章` +
        (pushToFeishu ? `,推送 ${pushedCount} 条到飞书` : ''),
      statistics: {
        total: articles.length,
        analyzed: analyzedCount,
        pushed: pushedCount,
        errors: feishuErrors,
        database: {
          total: dbInfo.articles,
          analyzed: dbInfo.analyzed,
          unanalyzed: dbInfo.unanalyzed,
        },
      },
    });
  } catch (error) {
    console.error('Error in analyze-and-push API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET 请求返回统计信息
export async function GET() {
  try {
    const dbInfo = getDatabaseInfo();
    const sources = [
      '技术管理',
      '产品思维',
      '创业经验',
    ]; // 可以从数据库动态获取

    return NextResponse.json({
      success: true,
      statistics: {
        total: dbInfo.articles,
        analyzed: dbInfo.analyzed,
        unanalyzed: dbInfo.unanalyzed,
        subscriptions: dbInfo.subscriptions,
      },
      database: {
        path: dbInfo.path,
      },
    });
  } catch (error) {
    console.error('Error in analyze-and-push GET:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
