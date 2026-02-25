import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';
import Link from 'next/link';
import CopyButton from './CopyButton';

async function getArticle(id: string): Promise<Article | null> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
            文章未找到
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6">ID: {id}</p>
          <Link href="/" className="btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const wechatLink = article.link;
  const hasAnalysis = !!article.analysis;

  return (
    <div className="min-h-screen">
      {/* 返回导航 */}
      <nav className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </Link>
        </div>
      </nav>

      {/* 文章内容 */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* 文章头部 */}
        <header className="mb-12 pb-8 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
              {article.source || 'Unknown'}
            </span>
            {article.pub_date && (
              <time className="text-sm text-[var(--color-text-muted)]">
                {new Date(article.pub_date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] leading-tight mb-6">
            {article.title}
          </h1>

          {/* 操作按钮 */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={wechatLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              阅读原文
            </a>
            {article.content && <CopyButton content={article.content} />}
          </div>
        </header>

        {/* AI 分析结果 */}
        {hasAnalysis && article.analysis && (
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI 深度分析</h2>
                <p className="text-sm text-gray-600">由 Claude Code 驱动</p>
              </div>
            </div>

            {/* 摘要 */}
            {article.analysis.summary && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">核心摘要</h3>
                <p className="text-gray-800 leading-relaxed text-lg">
                  {article.analysis.summary}
                </p>
              </div>
            )}

            {/* 核心观点 */}
            {article.analysis.insights && article.analysis.insights.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-4">核心观点</h3>
                <div className="space-y-4">
                  {article.analysis.insights.map((insight, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-xl bg-white/60 backdrop-blur">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-2">{insight.point}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{insight.evidence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 金句 */}
            {article.analysis.quotes && article.analysis.quotes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-4">精彩金句</h3>
                <div className="space-y-3">
                  {article.analysis.quotes.map((quote, index) => (
                    <blockquote key={index} className="p-4 rounded-xl bg-white/60 backdrop-blur border-l-4 border-amber-400">
                      <p className="text-gray-800 italic leading-relaxed">"{quote}"</p>
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

            {/* 新概念 */}
            {article.analysis.newConcepts && article.analysis.newConcepts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-4">新概念</h3>
                <div className="flex flex-wrap gap-3">
                  {article.analysis.newConcepts.map((concept, index) => (
                    <div key={index} className="px-4 py-3 rounded-xl bg-white/60 backdrop-blur border border-amber-200">
                      <span className="font-bold text-amber-700">{concept.term}</span>
                      <span className="text-gray-600 mx-2">·</span>
                      <span className="text-sm text-gray-700">{concept.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 文章正文 */}
        <div className="prose-custom max-w-none">
          <div className="p-8 rounded-2xl bg-white border border-[var(--color-border)] shadow-sm">
            {article.content ? (
              <div className="whitespace-pre-wrap" style={{ maxHeight: '70vh', overflow: 'auto' }}>
                {article.content}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-[var(--color-text-muted)] mb-6">
                  RSS 源未提供文章正文
                </p>
                <a
                  href={wechatLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  跳转到公众号阅读全文 →
                </a>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
