
export function calculateFakeViews(createdAt: string): number {
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

/**
 * Get the display view count for an article.
 * Uses the higher of the DB value or the time-based calculated value.
 * This ensures articles always show reasonable view counts even if
 * the backfill job hasn't run recently.
 */
export function getDisplayViews(createdAt: string, dbViewCount: number | null | undefined): number {
  const calculatedViews = calculateFakeViews(createdAt);
  return Math.max(dbViewCount ?? 0, calculatedViews);
}
