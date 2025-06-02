import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { 
  getAllReviews, 
  saveReview, 
  generateSlug,
  getReviewBySlug,
  deleteReview
} from './lib/reviews';
import { convertToArray } from './lib/helpers';
import { Review } from '../../../types';

// Helper type for request body
type ReviewRequestBody = Partial<Review> & {
  pros?: string[] | string;
  cons?: string[] | string;
};

// Valid fair price tiers
const validFairPriceTiers = [
  'Premium', 'Standard', 'Budget', 
  'Free-to-Play', 'Wait-for-Sale', 
  'Never-Buy', 'Subscription-Only'
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let reviews = await getAllReviews();

    // Apply filtering
    let filteredReviews = reviews;
    if (status && status !== 'all') {
      filteredReviews = filteredReviews.filter((review: Review) => review.status === status);
    } else {
      // For public access, only show published reviews by default
      filteredReviews = filteredReviews.filter((review: Review) => review.status === 'published');
    }
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredReviews = filteredReviews.filter((review: Review) =>
        review.title.toLowerCase().includes(lowerSearch) ||
        review.gameTitle.toLowerCase().includes(lowerSearch)
      );
    }

    const total = filteredReviews.length;
    const paginatedReviews = filteredReviews.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      reviews: paginatedReviews,
      total,
      hasMore: total > page * limit,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json() as ReviewRequestBody;
    
    if (!body.slug) {
      body.slug = generateSlug(body.title || '');
    }

    // Clean up fields
    if (body.featuredImage === '') body.featuredImage = undefined;
    if (body.youtubeVideoId === '') body.youtubeVideoId = undefined;
    
    // Handle fairPriceAmount: convert to number if possible
    if (body.fairPriceAmount !== undefined && body.fairPriceAmount !== null) {
      if (typeof body.fairPriceAmount === 'string') {
        const num = parseFloat(body.fairPriceAmount);
        body.fairPriceAmount = isNaN(num) ? undefined : num;
      }
    } else {
      body.fairPriceAmount = undefined;
    }

    // Handle pros/cons conversion
    // Validate fairPriceTier
    if (body.fairPriceTier && !validFairPriceTiers.includes(body.fairPriceTier)) {
      return new NextResponse(
        `Invalid fairPriceTier. Valid options: ${validFairPriceTiers.join(', ')}`, 
        { status: 400 }
      );
    }
    
    // Handle pros/cons conversion
    const pros = convertToArray(body.pros);
    const cons = convertToArray(body.cons);

    const newReview: Review = {
      id: body.slug!,
      slug: body.slug!,
      title: body.title || 'Untitled Review',
      gameTitle: body.gameTitle || '',
      fairPriceTier: body.fairPriceTier || 'Standard',
      fairPriceAmount: body.fairPriceAmount,
      quickVerdict: body.quickVerdict || '',
      content: body.content || '',
      featuredImage: body.featuredImage,
      youtubeVideoId: body.youtubeVideoId,
      pros,
      cons,
      status: body.status || 'draft',
      publishedAt: body.status === 'published' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    await saveReview(newReview);

    return NextResponse.json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return new NextResponse('Slug is required', { status: 400 });
    }

    const existingReview = await getReviewBySlug(slug);
    if (!existingReview) {
      return new NextResponse('Review not found', { status: 404 });
    }

    const body = await request.json() as ReviewRequestBody;
    
    // Clean up fields
    if (body.featuredImage === '') body.featuredImage = undefined;
    if (body.youtubeVideoId === '') body.youtubeVideoId = undefined;
    
    // Handle fairPriceAmount: convert to number if possible
    if (body.fairPriceAmount !== undefined && body.fairPriceAmount !== null) {
      if (typeof body.fairPriceAmount === 'string') {
        const num = parseFloat(body.fairPriceAmount);
        body.fairPriceAmount = isNaN(num) ? undefined : num;
      }
    } else {
      body.fairPriceAmount = undefined;
    }

    // Handle pros/cons conversion
    // Validate fairPriceTier
    if (body.fairPriceTier && !validFairPriceTiers.includes(body.fairPriceTier)) {
      return new NextResponse(
        `Invalid fairPriceTier. Valid options: ${validFairPriceTiers.join(', ')}`, 
        { status: 400 }
      );
    }
    
    // Handle pros/cons conversion
    const pros = body.pros !== undefined ? convertToArray(body.pros) : existingReview.pros;
    const cons = body.cons !== undefined ? convertToArray(body.cons) : existingReview.cons;

    const updatedReview: Review = {
      ...existingReview,
      ...body,
      slug: slug,
      updatedAt: new Date().toISOString(),
      pros,
      cons
    };

    await saveReview(updatedReview);

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return new NextResponse('Slug is required', { status: 400 });
    }

    await deleteReview(slug);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
