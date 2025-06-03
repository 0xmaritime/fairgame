export interface Review {
  id: string;
  slug: string;
  title: string;
  gameTitle: string;
  fairPriceTier: 'Premium' | 'Standard' | 'Budget' | 'Free-to-Play' | 'Wait-for-Sale' | 'Never-Buy' | 'Subscription-Only';
  fairPriceAmount?: number;
  quickVerdict: string;
  content: string;
  featuredImage?: string;
  youtubeVideoId?: string;
  pros: string[];
  cons: string[];
  status: 'draft' | 'published';
  publishedAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  viewCount?: number;
}

export interface ReviewFormData {
  title: string;
  gameTitle: string;
  fairPriceTier: Review['fairPriceTier'];
  fairPriceAmount?: number;
  quickVerdict: string;
  content: string;
  featuredImage?: File;
  youtubeVideoId?: string;
  pros: string[];
  cons: string[];
}
