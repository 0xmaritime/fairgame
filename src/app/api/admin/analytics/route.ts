import { NextResponse } from 'next/server';
import { getAllReviews } from '../../reviews/lib/reviews';
import { GameReview } from '@/types/game-review';

export async function GET() {
  try {
    const reviews = await getAllReviews();

    // Calculate total reviews by status
    const totalByStatus = reviews.reduce((acc, review) => {
      acc[review.status] = (acc[review.status] || 0) + 1;
      return acc;
    }, {} as Record<GameReview['status'], number>);

    // Calculate total reviews by tier
    const totalByTier = reviews.reduce((acc, review) => {
      acc[review.fairPriceTier] = (acc[review.fairPriceTier] || 0) + 1;
      return acc;
    }, {} as Record<GameReview['fairPriceTier'], number>);

    // Calculate average price by tier
    const priceSumByTier = reviews.reduce((acc, review) => {
      if (review.fairPriceAmount !== undefined) {
        acc[review.fairPriceTier] = (acc[review.fairPriceTier] || 0) + review.fairPriceAmount;
      }
      return acc;
    }, {} as Record<GameReview['fairPriceTier'], number>);

    const averagePriceByTier: Record<GameReview['fairPriceTier'], number | null> = {} as Record<GameReview['fairPriceTier'], number | null>;
    for (const tier in totalByTier) {
      if (totalByTier[tier as GameReview['fairPriceTier']] > 0) {
        averagePriceByTier[tier as GameReview['fairPriceTier']] = priceSumByTier[tier as GameReview['fairPriceTier']] / totalByTier[tier as GameReview['fairPriceTier']];
      } else {
        averagePriceByTier[tier as GameReview['fairPriceTier']] = null;
      }
    }

    // Most recent review activity (simple list of last 5 updated reviews)
    const recentActivity = reviews
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(review => ({
        slug: review.slug,
        title: review.title,
        updatedAt: review.updatedAt,
        status: review.status,
      }));

    // Popular price ranges (simple count for now, could be more sophisticated)
    const priceRangeCounts: Record<string, number> = {};
    reviews.forEach(review => {
      if (review.fairPriceAmount !== undefined) {
        const range = review.fairPriceAmount < 10 ? '<$10' :
                      review.fairPriceAmount < 30 ? '$10-$30' :
                      review.fairPriceAmount < 60 ? '$30-$60' :
                      '>$60';
        priceRangeCounts[range] = (priceRangeCounts[range] || 0) + 1;
      }
    });


    // Review publishing frequency over time (simple count by month/year for now)
    const publishingFrequency: Record<string, number> = {};
    reviews.forEach(review => {
      if (review.status === 'published') {
        const date = new Date(review.publishedAt);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        publishingFrequency[yearMonth] = (publishingFrequency[yearMonth] || 0) + 1;
      }
    });
    // Sort frequency by date
    const sortedPublishingFrequency = Object.entries(publishingFrequency)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .reduce((acc, [date, count]) => {
        acc[date] = count;
        return acc;
      }, {} as Record<string, number>);


    return NextResponse.json({
      totalReviews: reviews.length,
      totalByStatus,
      totalByTier,
      averagePriceByTier,
      recentActivity,
      priceRangeCounts,
      publishingFrequency: sortedPublishingFrequency,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
