'use client';

import { useState } from 'react';

interface CopyButtonProps {
  content: string;
}

export default function CopyButton({ content }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动选择内容复制');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        copied
          ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
          : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-md hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已复制
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          复制正文
        </>
      )}
    </button>
  );
}
