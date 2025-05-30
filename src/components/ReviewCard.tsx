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
    <Link href={`/reviews/${review.slug}`} className="block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 ease-in-out">
      <div className="relative w-full aspect-video bg-gray-100"> {/* Use aspect-video for better ratio */}
        {review.featuredImage && (
          <Image
            src={`/uploads/${review.featuredImage}`}
            alt={review.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition-transform duration-200 ease-in-out hover:scale-105" // Add hover scale effect
          />
        )}
      </div>
      <div className="p-4 flex flex-col justify-between h-auto"> {/* Adjust padding and use flex for layout */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{review.title}</h3> {/* Adjusted typography */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{review.quickVerdict}</p> {/* Adjusted spacing */}
        </div>
        <FairPriceBadge tier={review.fairPriceTier} amount={review.fairPriceAmount} size="sm" /> {/* Use sm size badge */}
      </div>
    </Link>
  );
};

export default ReviewCard;
