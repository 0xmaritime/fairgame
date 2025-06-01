import { NextResponse } from 'next/server';
import { getAllReviews, saveReview, generateSlug } from './lib/reviews';
import { GameReview } from '../../../types/game-review';
import { v4 as uuidv4 } from 'uuid';

interface ReviewCreateRequest {
  title: string;
  gameTitle: string;
  fairPriceTier: GameReview['fairPriceTier'];
  fairPriceAmount?: number;
  quickVerdict: string;
  content: string;
  featuredImage: string;
  youtubeVideoId?: string;
  pros?: string[];
  cons?: string[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const status = searchParams.get('status') || 'published';

    let reviews = await getAllReviews();

    // Apply status filter
    reviews = reviews.filter(review => review.status === status);

    // Apply tier filter if specified
    if (tier) {
      reviews = reviews.filter(review => review.fairPriceTier === tier);
    }

    // Sort by published date (newest first)
    reviews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<ReviewCreateRequest> = await request.json();

    // Validate required fields
    const requiredFields: (keyof ReviewCreateRequest)[] = ['title', 'gameTitle', 'fairPriceTier', 'quickVerdict', 'content', 'featuredImage'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          message: 'Missing required fields',
          missingFields 
        }, 
        { status: 400 }
      );
    }

    // Validate field types and values
    const allowedTiers: GameReview['fairPriceTier'][] = [
      'Premium', 'Standard', 'Budget', 'Free-to-Play', 
      'Wait-for-Sale', 'Never-Buy'
    ];
    
    if (typeof body.title !== 'string' || 
        typeof body.gameTitle !== 'string' || 
        typeof body.quickVerdict !== 'string' ||
        typeof body.content !== 'string' ||
        typeof body.featuredImage !== 'string' ||
        !allowedTiers.includes(body.fairPriceTier as GameReview['fairPriceTier'])) {
      return NextResponse.json(
        { 
          message: 'Invalid field types or values',
          details: {
            title: typeof body.title,
            gameTitle: typeof body.gameTitle,
            quickVerdict: typeof body.quickVerdict,
            content: typeof body.content,
            featuredImage: typeof body.featuredImage,
            fairPriceTier: body.fairPriceTier
          }
        }, 
        { status: 400 }
      );
    }

    const slug = generateSlug(body.title);
    const newReview: GameReview = {
      id: uuidv4(),
      title: body.title!,
      slug,
      gameTitle: body.gameTitle!,
      fairPriceTier: body.fairPriceTier!,
      fairPriceAmount: body.fairPriceAmount,
      quickVerdict: body.quickVerdict!,
      content: body.content!,
      featuredImage: body.featuredImage!,
      youtubeVideoId: body.youtubeVideoId,
      pros: body.pros || [],
      cons: body.cons || [],
      status: 'draft',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveReview(newReview);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { 
        message: 'Failed to create review',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;
    const allReviews = await getAllReviews();
    const reviewIndex = allReviews.findIndex(review => review.slug === slug);

    if (reviewIndex === -1) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    const updatedReview: GameReview = {
      ...allReviews[reviewIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await saveReview(updatedReview);
    return NextResponse.json(updatedReview);
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to update review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Review ID is required' }, { status: 400 });
    }

    const allReviews = await getAllReviews();
    const reviewIndex = allReviews.findIndex(review => review.id === id);

    if (reviewIndex === -1) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    allReviews.splice(reviewIndex, 1);
    await saveReview(allReviews[reviewIndex]);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to delete review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
