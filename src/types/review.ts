export interface Review {
  id: string;
  title: string;
  slug: string;
  gameTitle: string;
  fairPriceTier: string;
  fairPriceAmount?: number;
  quickVerdict: string;
  content: string;
  featuredImage: string;
  featuredImagePathname?: string;
  youtubeVideoId?: string;
  pros: string;
  cons: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
} 