export interface GameReview {
  id: string;
  title: string;
  slug: string;
  gameTitle: string;
  fairPriceTier: 'Premium' | 'Standard' | 'Budget' | 'Free-to-Play' | 'Wait-for-Sale' | 'Never-Buy';
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
}
