import { NextResponse } from 'next/server';
import { getAllReviews, saveReview, generateSlug } from '../../../lib/reviews';
import { GameReview } from '../../../types/game-review';
import { v4 as uuidv4 } from 'uuid';

interface ReviewCreateRequest {
  title: string;
  gameTitle: string;
  fairPriceTier: GameReview['fairPriceTier'];
  fairPriceAmount?: number;
  quickVerdict: string;
  reviewContent: string;
  featuredImage: string;
  youtubeVideoId?: string;
  pros?: string[];
  cons?: string[];
}

export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json(reviews);
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
    const requiredFields: (keyof ReviewCreateRequest)[] = ['title', 'gameTitle', 'fairPriceTier', 'quickVerdict', 'reviewContent', 'featuredImage'];
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
      'Wait-for-Sale', 'Never-Buy', 'Subscription-Only'
    ];
    
    if (typeof body.title !== 'string' || 
        typeof body.gameTitle !== 'string' || 
        typeof body.quickVerdict !== 'string' ||
        typeof body.reviewContent !== 'string' ||
        typeof body.featuredImage !== 'string' ||
        !allowedTiers.includes(body.fairPriceTier as GameReview['fairPriceTier'])) {
      return NextResponse.json(
        { 
          message: 'Invalid field types or values',
          details: {
            title: typeof body.title,
            gameTitle: typeof body.gameTitle,
            quickVerdict: typeof body.quickVerdict,
            reviewContent: typeof body.reviewContent,
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
      reviewContent: body.reviewContent!,
      featuredImage: body.featuredImage!,
      youtubeVideoId: body.youtubeVideoId,
      pros: body.pros || [],
      cons: body.cons || [],
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
