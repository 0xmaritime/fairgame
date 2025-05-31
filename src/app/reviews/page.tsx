import React, { Suspense } from 'react';
import { GameReview } from '@/types/game-review';
import ReviewCard from '@/components/ReviewCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';
import AdvancedFilters from '@/components/AdvancedFilters';
import Pagination from '@/components/ui/Pagination';
import type { Metadata } from 'next'; // Import Metadata type

interface ReviewsPageProps {
  searchParams: {
    tiers?: string;
    minPrice?: string;
    maxPrice?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    page?: string;
    limit?: string;
  };
}

// Define available tiers - should ideally come from a central config or API
const availableTiers: GameReview['fairPriceTier'][] = [
  'Premium',
  'Standard',
  'Budget',
  'Free-to-Play',
  'Wait-for-Sale',
  'Never-Buy',
  'Subscription-Only',
];

interface FetchReviewsResponse {
  reviews: GameReview[];
  total: number;
  page: number;
  limit: number;
}

// Dynamic Metadata for the Reviews List Page
export async function generateMetadata({ searchParams }: ReviewsPageProps): Promise<Metadata> {
  // Fetch all reviews to get the total count for the description
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`);
  if (!res.ok) {
    console.error('Failed to fetch reviews for metadata');
    return {
      title: 'All Game Reviews - Fair Game Price Index',
      description: 'Browse all game reviews on Fair Game Price Index',
    };
  }
  const { reviews } = await res.json();
  const totalReviews = reviews.length;

  // Construct a basic description, could be enhanced based on filters if desired
  const description = `Browse all ${totalReviews} game reviews on Fair Game Price Index. Find fair price recommendations and detailed analysis.`;

  return {
    title: 'All Game Reviews - Fair Game Price Index',
    description: description,
    // Add Open Graph tags if needed
    openGraph: {
      title: 'All Game Reviews - Fair Game Price Index',
      description: description,
      url: 'https://yourwebsite.com/reviews', // Replace with your actual website URL
      siteName: 'Fair Game Price Index',
      type: 'website',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com'}/reviews`, // Add canonical URL
    },
  };
}


async function fetchFilteredReviews(searchParams: ReviewsPageProps['searchParams']): Promise<FetchReviewsResponse> {
  const params = new URLSearchParams();
  if (searchParams.tiers) params.set('tiers', searchParams.tiers);
  if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
  if (searchParams.startDate) params.set('startDate', searchParams.startDate);
  if (searchParams.endDate) params.set('endDate', searchParams.endDate);
  if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
  // Ensure page and limit are always set for the API
  params.set('page', searchParams.page || '1');
  params.set('limit', searchParams.limit || '12');


  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews?${params.toString()}`, {
    cache: 'no-store', // Ensure fresh data based on filters
  });

  if (!res.ok) {
    console.error('Failed to fetch filtered reviews', res.status, res.statusText);
    // Return a default structure on error
    return { reviews: [], total: 0, page: parseInt(searchParams.page || '1', 10), limit: parseInt(searchParams.limit || '12', 10) };
  }

  const data: FetchReviewsResponse = await res.json();
  return data;
}

async function ReviewsGrid({ searchParams }: ReviewsPageProps) {
  const { reviews, total, page, limit } = await fetchFilteredReviews(searchParams);

  if (!reviews || reviews.length === 0) {
    return <EmptyState message="No reviews found matching your criteria." />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review.slug} review={review} />
        ))}
      </div>
      {/* Pass pagination data up or handle here if ReviewsGrid is client component */}
      {/* For now, ReviewsGrid is server component, pagination handled in parent */}
    </>
  );
}


export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const { reviews, total, page, limit } = await fetchFilteredReviews(searchParams);
  const totalPages = Math.ceil(total / limit);
  const currentPage = page;

  // Construct basePath for pagination links, preserving existing filters
  // Construct basePath for pagination links, preserving existing filters
  // Safely convert searchParams object to URLSearchParams
  const currentParams = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => typeof value === 'string') as [string, string][]
  );
  currentParams.delete('page'); // Remove existing page param
  const basePath = `/reviews?${currentParams.toString()}`;


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">All Game Reviews</h1>

      {/* Advanced Filters Component */}
      <AdvancedFilters availableTiers={availableTiers} />

      {/* Reviews Grid (Server Component) */}
      {/* We already fetched reviews above, no need for Suspense around ReviewsGrid */}
      {reviews.length === 0 ? (
         <EmptyState message="No reviews found matching your criteria." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.slug} review={review} />
          ))}
        </div>
      )}


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
          />
        </div>
      )}
    </div>
  );
}
