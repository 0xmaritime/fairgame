import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Slugify helper
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {
      ...(status && status !== 'all' ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { gameTitle: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Convert pros and cons from string to array
    const reviewsWithArrays = reviews.map((review: any) => ({
      ...review,
      pros: review.pros ? review.pros.split('\n').filter(Boolean) : [],
      cons: review.cons ? review.cons.split('\n').filter(Boolean) : [],
    }));

    return NextResponse.json({
      reviews: reviewsWithArrays,
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

    const data = await request.json();
    if (!data.slug) {
      data.slug = slugify(data.title || '');
    }
    // Clean up empty string fields for optional fields
    if (data.featuredImagePathname === '') data.featuredImagePathname = undefined;
    if (data.youtubeVideoId === '') data.youtubeVideoId = undefined;
    if (data.fairPriceAmount === '') data.fairPriceAmount = undefined;

    const review = await prisma.review.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(data.status === 'published' && { publishedAt: new Date() }),
      },
    });

    return NextResponse.json(review);
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

    const data = await request.json();
    const { ids, action } = data;

    if (ids && action) {
      // Handle batch actions
      switch (action) {
        case 'publish':
          await prisma.review.updateMany({
            where: { id: { in: ids } },
            data: {
              status: 'published',
              publishedAt: new Date(),
              updatedAt: new Date(),
            },
          });
          break;
        case 'unpublish':
          await prisma.review.updateMany({
            where: { id: { in: ids } },
            data: {
              status: 'draft',
              updatedAt: new Date(),
            },
          });
          break;
        case 'delete':
          await prisma.review.deleteMany({
            where: { id: { in: ids } },
          });
          break;
        default:
          return new NextResponse('Invalid action', { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // Handle single review update
    const { id, ...updateData } = data;
    const review = await prisma.review.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
        ...(updateData.status === 'published' && { publishedAt: new Date() }),
      },
    });

    return NextResponse.json(review);
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
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing review ID', { status: 400 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
