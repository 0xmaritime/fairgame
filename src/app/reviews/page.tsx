import React from 'react';
import { GameReview } from '../../../src/types/game-review';
import ReviewCard from '../../../src/components/ReviewCard';

async function getReviews(): Promise<GameReview[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`, {
    cache: 'no-store', // Ensure fresh data on each request
  });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch reviews');
  }
  return res.json();
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">All Game Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews published yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
