
import Parser from 'rss-parser';

const parser = new Parser();

export async function fetchLatestNews(feedUrls: string[]) {
  const allNews = [];
  
  console.log('📡 Checking RSS Feeds...');
  
  for (const url of feedUrls) {
    try {
      const feed = await parser.parseURL(url);
      // Get items from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentItems = feed.items.filter(item => 
        item.pubDate && new Date(item.pubDate) > oneDayAgo
      );

      console.log(`   - ${url}: Found ${recentItems.length} new items`);
      allNews.push(...recentItems);
    } catch (error) {
      console.error(`   ❌ Error fetching ${url}:`, error);
    }
  }
  return allNews;
}
