export interface GameReview {
  id: string;
  title: string;
  slug: string;
  gameTitle: string;
  fairPriceTier: 'Premium' | 'Standard' | 'Budget' | 'Free-to-Play' | 'Wait-for-Sale' | 'Never-Buy' | 'Subscription-Only';
  fairPriceAmount?: number;
  quickVerdict: string; // 300 char limit
  reviewContent: string; // markdown
  featuredImage: string; // filename
  youtubeVideoId?: string;
  publishedAt: string;
  updatedAt: string;
  pros?: string[];
  cons?: string[];
}
