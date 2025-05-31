import { NextResponse } from 'next/server';
import { getAllReviews, saveReview } from '../../reviews/lib/reviews';
import { GameReview } from '@/types/game-review';
import { v4 as uuidv4 } from 'uuid';

interface DuplicateReviewRequest {
  slug: string;
}

export async function POST(request: Request) {
  try {
    const body: DuplicateReviewRequest = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ message: 'Missing slug parameter' }, { status: 400 });
    }

    const allReviews = await getAllReviews();
    const reviewToDuplicate = allReviews.find(review => review.slug === slug);

    if (!reviewToDuplicate) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    const newReview: GameReview = {
      ...reviewToDuplicate,
      id: uuidv4(),
      slug: `${reviewToDuplicate.slug}-copy`,
      title: `${reviewToDuplicate.title} (Copy)`,
      status: 'draft', // Set to draft by default
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0, // Reset view count
      lastModifiedBy: 'Admin (Duplicate)',
    };

    await saveReview(newReview);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to duplicate review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
