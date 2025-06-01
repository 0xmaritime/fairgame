import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');

    const where = {
      status: 'published',
      publishedAt: {
        lte: new Date().toISOString(), // Only show reviews published in the past
      },
      ...(tier ? { fairPriceTier: tier } : {}),
    };

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });

    // Convert pros and cons from string to array, handling both formats
    const reviewsWithArrays = reviews.map((review: any) => ({
      ...review,
      pros: Array.isArray(review.pros) 
        ? review.pros 
        : review.pros 
          ? review.pros.split('\n').filter(Boolean) 
          : [],
      cons: Array.isArray(review.cons)
        ? review.cons
        : review.cons
          ? review.cons.split('\n').filter(Boolean)
          : [],
    }));

    return NextResponse.json({ reviews: reviewsWithArrays });
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 