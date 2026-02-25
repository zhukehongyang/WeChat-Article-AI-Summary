import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "公众号文章 AI 摘要",
  description: "智能聚合，深度阅读 - 用 AI 提炼公众号核心观点",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
