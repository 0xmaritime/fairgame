import { NextResponse } from 'next/server';
import { getReviewBySlug, saveReview, deleteReview, generateSlug } from '../../../../lib/reviews';
import { GameReview } from '../../../../types/game-review';

export async function GET(request: Request, context: { params: { slug: string } }) {
  try {
    const { slug } = await context.params; // Await params
    const review = await getReviewBySlug(slug);

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json(review);
  } catch (error) {
    console.error(`Failed to fetch review with slug ${context.params.slug}:`, error);
    return NextResponse.json({ message: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { slug: string } }) {
  try {
    const { slug } = await context.params; // Await params
    const body = await request.json();

    // Basic validation
    if (!body.title || !body.gameTitle || !body.fairPriceTier || !body.quickVerdict || !body.reviewContent || !body.featuredImage) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Ensure slug consistency if title changes
    const newSlug = generateSlug(body.title);
    if (newSlug !== slug) {
      // If slug changes, delete old file and save new one
      await deleteReview(slug);
    }

    const updatedReview: GameReview = {
      ...body,
      slug: newSlug,
      updatedAt: new Date().toISOString(),
    };

    await saveReview(updatedReview);
    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error(`Failed to update review with slug ${context.params.slug}:`, error);
    return NextResponse.json({ message: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { slug: string } }) {
  try {
    const { slug } = await context.params; // Await params
    await deleteReview(slug);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete review with slug ${context.params.slug}:`, error);
    return NextResponse.json({ message: 'Failed to delete review' }, { status: 500 });
  }
}
