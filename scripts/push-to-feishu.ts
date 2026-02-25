/**
 * 推送已分析的文章到飞书多维表格
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// 加载环境变量
const envPath = join(process.cwd(), '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !key.startsWith('#')) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  console.error('无法读取 .env.local 文件');
}

import { getArticles, updateArticle } from '../lib/sqlite';
import { addRecordsToBitable, formatAnalysisForFeishu } from '../lib/feishu';

async function pushAnalyzedArticlesToFeishu() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 推送已分析文章到飞书多维表格');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 获取已分析但未推送的文章
  const articles = getArticles({
    analyzed: true,
    limit: 50,
    orderBy: 'pub_date',
    order: 'DESC',
  });

  if (articles.length === 0) {
    console.log('❌ 没有已分析的文章\n');
    console.log('💡 请先运行: ./scripts/analyze-and-push.sh');
    return;
  }

  console.log(`找到 ${articles.length} 篇已分析的文章\n`);

  // 过滤出未推送到飞书的文章
  const unpublishedArticles = articles.filter((a) => !a.feishu_pushed);

  if (unpublishedArticles.length === 0) {
    console.log('✅ 所有文章都已推送到飞书\n');
    return;
  }

  console.log(`准备推送 ${unpublishedArticles.length} 篇文章...\n`);

  // 准备推送的数据
  const feishuRecords = unpublishedArticles.map((article) => {
    const analysis = article.analysis;
    const formatted = formatAnalysisForFeishu(analysis);

    return {
      title: article.title,
      link: article.link || '',
      source: article.source || '',
      pub_date: article.pub_date || new Date().toISOString(),
      ...formatted,
    };
  });

  // 批量添加到飞书
  console.log('正在推送到飞书多维表格...\n');
  const result = await addRecordsToBitable(feishuRecords);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 推送结果');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`✅ 成功: ${result.success} 条`);
  console.log(`❌ 失败: ${result.failed} 条`);

  if (result.errors.length > 0) {
    console.log('\n错误详情:');
    result.errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err}`);
    });
  }

  // 更新已推送的状态
  if (result.success > 0) {
    console.log('\n更新数据库推送状态...\n');

    for (let i = 0; i < result.success && i < unpublishedArticles.length; i++) {
      const article = unpublishedArticles[i];
      updateArticle(article.id, {
        feishu_pushed: true,
        feishu_pushed_at: new Date().toISOString(),
      });
      console.log(`✅ ${article.title.substring(0, 30)}...`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💡 在飞书中查看:');
  console.log('   https://u0vocx8xrmg.feishu.cn/base/P8yJbQMtLag9IysQK3mcbRcFnMc\n');
}

pushAnalyzedArticlesToFeishu();
