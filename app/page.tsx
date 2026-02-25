import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';
import ArticleList from '@/components/ArticleList';

async function getArticles(): Promise<Article[]> {
  try {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('pub_date', { ascending: false })
      .limit(50);

    return data || [];
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <header style={{ marginBottom: '48px', borderBottom: '1px solid #EFEBE9', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#5D4037', marginBottom: '4px' }}>
                公众号文章 AI 摘要
              </h1>
              <p style={{ fontSize: '14px', color: '#BCAAA4' }}>智能聚合 · 深度阅读</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', backgroundColor: '#F7F7F5' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', animation: 'pulse 2s infinite' }}></div>
              <span style={{ fontSize: '14px', color: '#8D6E63' }}>
                {articles.length} 篇文章
              </span>
            </div>
          </div>
        </header>

        <main>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#5D4037', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '4px', height: '24px', borderRadius: '2px', backgroundColor: '#8D6E63' }}></span>
              最新文章
            </h2>
          </div>

          <ArticleList articles={articles} />
        </main>

        <footer style={{ marginTop: '80px', paddingTop: '32px', borderTop: '1px solid #EFEBE9', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#BCAAA4' }}>
            © 2024 公众号文章 AI 摘要 · 由 Claude Code 驱动
          </p>
        </footer>
      </div>
    </div>
  );
}
