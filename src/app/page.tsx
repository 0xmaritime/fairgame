import ReviewCard from '@/components/ReviewCard';
import type { Metadata } from 'next';
import { Review } from '@/types';
import { getAllReviews } from '@/app/api/reviews/lib/reviews';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  let reviews: Review[] = [];
  
  try {
    reviews = await getAllReviews();
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  const totalReviews = reviews.length;
  const latestReviewTitle = totalReviews > 0 ? reviews[0].title : 'latest game reviews';

  return {
    title: 'Fair Game Price Index',
    description: `Find fair prices for games with our reviews. We have ${totalReviews} reviews, including the latest on ${latestReviewTitle}.`,
    openGraph: {
      title: 'Fair Game Price Index',
      description: `Find fair prices for games with our reviews. We have ${totalReviews} reviews, including the latest on ${latestReviewTitle}.`,
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com',
      siteName: 'Fair Game Price Index',
      type: 'website',
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com',
    },
  };
}

export default async function Home() {
  let reviews: Review[] = [];
  
  try {
    reviews = await getAllReviews();
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fair Game Price Index</h1>
        <p className="text-gray-600 mt-2">
          Find fair prices for the latest video games based on our comprehensive reviews.
        </p>
      </header>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No reviews found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.slug} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
