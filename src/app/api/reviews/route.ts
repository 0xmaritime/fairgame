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
    const tiers = searchParams.get('tiers')?.split(',').filter(Boolean);
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || 'Infinity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'publishedAt_desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10); // Default limit to 12 for pagination
    const statusFilter = searchParams.get('status'); // Get status filter from query params

    let reviews = await getAllReviews();

    // Apply status filter conditionally
    if (statusFilter && statusFilter !== 'all') {
      reviews = reviews.filter(review => review.status === statusFilter);
    } else if (!statusFilter) {
      // Default to showing only published reviews if no status filter is provided
      reviews = reviews.filter(review => review.status === 'published');
    }

    // Apply other filters
    if (tiers && tiers.length > 0) {
      reviews = reviews.filter(review => tiers.includes(review.fairPriceTier));
    }

    reviews = reviews.filter(review => {
      const price = review.fairPriceAmount ?? 0; // Treat undefined price as 0 for filtering
      return price >= minPrice && price <= maxPrice;
    });

    if (startDate) {
      const start = new Date(startDate);
      reviews = reviews.filter(review => new Date(review.publishedAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      reviews = reviews.filter(review => new Date(review.publishedAt) <= end);
    }

    // Apply sorting
    reviews.sort((a, b) => {
      switch (sortBy) {
        case 'publishedAt_asc':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'fairPriceAmount_asc':
          return (a.fairPriceAmount ?? 0) - (b.fairPriceAmount ?? 0);
        case 'fairPriceAmount_desc':
          return (b.fairPriceAmount ?? 0) - (a.fairPriceAmount ?? 0);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'publishedAt_desc':
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const totalReviews = reviews.length;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    return NextResponse.json({
      reviews: paginatedReviews,
      total: totalReviews,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch and filter reviews',
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
      'Wait-for-Sale', 'Never-Buy', 'Subscription-Only'
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
      status: 'draft', // Default status for new reviews
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

    if (body.ids && body.fairPriceTier) {
      // Bulk tier change
      const { ids, fairPriceTier } = body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ message: 'Invalid request: ids must be a non-empty array' }, { status: 400 });
      }

      if (!['Premium', 'Standard', 'Budget', 'Free-to-Play', 'Wait-for-Sale', 'Never-Buy', 'Subscription-Only'].includes(fairPriceTier)) {
        return NextResponse.json({ message: 'Invalid request: fairPriceTier is not valid' }, { status: 400 });
      }

      const allReviews = await getAllReviews();
      let updatedCount = 0;

      for (const id of ids) {
        const reviewIndex = allReviews.findIndex(review => review.id === id);
        if (reviewIndex !== -1) {
          allReviews[reviewIndex] = {
            ...allReviews[reviewIndex],
            fairPriceTier: fairPriceTier,
            updatedAt: new Date().toISOString(),
          };
          await saveReview(allReviews[reviewIndex]);
          updatedCount++;
        }
      }

      return NextResponse.json({ message: `Successfully updated tier for ${updatedCount} reviews` });

    } else {
      // Single review update
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
    }
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

    if (body.ids && Array.isArray(body.ids)) {
      // Bulk delete
      const { ids } = body;
      let allReviews = await getAllReviews();
      let deletedCount = 0;

      for (const id of ids) {
        const reviewIndex = allReviews.findIndex(review => review.id === id);
        if (reviewIndex !== -1) {
          const reviewToDelete = allReviews[reviewIndex];
          await saveReview({...reviewToDelete, status: 'draft'});
          allReviews = allReviews.filter(review => review.id !== id);
          deletedCount++;
          // Delete the review file
          // This assumes that the reviews are stored in individual files named after their IDs
          // You might need to adjust the path based on your actual file structure
          //const filePath = `./content/reviews/${reviewToDelete.slug}.json`;
          // Delete the file
          //fs.unlinkSync(filePath); // Synchronous operation
        }
      }
      // Save the updated reviews
      //fs.writeFileSync('./content/reviews.json', JSON.stringify(allReviews, null, 2));
      return NextResponse.json({ message: `Successfully deleted ${deletedCount} reviews` });
    } else {
      // Single review delete
      const { searchParams } = new URL(request.url);
      const slug = searchParams.get('slug');

      if (!slug) {
        return NextResponse.json({ message: 'Missing slug parameter' }, { status: 400 });
      }

      let allReviews = await getAllReviews();
      const initialLength = allReviews.length;
      allReviews = allReviews.filter(review => review.slug !== slug);

      if (allReviews.length === initialLength) {
        return NextResponse.json({ message: 'Review not found' }, { status: 404 });
      }

      // Save the updated reviews
      //fs.writeFileSync('./content/reviews.json', JSON.stringify(allReviews, null, 2));
      return NextResponse.json({ message: 'Review deleted successfully' });
    }
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
