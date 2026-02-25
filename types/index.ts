export interface Subscription {
  id: string;
  name: string;
  rss_url: string;
  is_active: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  link: string;
  content: string | null;
  source: string | null;
  pub_date: string | null;
  analysis: ArticleAnalysis | null;
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
