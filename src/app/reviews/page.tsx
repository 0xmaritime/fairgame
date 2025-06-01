import React from 'react';
import { GameReview } from '@/types/game-review';
import ReviewCard from '@/components/ReviewCard';
import type { Metadata } from 'next';

interface ReviewsPageProps {
  searchParams: {
    tier?: string;
  };
}

const availableTiers: GameReview['fairPriceTier'][] = [
  'Premium',
  'Standard',
  'Budget',
  'Free-to-Play',
  'Wait-for-Sale',
  'Never-Buy',
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'All Game Reviews - Fair Game Price Index',
    description: 'Browse all game reviews on Fair Game Price Index. Find fair price recommendations and detailed analysis.',
  };
}

async function fetchReviews(tier?: string): Promise<GameReview[]> {
  const params = new URLSearchParams();
  if (tier) params.set('tier', tier);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public-reviews?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch reviews', res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  return data.reviews;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const reviews = await fetchReviews(searchParams.tier);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">All Game Reviews</h1>

      {/* Simple Tier Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <a
          href="/reviews"
          className={`px-4 py-2 rounded-full ${
            !searchParams.tier
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </a>
        {availableTiers.map((tier) => (
          <a
            key={tier}
            href={`/reviews?tier=${tier}`}
            className={`px-4 py-2 rounded-full ${
              searchParams.tier === tier
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tier}
          </a>
        ))}
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No reviews found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.slug} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
