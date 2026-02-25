/**
 * 快速查看本地数据库内容
 * 使用方法: npx tsx scripts/view-db.ts
 */

import { getDatabaseInfo, getArticles, getActiveSubscriptions } from '../lib/sqlite';

function displayArticles() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📰 文章列表（最近 10 篇）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const articles = getArticles({ limit: 10, orderBy: 'pub_date', order: 'DESC' });

  if (articles.length === 0) {
    console.log('  📭 暂无文章\n');
    console.log('💡 提示: 运行 ./scripts/fetch.sh 抓取文章');
    return;
  }

  articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   来源: ${article.source || '未知'}`);
    console.log(`   发布: ${article.pub_date || '未知'}`);
    console.log(`   分析: ${article.analysis ? '✅ 已分析' : '❌ 未分析'}`);
    console.log(`   飞书: ${article.feishu_pushed ? '✅ 已推送' : '⏳ 未推送'}`);
    console.log('');
  });

  console.log(`总计: ${articles.length} 篇文章`);
}

function displaySubscriptions() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 订阅源列表');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const subs = getActiveSubscriptions();

  if (subs.length === 0) {
    console.log('  📭 暂无订阅\n');
    console.log('💡 提示: 使用 API 添加订阅');
    console.log('curl -X POST http://localhost:3000/api/subscriptions \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"name":"公众号名","rss_url":"RSS地址"}\'');
    return;
  }

  subs.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.name}`);
    console.log(`   RSS: ${sub.rss_url}`);
    console.log(`   状态: ${sub.is_active ? '✅ 启用' : '❌ 禁用'}`);
    console.log('');
  });

  console.log(`总计: ${subs.length} 个订阅源`);
}

function displayAnalysis(articleId: number) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 AI 分析结果');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const articles = getArticles({ limit: 1, offset: articleId - 1 });

  if (articles.length === 0) {
    console.log('❌ 文章不存在');
    return;
  }

  const article = articles[0];

  if (!article.analysis) {
    console.log('  ❌ 此文章尚未分析\n');
    console.log('💡 提示: 运行 ./scripts/analyze-and-push.sh 进行分析');
    return;
  }

  console.log(`📰 文章: ${article.title}\n`);

  const analysis = article.analysis;

  console.log('📝 摘要:');
  console.log(analysis.summary);
  console.log('');

  console.log('💡 核心观点:');
  analysis.insights?.forEach((insight: any, i: number) => {
    console.log(`  ${i + 1}. ${insight.point}`);
    console.log(`     ${insight.evidence}`);
  });
  console.log('');

  console.log('💎 金句:');
  analysis.quotes?.forEach((quote: string, i: number) => {
    console.log(`  ${i + 1}. ${quote}`);
  });
  console.log('');

  if (analysis.newConcepts?.length > 0) {
    console.log('📚 新概念:');
    analysis.newConcepts.forEach((concept: any, i: number) => {
      console.log(`  ${i + 1}. ${concept.term}: ${concept.explanation}`);
    });
    console.log('');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 本地数据库查看器');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 显示数据库信息
  const info = getDatabaseInfo();
  console.log(`\n📁 数据库: ${info.path}`);
  console.log(`📈 统计:`);
  console.log(`   - 订阅源: ${info.subscriptions} 个`);
  console.log(`   - 文章总数: ${info.articles} 篇`);
  console.log(`   - 已分析: ${info.analyzed} 篇`);
  console.log(`   - 待分析: ${info.unanalyzed} 篇`);

  if (command === 'articles' || !command) {
    displayArticles();
  }

  if (command === 'subs' || command === 'subscriptions') {
    displaySubscriptions();
  }

  if (command === 'analysis' && args[1]) {
    displayAnalysis(parseInt(args[1]));
  }

  if (!command || command === 'help') {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 使用方法:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('  npx tsx scripts/view-db.ts              # 查看文章列表');
    console.log('  npx tsx scripts/view-db.ts articles     # 查看文章列表');
    console.log('  npx tsx scripts/view-db.ts subs         # 查看订阅源');
    console.log('  npx tsx scripts/view-db.ts analysis 1   # 查看第1篇文章的分析\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
