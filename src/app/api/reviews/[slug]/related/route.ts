import { NextResponse } from 'next/server';
import { getAllReviews, getReviewBySlug } from '../../lib/reviews';
import { GameReview } from '@/types/game-review';

// Helper function to calculate keyword overlap score
function calculateKeywordOverlap(review1: GameReview, review2: GameReview): number {
  const keywords1 = new Set([...(review1.searchKeywords || []), review1.gameTitle, review1.title].map(k => k.toLowerCase()));
  const keywords2 = new Set([...(review2.searchKeywords || []), review2.gameTitle, review2.title].map(k => k.toLowerCase()));

  let overlapCount = 0;
  keywords1.forEach(keyword => {
    if (keywords2.has(keyword)) {
      overlapCount++;
    }
  });
  return overlapCount;
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ message: 'Missing slug parameter' }, { status: 400 });
  }

  try {
    const currentReview = await getReviewBySlug(slug);

    if (!currentReview || currentReview.status !== 'published') {
      return NextResponse.json({ message: 'Review not found or not published' }, { status: 404 });
    }

    const allReviews = await getAllReviews();

    // Filter out the current review and unpublished reviews
    const publishedReviews = allReviews.filter(
      (review) => review.slug !== slug && review.status === 'published'
    );

    // Calculate a relatedness score for each published review
    const relatedReviewsWithScore = publishedReviews.map(review => {
      let score = 0;

      // Criteria 1: Same price tier (high importance)
      if (review.fairPriceTier === currentReview.fairPriceTier) {
        score += 10;
      }

      // Criteria 2: Similar price range (medium importance)
      const price1 = currentReview.fairPriceAmount ?? 0;
      const price2 = review.fairPriceAmount ?? 0;
      if (Math.abs(price1 - price2) <= 10) {
        score += 5;
      }

      // Criteria 3: Recent publication date (medium importance)
      const date1 = new Date(currentReview.publishedAt).getTime();
      const date2 = new Date(review.publishedAt).getTime();
      const timeDiff = Math.abs(date1 - date2);
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      if (daysDiff <= 90) { // Within the last 90 days
        score += 5;
      } else if (daysDiff <= 365) { // Within the last year
        score += 2;
      }

      // Criteria 4: Keyword overlap (variable importance based on overlap count)
      score += calculateKeywordOverlap(currentReview, review) * 3;


      return { review, score };
    });

    // Sort by score in descending order and take the top N
    relatedReviewsWithScore.sort((a, b) => b.score - a.score);

    // Filter out reviews with a score of 0 (no relatedness)
    const relatedReviews = relatedReviewsWithScore
      .filter(item => item.score > 0)
      .map(item => item.review)
      .slice(0, 4); // Display 3-4 related reviews

    return NextResponse.json(relatedReviews);

  } catch (error) {
    console.error('Related reviews API error:', error);
    return NextResponse.json({ error: 'Failed to fetch related reviews' }, { status: 500 });
  }
}
