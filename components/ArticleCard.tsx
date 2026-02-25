'use client';

import Link from 'next/link';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  index?: number;
}

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const hasAnalysis = !!article.analysis;

  return (
    <Link href={`/article/${article.id}`}>
      <article
        className="card p-6 md:p-8 cursor-pointer group animate-slide-up"
        style={{
          animationDelay: `${index * 0.05}s`,
          opacity: 0,
          animationFillMode: 'forwards'
        }}
      >
        {/* 头部信息 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
              {article.source || 'Unknown'}
            </span>
            {hasAnalysis && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                AI 分析
              </span>
            )}
          </div>
          {article.pub_date && (
            <time className="text-xs text-[var(--color-text-muted)] font-medium">
              {new Date(article.pub_date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </time>
          )}
        </div>

        {/* 标题 */}
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)] mb-4 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors duration-200">
          {article.title}
        </h2>

        {/* AI 摘要 */}
        {hasAnalysis && article.analysis && (
          <div className="relative mb-5 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {article.analysis.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)]">
            {article.content ? `${article.content.length} 字` : '待抓取内容'}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] group-hover:gap-3 transition-all duration-200">
            阅读全文
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}
