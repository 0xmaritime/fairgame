'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GameReview } from '@/types/game-review';
import ReviewCard from './ReviewCard';

interface RelatedReviewsProps {
  currentReviewSlug: string;
}

export default function RelatedReviews({ currentReviewSlug }: RelatedReviewsProps) {
  const [relatedReviews, setRelatedReviews] = useState<GameReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/${currentReviewSlug}/related`);
        if (!res.ok) {
          throw new Error('Failed to fetch related reviews');
        }
        const data = await res.json();
        setRelatedReviews(data);
      } catch (error) {
        console.error('Error fetching related reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedReviews();
  }, [currentReviewSlug]);

  if (loading) {
    return <div className="text-center py-4">Loading related reviews...</div>;
  }

  if (relatedReviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedReviews.map((review) => (
          <ReviewCard key={review.slug} review={review} />
        ))}
      </div>
    </div>
  );
} 