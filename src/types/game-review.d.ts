export interface GameReview {
  id: string;
  title: string;
  slug: string;
  gameTitle: string;
  fairPriceTier: 'Premium' | 'Standard' | 'Budget' | 'Free-to-Play' | 'Wait-for-Sale' | 'Never-Buy' | 'Subscription-Only';
  fairPriceAmount?: number;
  quickVerdict: string;
  content: string;
  featuredImage: string;
  youtubeVideoId?: string;
  pros?: string[];
  cons?: string[];
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  lastModifiedBy?: string;
  viewCount?: number;
}
