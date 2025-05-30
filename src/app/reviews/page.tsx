'use client';

import React, { useState, useEffect } from 'react';
import { GameReview } from '../../../src/types/game-review';
import ReviewCard from '../../../src/components/ReviewCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';

type PriceTier = GameReview['fairPriceTier'] | 'All';

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<PriceTier>('All');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data: GameReview[] = await res.json();
        setReviews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = selectedTier === 'All'
    ? reviews
    : reviews.filter(review => review.fairPriceTier === selectedTier);

  const priceTiers: PriceTier[] = [
    'All',
    'Premium',
    'Standard',
    'Budget',
    'Free-to-Play',
    'Wait-for-Sale',
    'Never-Buy',
    'Subscription-Only',
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">All Game Reviews</h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {priceTiers.map(tier => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
              selectedTier === tier
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tier === 'Wait-for-Sale' ? 'Wait for Sale' : tier === 'Never-Buy' ? 'Never Buy' : tier === 'Subscription-Only' ? 'Subscription Only' : tier}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <EmptyState message={selectedTier === 'All' ? 'No reviews published yet. Check back soon!' : `No reviews found for tier: ${selectedTier}`} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Improved grid layout */}
          {filteredReviews.map((review) => (
            <ReviewCard key={review.slug} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
