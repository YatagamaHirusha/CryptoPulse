import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function calculateFakeViews(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffHours = diffTime / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  // Deterministic noise based on created timestamp
  const seed = created.getTime();
  const noise = (seed % 1000) / 1000; // 0 to 1
  // Secondary noise for more variety between articles
  const noise2 = ((seed % 777) + (seed % 313)) / 1090; // 0 to 1

  let baseViews = 0;

  if (diffHours < 1) {
    // First hour: 15 to 80 views (quick initial traction)
    baseViews = 15 + diffHours * 65;
  } else if (diffHours < 6) {
    // Hours 1-6: 80 to 350
    const progress = (diffHours - 1) / 5;
    baseViews = 80 + progress * 270;
  } else if (diffHours < 24) {
    // Hours 6-24: 350 to 1200
    const progress = (diffHours - 6) / 18;
    baseViews = 350 + progress * 850;
  } else if (diffDays < 3) {
    // Day 1-3: 1200 to 3500 (viral window)
    const progress = (diffDays - 1) / 2;
    baseViews = 1200 + progress * 2300;
  } else if (diffDays < 7) {
    // Day 3-7: 3500 to 7000
    const progress = (diffDays - 3) / 4;
    baseViews = 3500 + progress * 3500;
  } else if (diffDays < 14) {
    // Week 1-2: 7000 to 12500
    const progress = (diffDays - 7) / 7;
    baseViews = 7000 + progress * 5500;
  } else if (diffDays < 30) {
    // Week 2-4: 12500 to 22000
    const progress = (diffDays - 14) / 16;
    baseViews = 12500 + progress * 9500;
  } else if (diffDays < 90) {
    // Month 1-3: 22000 to 45000
    const progress = (diffDays - 30) / 60;
    baseViews = 22000 + progress * 23000;
  } else if (diffDays < 180) {
    // Month 3-6: 45000 to 65000
    const progress = (diffDays - 90) / 90;
    baseViews = 45000 + progress * 20000;
  } else {
    // After 6 months: Slow steady growth (+50-150/day)
    baseViews = 65000 + (diffDays - 180) * (50 + noise2 * 100);
  }

  // Add deterministic variation so articles don't all show the same count
  // ±8% variation based on the seed for natural feel
  const variation = baseViews * 0.08 * (noise - 0.5) * 2; // -8% to +8%
  // Add small secondary variation
  const microVariation = baseViews * 0.03 * noise2;
  
  return Math.max(0, Math.floor(baseViews + variation + microVariation));
}

async function backfillViews() {
  console.log('🚀 Starting view count backfill...');

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, created_at, view_count, title');

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`Found ${articles.length} articles.`);

  let updatedCount = 0;

  for (const article of articles) {
    const fakeViews = calculateFakeViews(article.created_at);
    
    // We want to ensure the DB has AT LEAST the fake view count.
    // If the DB already has more (real views), we might want to keep it or add to it?
    // The user said "set view count... and update all of them... and keep more views".
    // "keep more views" might mean "if it has more, keep it" or "make it have more views".
    // Given the context of "fake algo", I'll assume we want to set it to the calculated value
    // but preserve any "real" views if they are significant.
    // However, since we are replacing the client-side calc, we should probably just SET it to the calculated value
    // plus whatever small real count might exist, OR just the calculated value if the real count is negligible.
    
    // Let's just set it to the calculated value, as that's the "system".
    // But if the current view_count is HIGHER than the calculated value, we shouldn't decrease it.
    
    const currentViews = article.view_count || 0;
    const targetViews = Math.max(currentViews, fakeViews);

    if (targetViews > currentViews) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ view_count: targetViews })
        .eq('id', article.id);

      if (updateError) {
        console.error(`Failed to update article ${article.id}:`, updateError);
      } else {
        // console.log(`Updated "${article.title.substring(0, 20)}..." from ${currentViews} to ${targetViews}`);
        updatedCount++;
      }
    }
    
    // Progress log every 50 items
    if (updatedCount % 50 === 0 && updatedCount > 0) {
        process.stdout.write('.');
    }
  }

  console.log(`\n✅ Successfully updated ${updatedCount} articles.`);
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backfillViews();
}

export { backfillViews, calculateFakeViews };
