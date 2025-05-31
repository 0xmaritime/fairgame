import { NextResponse } from 'next/server';
import { getAllReviews, saveReview } from '../../reviews/lib/reviews';
import { GameReview } from '@/types/game-review';

export async function GET() {
  try {
    const allReviews = await getAllReviews();
    const now = new Date();

    // Find scheduled reviews whose scheduledPublishAt is in the past or present
    const reviewsToPublish = allReviews.filter(review =>
      review.status === 'scheduled' &&
      review.scheduledPublishAt &&
      new Date(review.scheduledPublishAt) <= now
    );

    if (reviewsToPublish.length === 0) {
      return NextResponse.json({ message: 'No scheduled reviews to publish.' });
    }

    let publishedCount = 0;
    let failedCount = 0;
    const publishedSlugs: string[] = [];
    const failedSlugs: string[] = [];

    // Publish each scheduled review
    for (const review of reviewsToPublish) {
      try {
        const updatedReview: GameReview = {
          ...review,
          status: 'published',
          publishedAt: review.scheduledPublishAt || now.toISOString(), // Use scheduled time or now
          scheduledPublishAt: undefined, // Clear scheduled time
          updatedAt: now.toISOString(),
        };
        await saveReview(updatedReview);
        publishedCount++;
        publishedSlugs.push(review.slug);
      } catch (error) {
        console.error(`Failed to publish review ${review.slug}:`, error);
        failedCount++;
        failedSlugs.push(review.slug);
      }
    }

    return NextResponse.json({
      message: `Scheduled reviews processed. Published: ${publishedCount}, Failed: ${failedCount}`,
      publishedSlugs,
      failedSlugs,
    });

  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to process scheduled reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
