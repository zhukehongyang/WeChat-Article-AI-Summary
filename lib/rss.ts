export interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  updated?: string;
  content?: string;
}

export class RssParser {
  async parseFeed(feedUrl: string): Promise<RssItem[]> {
    try {
      console.log('开始解析 RSS:', feedUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/atom+xml,application/xml,text/xml,*/*',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('获取到 RSS 内容，长度:', text.length);
      
      return this.parseAtomFeed(text);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`RSS 请求超时: ${feedUrl}`);
      } else {
        console.error(`Failed to parse RSS feed: ${feedUrl}`, error);
      }
      return [];
    }
  }

  private parseAtomFeed(xml: string): RssItem[] {
    const items: RssItem[] = [];
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gis;
    let match;
    let index = 0;
    
    while ((match = entryRegex.exec(xml)) !== null && index < 100) {
      const entryXml = match[1];
      const item = this.parseEntry(entryXml, index);
      if (item) {
        items.push(item);
      }
      index++;
    }
    
    console.log(`总共解析到 ${items.length} 篇文章`);
    return items;
  }

  private parseEntry(entryXml: string, index: number): RssItem | null {
    const titleMatch = entryXml.match(/<title[^>]*>(.*?)<\/title>/is);
    const title = this.decodeCData(titleMatch?.[1] || '');

    const linkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["']/is);
    const link = linkMatch?.[1] || '';

    const dateMatch = entryXml.match(/<(?:updated|pubDate)[^>]*>(.*?)<\/\1>/is);
    const pubDate = dateMatch?.[1];

    const contentMatch = entryXml.match(/<content[^>]*>(.*?)<\/content>/is);
    let content = this.decodeCData(contentMatch?.[1] || '');

    if (content) {
      content = this.extractArticleContent(content);
    }

    return { title, link, pubDate, content };
  }

  private decodeCData(text: string): string {
    text = text.replace(/<!\[CDATA\[/g, '');
    text = text.replace(/\]\]>/g, '');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    return text;
  }

  private extractArticleContent(html: string): string {
    if (!html) return '';

    // 提取 body 内容
    if (html.includes('<!DOCTYPE') || html.includes('<html')) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/is);
      if (bodyMatch && bodyMatch[1]) {
        html = bodyMatch[1];
      }
    }

    // 尝试提取微信文章的主要内容区域
    const contentSelectors = [
      /<div[^>]*id="js_content"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="rich_media_content"[^>]*>([\s\S]*?)<\/div>/i,
    ];

    for (const selector of contentSelectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        html = match[1];
        break;
      }
    }

    // 转换为格式化的纯文本（保留段落结构）
    html = this.htmlToFormattedText(html);

    return html.trim();
  }

  private htmlToFormattedText(html: string): string {
    // 移除 script、style、link、meta、noscript
    html = html.replace(/<(script|style|link|meta|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
    html = html.replace(/<(script|style|link|meta|noscript)\b[^>]*\/>/gi, '');
    
    // 移除注释
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    
    // 将块级元素转换为换行
    html = html.replace(/<\/(div|p|section|article|h[1-6]|li|tr)>/gi, '\n');
    html = html.replace(/<(br|hr)\s*\/?>/gi, '\n');
    
    // 移除所有剩余的 HTML 标签
    html = html.replace(/<[^>]+>/g, '');
    
    // 解码 HTML 实体
    html = html.replace(/&nbsp;/g, ' ');
    html = html.replace(/&quot;/g, '"');
    html = html.replace(/&apos;/g, "'");
    html = html.replace(/&lt;/g, '<');
    html = html.replace(/&gt;/g, '>');
    html = html.replace(/&amp;/g, '&');
    
    // 清理空白和换行
    html = html.replace(/[ \t]+/g, ' ');  // 多个空格合并为一个
    html = html.replace(/\n[ \t]+\n/g, '\n');  // 只有空格的行删除
    html = html.replace(/\n{3,}/g, '\n\n');  // 多个换行合并为两个
    
    return html.trim();
  }
}

export const rssParser = new RssParser();
