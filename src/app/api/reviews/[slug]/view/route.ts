import { NextResponse } from 'next/server';
import { getReviewBySlug, saveReview } from '../../lib/reviews';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ message: 'Missing slug parameter' }, { status: 400 });
  }

  try {
    const review = await getReviewBySlug(slug);

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    // Increment view count
    const updatedReview = {
      ...review,
      viewCount: (review.viewCount || 0) + 1,
      updatedAt: new Date().toISOString(), // Update timestamp
    };

    await saveReview(updatedReview);

    return NextResponse.json({ message: 'View count updated', newViewCount: updatedReview.viewCount });

  } catch (error) {
    console.error('View count API error:', error);
    return NextResponse.json({ error: 'Failed to update view count' }, { status: 500 });
  }
}
