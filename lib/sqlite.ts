/**
 * SQLite 本地数据库服务
 * 使用 better-sqlite3 实现轻量级本地数据存储
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// 数据库文件路径
const DB_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DB_DIR, 'wechat-digest.db');

// 确保数据目录存在
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化数据库表
function initDatabase() {
  // 订阅表
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rss_url TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 文章表
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      link TEXT NOT NULL UNIQUE,
      content TEXT,
      source TEXT,
      pub_date DATETIME,
      analysis TEXT,  -- JSON 字符串
      feishu_pushed INTEGER DEFAULT 0,
      feishu_record_id TEXT,
      feishu_pushed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON articles(pub_date DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
    CREATE INDEX IF NOT EXISTS idx_articles_feishu_pushed ON articles(feishu_pushed);
  `);

  console.log('✅ SQLite 数据库初始化完成');
  console.log('📁 数据库路径:', DB_PATH);
}

// 初始化数据库
initDatabase();

// ==================== 订阅相关操作 ====================

export interface Subscription {
  id: string;
  name: string;
  rss_url: string;
  is_active: boolean;
  created_at: string;
}

export function getActiveSubscriptions(): Subscription[] {
  const stmt = db.prepare(`
    SELECT * FROM subscriptions
    WHERE is_active = 1
    ORDER BY name
  `);
  return stmt.all() as Subscription[];
}

export function addSubscription(sub: Omit<Subscription, 'id' | 'created_at'>): Subscription {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO subscriptions (id, name, rss_url, is_active, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, sub.name, sub.rss_url, sub.is_active ? 1 : 0, now);

  return { id, ...sub, created_at: now };
}

export function updateSubscription(id: string, updates: Partial<Subscription>): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.rss_url !== undefined) {
    fields.push('rss_url = ?');
    values.push(updates.rss_url);
  }
  if (updates.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.is_active ? 1 : 0);
  }

  if (fields.length === 0) return;

  values.push(id);
  const stmt = db.prepare(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deleteSubscription(id: string): void {
  const stmt = db.prepare('DELETE FROM subscriptions WHERE id = ?');
  stmt.run(id);
}

// ==================== 文章相关操作 ====================

export interface Article {
  id: string;
  title: string;
  link: string;
  content: string | null;
  source: string | null;
  pub_date: string | null;
  analysis: any;  // 解析后的对象
  feishu_pushed: boolean;
  feishu_record_id: string | null;
  feishu_pushed_at: string | null;
  created_at: string;
}

export interface ArticleAnalysis {
  summary: string;
  insights: Array<{
    point: string;
    evidence: string;
  }>;
  quotes: string[];
  newConcepts: Array<{
    term: string;
    explanation: string;
  }>;
}

export function getArticles(options: {
  limit?: number;
  offset?: number;
  source?: string;
  analyzed?: boolean;
  orderBy?: 'pub_date' | 'created_at';
  order?: 'DESC' | 'ASC';
} = {}): Article[] {
  const {
    limit = 50,
    offset = 0,
    source,
    analyzed,
    orderBy = 'pub_date',
    order = 'DESC',
  } = options;

  let sql = 'SELECT * FROM articles WHERE 1=1';
  const params: any[] = [];

  if (source) {
    sql += ' AND source = ?';
    params.push(source);
  }

  if (analyzed !== undefined) {
    sql += analyzed ? ' AND analysis IS NOT NULL' : ' AND analysis IS NULL';
  }

  sql += ` ORDER BY ${orderBy} ${order}`;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as any[];

  // 解析 analysis JSON
  return rows.map(row => ({
    ...row,
    is_active: Boolean(row.is_active),
    feishu_pushed: Boolean(row.feishu_pushed),
    analysis: row.analysis ? JSON.parse(row.analysis) : null,
  }));
}

export function getArticleById(id: string): Article | null {
  const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    ...row,
    is_active: Boolean(row.is_active),
    feishu_pushed: Boolean(row.feishu_pushed),
    analysis: row.analysis ? JSON.parse(row.analysis) : null,
  };
}

export function getArticleByLink(link: string): Article | null {
  const stmt = db.prepare('SELECT * FROM articles WHERE link = ?');
  const row = stmt.get(link) as any;

  if (!row) return null;

  return {
    ...row,
    is_active: Boolean(row.is_active),
    feishu_pushed: Boolean(row.feishu_pushed),
    analysis: row.analysis ? JSON.parse(row.analysis) : null,
  };
}

export function addArticle(article: Omit<Article, 'id' | 'created_at'>): Article {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO articles (
      id, title, link, content, source, pub_date, analysis,
      feishu_pushed, feishu_record_id, feishu_pushed_at, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    article.title,
    article.link,
    article.content,
    article.source,
    article.pub_date,
    article.analysis ? JSON.stringify(article.analysis) : null,
    article.feishu_pushed ? 1 : 0,
    article.feishu_record_id,
    article.feishu_pushed_at,
    now
  );

  return { id, ...article, created_at: now };
}

export function updateArticle(id: string, updates: Partial<Article>): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.analysis !== undefined) {
    fields.push('analysis = ?');
    values.push(updates.analysis ? JSON.stringify(updates.analysis) : null);
  }
  if (updates.feishu_pushed !== undefined) {
    fields.push('feishu_pushed = ?');
    values.push(updates.feishu_pushed ? 1 : 0);
  }
  if (updates.feishu_record_id !== undefined) {
    fields.push('feishu_record_id = ?');
    values.push(updates.feishu_record_id);
  }
  if (updates.feishu_pushed_at !== undefined) {
    fields.push('feishu_pushed_at = ?');
    values.push(updates.feishu_pushed_at);
  }

  if (fields.length === 0) return;

  values.push(id);
  const stmt = db.prepare(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function getArticlesCount(options: { source?: string; analyzed?: boolean } = {}): number {
  let sql = 'SELECT COUNT(*) as count FROM articles WHERE 1=1';
  const params: any[] = [];

  if (options.source) {
    sql += ' AND source = ?';
    params.push(options.source);
  }

  if (options.analyzed !== undefined) {
    sql += options.analyzed ? ' AND analysis IS NOT NULL' : ' AND analysis IS NULL';
  }

  const stmt = db.prepare(sql);
  const result = stmt.get(...params) as { count: number };
  return result.count;
}

export function getSources(): string[] {
  const stmt = db.prepare(`
    SELECT DISTINCT source
    FROM articles
    WHERE source IS NOT NULL
    ORDER BY source
  `);
  const rows = stmt.all() as { source: string }[];
  return rows.map(r => r.source);
}

// ==================== 工具函数 ====================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function getDatabaseInfo() {
  const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
  const subscriptionCount = db.prepare('SELECT COUNT(*) as count FROM subscriptions').get() as { count: number };
  const analyzedCount = db.prepare("SELECT COUNT(*) as count FROM articles WHERE analysis IS NOT NULL").get() as { count: number };

  return {
    path: DB_PATH,
    articles: articleCount.count,
    subscriptions: subscriptionCount.count,
    analyzed: analyzedCount.count,
    unanalyzed: articleCount.count - analyzedCount.count,
  };
}

export function closeDatabase(): void {
  db.close();
}

// 导出数据库实例（用于高级操作）
export { db };
