import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GameReview } from '../types/game-review';
import FairPriceBadge from './FairPriceBadge';

interface ReviewCardProps {
  review: GameReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Link href={`/reviews/${review.slug}`} className="block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full h-48 bg-gray-100">
        {review.featuredImage && (
          <Image
            src={`/uploads/${review.featuredImage}`}
            alt={review.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{review.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{review.quickVerdict}</p>
        <FairPriceBadge tier={review.fairPriceTier} amount={review.fairPriceAmount} />
      </div>
    </Link>
  );
};

export default ReviewCard;
