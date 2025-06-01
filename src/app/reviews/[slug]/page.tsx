'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { GameReview } from '@/types/game-review';
import FairPriceBadge from '@/components/FairPriceBadge';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import Markdown from 'react-markdown';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ReviewPageProps {
  params: {
    slug: string;
  };
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { slug } = params;
  const [review, setReview] = useState<GameReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/reviews/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch review');
        }
        const data = await res.json();
        setReview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [slug]);

  if (loading) {
    return <div className="text-center py-8">Loading review...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!review) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto"> {/* Use max-w-3xl and mx-auto for centering */}
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            "itemReviewed": {
              "@type": "VideoGame", // Or other appropriate type like SoftwareApplication
              "name": review.gameTitle,
              // Add other VideoGame properties if available (e.g., genre, operatingSystem)
            },
            "author": {
              "@type": "Person", // Or Organization
              "name": review.lastModifiedBy || "Fair Game Price Index", // Use lastModifiedBy if available, otherwise default
            },
            "datePublished": review.publishedAt,
            "dateModified": review.updatedAt,
            "headline": review.title,
            "reviewBody": review.content, // Full review content
            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/reviews/${review.slug}`, // Canonical URL
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/reviews/${review.slug}` // Canonical URL
            },
            "publisher": {
              "@type": "Organization",
              "name": "Fair Game Price Index", // Your organization name
              // Add publisher logo if available
              // "logo": {
              //   "@type": "ImageObject",
              //   "url": "https://yourwebsite.com/logo.png" // Replace with your logo URL
              // }
            },
            // Add aggregateRating if you had a rating system (not applicable here based on objective)
            // Add positiveNotes and negativeNotes if you want to highlight pros/cons
            "positiveNotes": review.pros && review.pros.length > 0 ? {
               "@type": "ItemList",
               "itemListElement": review.pros.map(pro => ({
                 "@type": "ListItem",
                 "item": pro
               }))
            } : undefined,
             "negativeNotes": review.cons && review.cons.length > 0 ? {
               "@type": "ItemList",
               "itemListElement": review.cons.map(con => ({
                 "@type": "ListItem",
                 "item": con
               }))
            } : undefined,
             "image": review.featuredImage ? {
               "@type": "ImageObject",
               "url": `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${review.featuredImage}`,
               // Add width and height if known
             } : undefined,
             // Add video if YouTube video ID is available
             "video": review.youtubeVideoId ? {
               "@type": "VideoObject",
               "embedUrl": `https://www.youtube.com/embed/${review.youtubeVideoId}`,
               "name": review.title, // Or video title
               "description": review.quickVerdict || review.title, // Or video description
               // Add uploadDate, duration, thumbnailUrl if available
             } : undefined,
          })
        }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
          </li>
          <li className="flex items-center">
            <Link href="/reviews" className="text-blue-600 hover:underline">All Reviews</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
          </li>
          <li className="flex items-center">
            <span className="text-gray-900">{review.title}</span>
          </li>
        </ol>
      </nav>


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
        <Markdown>{review.content}</Markdown>
      </div>

      {(review.pros && review.pros.length > 0) && (
        <div className="mb-8"> {/* Adjusted spacing */}
          <h2 className="text-2xl font-semibold mb-3 text-green-700">Pros:</h2> {/* Adjusted spacing */}
          <ul className="list-disc list-inside text-lg text-green-600 space-y-2"> {/* Adjusted spacing */}
            {review.pros.map((pro, index) => (
              <li key={index}>{pro}</li>
            ))}
          </ul>
        </div>
      )}

      {(review.cons && review.cons.length > 0) && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-red-700">Cons:</h2>
          <ul className="list-disc list-inside text-lg text-red-600 space-y-2">
            {review.cons.map((con, index) => (
              <li key={index}>{con}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Social Sharing Buttons */}
      <div className="mt-8 border-t pt-4 flex items-center space-x-4">
        <span className="text-gray-600">Share:</span>
        <a
          href={`https://twitter.com/intent/tweet?url=${process.env.NEXT_PUBLIC_BASE_URL}/reviews/${review.slug}&text=${encodeURIComponent(review.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          Twitter
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${process.env.NEXT_PUBLIC_BASE_URL}/reviews/${review.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-800 hover:text-blue-900"
        >
          Facebook
        </a>
      </div>

      {/* View Count Tracking */}
      <div className="text-sm text-gray-500 mt-4">
        <p>Views: {review.viewCount ?? 0}</p>
      </div>

      <div className="text-sm text-gray-500 mt-8 border-t pt-4">
        <p>Published: {new Date(review.publishedAt).toLocaleDateString()}</p>
        <p>Last Updated: {new Date(review.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
