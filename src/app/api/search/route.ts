import { NextResponse } from 'next/server';
import { getAllReviews } from '../reviews/lib/reviews';
import { GameReview } from '@/types/game-review';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const reviews = await getAllReviews();

    // Basic filtering for now, will enhance with fuzzy matching and scoring later
    const filteredReviews = reviews.filter((review: GameReview) =>
      review.title.toLowerCase().includes(query.toLowerCase()) ||
      review.gameTitle.toLowerCase().includes(query.toLowerCase()) ||
      (review.content && review.content.toLowerCase().includes(query.toLowerCase())) // Assuming content is a string and might be optional
    );

    // Limit results for suggestions
    const suggestionResults = filteredReviews.map((review: GameReview) => ({
      slug: review.slug,
      title: review.title,
      gameTitle: review.gameTitle,
    })).slice(0, 10); // Limit to 10 suggestions

    return NextResponse.json({ results: suggestionResults });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}
