import { getAllReviews } from '@/lib/reviews';
import ReviewCard from '@/components/ReviewCard';

export default async function Home() {
  const reviews = await getAllReviews();
  const featuredReviews = reviews.slice(0, 3); // Get 3 most recent reviews

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6">Fair Game Price Index</h1>
          <p className="text-lg mb-8">
            Welcome to the Fair Game Price Index, where we revolutionize game reviews by replacing arbitrary scores with concrete "Fair Price" recommendations.
          </p>
        </div>

        {featuredReviews.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredReviews.map((review) => (
                <ReviewCard key={review.slug} review={review} />
              ))}
            </div>
          </section>
        )}

        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-8">
            No more vague 8/10 ratings. We tell you what a game is truly worth, whether it's a "Premium" experience, a "Budget" gem, or something you should "Wait-for-Sale."
          </p>
          <p className="text-lg">
            Explore our reviews to discover games that offer fair value, and never overpay again!
          </p>
        </div>
      </main>
    </div>
  );
}
