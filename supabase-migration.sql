-- 为飞书同步添加状态字段（可选）
-- 如果需要跟踪哪些文章已推送到飞书，可以添加这些字段

ALTER TABLE articles ADD COLUMN IF NOT EXISTS feishu_pushed BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS feishu_record_id TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS feishu_pushed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_articles_feishu_pushed ON articles(feishu_pushed);
