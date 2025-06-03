import React from 'react';
import Link from 'next/link';
import { Review } from '@/types';
import FairPriceBadge from './FairPriceBadge';
import { ReviewImage } from './ReviewImage'; // Import the new component

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Link href={`/reviews/${review.slug}`} className="block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 ease-in-out">
      <div className="relative w-full aspect-video bg-gray-100">
        {review.featuredImage && (
          <ReviewImage
            src={review.featuredImage} // Pass the image source directly
            alt={review.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition-transform duration-200 ease-in-out hover:scale-105"
          />
        )}
      </div>
      <div className="p-4 flex flex-col justify-between h-auto">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{review.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{review.quickVerdict}</p>
        </div>
        <FairPriceBadge tier={review.fairPriceTier} amount={review.fairPriceAmount} size="sm" />
      </div>
    </Link>
  );
};

export default ReviewCard;
