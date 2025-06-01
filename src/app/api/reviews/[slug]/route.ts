import { NextResponse } from 'next/server';
import { getReviewBySlug, saveReview, deleteReview, generateSlug } from '../lib/reviews';
import { GameReview } from '../../../../types/game-review';

export async function GET(request: Request, context: { params: { slug: string } }) {
  try {
    const { slug } = context.params;
    const review = await getReviewBySlug(slug);

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    // Only return published reviews for public access
    if (review.status !== 'published') {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: { slug: string } }) {
  try {
    const { slug } = context.params;
    const body = await request.json();

    // Get the existing review
    const existingReview = await getReviewBySlug(slug);
    if (!existingReview) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    // Merge the updates with the existing review
    const updatedReview: GameReview = {
      ...existingReview,
      ...body,
      slug: body.title ? generateSlug(body.title) : existingReview.slug,
      updatedAt: new Date().toISOString(),
    };

    // If title changed, we need to delete the old file
    if (body.title && generateSlug(body.title) !== slug) {
      await deleteReview(slug);
    }

    await saveReview(updatedReview);
    return NextResponse.json(updatedReview);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: { slug: string } }) {
  try {
    const { slug } = context.params;
    await deleteReview(slug);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
