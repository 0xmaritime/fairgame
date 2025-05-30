import { NextResponse } from 'next/server';
import { getAllReviews, saveReview, generateSlug } from '../../../lib/reviews';
import { GameReview } from '../../../types/game-review';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ message: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.title || !body.gameTitle || !body.fairPriceTier || !body.quickVerdict || !body.reviewContent || !body.featuredImage) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const slug = generateSlug(body.title);
    console.log('Slug generated in API route:', slug); // New debug log

    const newReview: GameReview = {
      id: uuidv4(),
      title: body.title, // Ensure title is explicitly passed
      slug,
      gameTitle: body.gameTitle,
      fairPriceTier: body.fairPriceTier,
      fairPriceAmount: body.fairPriceAmount,
      quickVerdict: body.quickVerdict,
      reviewContent: body.reviewContent,
      featuredImage: body.featuredImage,
      youtubeVideoId: body.youtubeVideoId,
      pros: body.pros,
      cons: body.cons,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveReview(newReview);
    console.log('Review saved:', newReview.slug); // New debug log
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ message: 'Failed to create review' }, { status: 500 });
  }
}
