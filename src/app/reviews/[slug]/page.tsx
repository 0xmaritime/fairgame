import React from 'react';
import { notFound } from 'next/navigation';
import { getReviewBySlug } from '@/lib/reviews';
import FairPriceBadge from '@/components/FairPriceBadge';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import Markdown from 'react-markdown';
import Link from 'next/link'; // Import Link

interface ReviewPageProps {
  params: {
    slug: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug } = params; // No need to await params
  const review = await getReviewBySlug(slug);

  if (!review) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto"> {/* Use max-w-3xl and mx-auto for centering */}
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/reviews" className="text-blue-600 hover:underline flex items-center">
          <span>← Back to All Reviews</span>
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{review.title}</h1> {/* Adjusted typography and spacing */}
      <p className="text-xl text-gray-700 mb-4">{review.gameTitle}</p> {/* Adjusted spacing */}
      <div className="mb-6">
        <FairPriceBadge tier={review.fairPriceTier} amount={review.fairPriceAmount} size="lg" /> {/* Use lg size badge */}
      </div>

      {review.featuredImage && (
        <img
          src={`/uploads/${review.featuredImage}`}
          alt={review.title}
          className="w-full h-auto rounded-lg mb-8" // Adjusted spacing
        />
      )}

      {review.youtubeVideoId && (
        <div className="mb-8"> {/* Adjusted spacing */}
          <YouTubeEmbed videoId={review.youtubeVideoId} />
        </div>
      )}

      <p className="text-lg italic text-gray-800 mb-8">{review.quickVerdict}</p> {/* Adjusted spacing */}

      <div className="prose prose-lg max-w-none mb-8"> {/* Adjusted spacing */}
        <Markdown>{review.reviewContent}</Markdown>
      </div>

      {(review.pros && review.pros.length > 0) && (
        <div className="mb-8"> {/* Adjusted spacing */}
          <h2 className="text-2xl font-semibold mb-3 text-green-700">Pros:</h2> {/* Adjusted spacing */}
          <ul className="list-disc list-inside text-lg text-green-600 space-y-2"> {/* Adjusted spacing */}
            {review.pros.map((pro: string, index: number) => (
              <li key={index}>{pro}</li>
            ))}
          </ul>
        </div>
      )}

      {(review.cons && review.cons.length > 0) && (
        <div className="mb-8"> {/* Adjusted spacing */}
          <h2 className="text-2xl font-semibold mb-3 text-red-700">Cons:</h2> {/* Adjusted spacing */}
          <ul className="list-disc list-inside text-lg text-red-600 space-y-2"> {/* Adjusted spacing */}
            {review.cons.map((con: string, index: number) => (
              <li key={index}>{con}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-sm text-gray-500 mt-8 border-t pt-4">
        <p>Published: {new Date(review.publishedAt).toLocaleDateString()}</p>
        <p>Last Updated: {new Date(review.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
