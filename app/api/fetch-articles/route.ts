import { NextResponse } from 'next/server';
import { rssParser } from '@/lib/rss';
import {
  getActiveSubscriptions,
  addArticle,
  getArticleByLink,
  getDatabaseInfo,
} from '@/lib/sqlite';

export async function POST() {
  try {
    const subscriptions = getActiveSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscriptions found',
        statistics: {
          subscriptions: 0,
          totalArticles: 0,
          newArticles: 0,
        },
        hint: '请先添加订阅源，使用 POST /api/subscriptions',
      });
    }

    console.log(`开始从 ${subscriptions.length} 个订阅源抓取文章...`);

    let totalArticles = 0;
    let newArticles = 0;

    for (const sub of subscriptions) {
      try {
        console.log(`\n📰 抓取: ${sub.name}`);
        const items = await rssParser.parseFeed(sub.rss_url);
        totalArticles += items.length;
        console.log(`  获取到 ${items.length} 篇文章`);

        for (const item of items) {
          // 检查文章是否已存在
          const existing = getArticleByLink(item.link);

          if (!existing) {
            // 添加新文章
            addArticle({
              title: item.title,
              link: item.link,
              content: item.content || null,
              source: sub.name,
              pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
              analysis: null,
              feishu_pushed: false,
              feishu_record_id: null,
              feishu_pushed_at: null,
            });
            newArticles++;
            console.log(`  ✅ 新文章: ${item.title.substring(0, 40)}...`);
          } else {
            console.log(`  ⏭️  已存在: ${item.title.substring(0, 40)}...`);
          }
        }
      } catch (error) {
        console.error(`❌ 从 ${sub.name} 抓取失败:`, error);
      }
    }

    const dbInfo = getDatabaseInfo();

    return NextResponse.json({
      success: true,
      message: `抓取完成，新增 ${newArticles} 篇文章`,
      statistics: {
        subscriptions: subscriptions.length,
        totalArticles,
        newArticles,
        database: {
          total: dbInfo.articles,
          analyzed: dbInfo.analyzed,
          unanalyzed: dbInfo.unanalyzed,
        },
      },
    });
  } catch (error) {
    console.error('Error in fetch-articles API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
