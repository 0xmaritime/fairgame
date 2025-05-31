'use client';

import React, { useEffect, useState } from 'react';
import { GameReview } from '@/types/game-review';
import ReviewCard from './ReviewCard';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorMessage from './ui/ErrorMessage';

interface RelatedReviewsProps {
  currentReviewSlug: string;
}

const RelatedReviews: React.FC<RelatedReviewsProps> = ({ currentReviewSlug }) => {
  const [relatedReviews, setRelatedReviews] = useState<GameReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentReviewSlug) {
      setLoading(false);
      return;
    }

    const fetchRelatedReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reviews/${currentReviewSlug}/related`);
        if (!res.ok) {
          throw new Error('Failed to fetch related reviews');
        }
        const data: GameReview[] = await res.json();
        setRelatedReviews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedReviews();
  }, [currentReviewSlug]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={`Error loading related reviews: ${error}`} />;
  }

  if (relatedReviews.length === 0) {
    return null; // Don't show the section if no related reviews are found
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Reviews</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:space-x-0 md:gap-6">
        {relatedReviews.map(review => (
          <div key={review.slug} className="flex-shrink-0 w-64 md:w-auto">
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedReviews;
