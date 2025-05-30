import React from 'react';
import { notFound } from 'next/navigation';
import { getReviewBySlug } from '@/lib/reviews';
import FairPriceBadge from '@/components/FairPriceBadge';
import YouTubeEmbed from '@/components/YouTubeEmbed'; // Will create this next
import Markdown from 'react-markdown'; // Will install this

interface ReviewPageProps {
  params: {
    slug: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug } = await params; // Await params
  const review = await getReviewBySlug(slug);

  if (!review) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{review.title}</h1>
      <p className="text-xl text-gray-700 mb-4">{review.gameTitle}</p>
      <div className="mb-6">
        <FairPriceBadge tier={review.fairPriceTier} amount={review.fairPriceAmount} />
      </div>

      {review.featuredImage && (
        <img
          src={`/uploads/${review.featuredImage}`}
          alt={review.title}
          className="w-full h-auto rounded-lg mb-6"
        />
      )}

      {review.youtubeVideoId && (
        <div className="mb-6">
          <YouTubeEmbed videoId={review.youtubeVideoId} />
        </div>
      )}

      <p className="text-lg italic text-gray-800 mb-6">{review.quickVerdict}</p>

      <div className="prose prose-lg max-w-none mb-8">
        <Markdown>{review.reviewContent}</Markdown>
      </div>

      {(review.pros && review.pros.length > 0) && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-green-700">Pros:</h2>
          <ul className="list-disc list-inside text-lg text-green-600">
            {review.pros.map((pro: string, index: number) => (
              <li key={index}>{pro}</li>
            ))}
          </ul>
        </div>
      )}

      {(review.cons && review.cons.length > 0) && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-red-700">Cons:</h2>
          <ul className="list-disc list-inside text-lg text-red-600">
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
