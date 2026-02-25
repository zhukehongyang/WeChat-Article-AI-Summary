const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'summary', 'description'],
  },
});

async function test() {
  try {
    const feed = await parser.parseURL('http://139.199.206.225:4000/feeds/MP_WXS_3264997043');
    
    console.log('=== RSS 解析结果 ===');
    console.log('文章数量:', feed.items.length);
    
    if (feed.items.length > 0) {
      const item = feed.items[0];
      console.log('\n=== 第一篇文章 ===');
      console.log('标题:', item.title);
      console.log('link:', item.link);
      console.log('pubDate:', item.pubDate);
      console.log('\ncontent 字段存在:', !!item.content);
      console.log('content 长度:', item.content?.length || 0);
      console.log('content 前200字符:', item.content?.substring(0, 200) || '无');
      console.log('\ndescription 字段存在:', !!item.description);
      console.log('description 长度:', item.description?.length || 0);
      console.log('description 前200字符:', item.description?.substring(0, 200) || '无');
      console.log('\nsummary 字段存在:', !!item.summary);
      console.log('summary 长度:', item.summary?.length || 0);
      console.log('summary 前200字符:', item.summary?.substring(0, 200) || '无');
    }
  } catch (error) {
    console.error('错误:', error);
  }
}

test();
