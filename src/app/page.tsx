import ReviewCard from '@/components/ReviewCard';
import Link from 'next/link';
import type { Metadata } from 'next'; // Import Metadata type
import { GameReview } from '@/types/game-review';

async function fetchReviews() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`);
  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return res.json();
}

export async function generateMetadata(): Promise<Metadata> {
  const { reviews } = await fetchReviews();
  const totalReviews = reviews.length;
  const latestReviewTitle = totalReviews > 0 ? reviews[0].title : 'latest game reviews';

  return {
    title: 'Fair Game Price Index',
    description: `Find fair prices for games with our reviews. We have ${totalReviews} reviews, including the latest on ${latestReviewTitle}.`,
    // Add Open Graph tags if needed
    openGraph: {
      title: 'Fair Game Price Index',
      description: `Find fair prices for games with our reviews. We have ${totalReviews} reviews, including the latest on ${latestReviewTitle}.`,
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com', // Replace with your actual website URL
      siteName: 'Fair Game Price Index',
      type: 'website',
      // Add images if available
      // images: [
      //   {
      //     url: 'https://yourwebsite.com/og-image.jpg', // Replace with your actual OG image URL
      //     width: 800,
      //     height: 600,
      //     alt: 'Fair Game Price Index',
      //   },
      // ],
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com', // Add canonical URL using alternates
    },
  };
}


export default async function Home() {
  const { reviews } = await fetchReviews();
  const featuredReviews = reviews.filter((review: GameReview) => review.status === 'published').slice(0, 6); // Get up to 6 most recent published reviews

  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-gray-50">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Find the <span className="text-blue-600">Fair Price</span> for Your Next Game
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Revolutionizing game reviews by replacing arbitrary scores with concrete "Fair Price" recommendations. Never overpay for a game again.
        </p>
        <Link href="/reviews" className="inline-block bg-blue-600 text-white text-lg font-semibold px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200">
          Browse All Reviews
        </Link>
      </section>

      {/* Featured Reviews Grid */}
      {featuredReviews.length > 0 && (
        <section className="py-12 md:py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Reviews</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* 2x3 or 3x2 layout */}
            {featuredReviews.map((review: GameReview) => (
              <ReviewCard key={review.slug} review={review} />
            ))}
          </div>
        </section>
      )}

      {/* Optional: Add a section explaining the concept further */}
      {/* <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What is the Fair Price Index?</h2>
          <p className="text-lg text-gray-700 mb-4">
            Instead of subjective scores, we analyze games based on their content, quality, and market value to determine a "Fair Price Tier" and a recommended price.
          </p>
          <p className="text-lg text-gray-700">
            Our tiers include Premium, Standard, Budget, Free-to-Play, Wait for Sale, Never Buy, and Subscription Only, giving you clear guidance on when and at what price to buy.
          </p>
        </div>
      </section> */}
    </>
  );
}
