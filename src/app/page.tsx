import { getAllReviews } from '@/lib/reviews';
import ReviewCard from '@/components/ReviewCard';
import Link from 'next/link';

export default async function Home() {
  const reviews = await getAllReviews();
  const featuredReviews = reviews.slice(0, 6); // Get up to 6 most recent reviews

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
            {featuredReviews.map((review) => (
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
