import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rssParser } from '@/lib/rss';
import type { Article } from '@/types';

export async function POST() {
  try {
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('is_active', true);

    if (subError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: subError.message },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No active subscriptions found' },
        { status: 200 }
      );
    }

    let totalArticles = 0;
    let newArticles = 0;

    for (const sub of subscriptions) {
      try {
        const items = await rssParser.parseFeed(sub.rss_url);
        totalArticles += items.length;

        for (const item of items) {
          console.log('处理文章:', item.title);
          console.log('内容长度:', item.content?.length || 0);
          console.log('内容前100字符:', item.content?.substring(0, 100));

          const { data: existing, error: checkError } = await supabaseAdmin
            .from('articles')
            .select('id')
            .eq('link', item.link)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('检查文章失败:', checkError);
          }

          if (!existing) {
            const articleData = {
              title: item.title,
              link: item.link,
              content: item.content || null,
              source: sub.name,
              pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
            };

            console.log('准备插入文章:', {
              title: articleData.title,
              contentLength: articleData.content?.length || 0,
              hasContent: !!articleData.content,
            });

            const { error: insertError } = await supabaseAdmin
              .from('articles')
              .insert(articleData);

            if (insertError) {
              console.error('插入文章失败:', insertError);
            } else {
              newArticles++;
              console.log('✅ 已插入:', item.title);
            }
          } else {
            console.log('⏭️ 文章已存在，跳过');
          }
        }
      } catch (error) {
        console.error(`Failed to fetch from ${sub.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fetched ${totalArticles} articles from ${subscriptions.length} subscriptions`,
      statistics: {
        subscriptions: subscriptions.length,
        totalArticles,
        newArticles,
      },
    });
  } catch (error) {
    console.error('Error in fetch-articles API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
