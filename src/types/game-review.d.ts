export interface GameReview {
  id: string;
  title: string;
  slug: string;
  gameTitle: string;
  fairPriceTier: 'Premium' | 'Standard' | 'Budget' | 'Free-to-Play' | 'Wait-for-Sale' | 'Never-Buy' | 'Subscription-Only';
  fairPriceAmount?: number;
  quickVerdict: string; // 300 char limit
  content: string; // markdown - Renamed from reviewContent
  featuredImage: string; // filename
  youtubeVideoId?: string;
  publishedAt: string;
  updatedAt: string;
  pros?: string[];
  cons?: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledPublishAt?: string;
  searchKeywords?: string[]; // For improved search
  viewCount?: number; // For analytics
  lastModifiedBy?: string; // Admin tracking
  highlights?: {
    title?: string;
    gameTitle?: string;
    content?: string;
  };
}
