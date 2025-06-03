'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Review, ReviewFormData } from '@/types';
import ReviewForm from '@/components/ReviewForm';
import { ErrorMessage } from '@/components/ErrorMessage'; // Import ErrorMessage component

interface EditReviewPageProps {
  params: {
    slug: string;
  };
}

export default function EditReviewPage({ params }: EditReviewPageProps) {
  const { slug } = params;
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        // TODO: Implement fetching review data for editing
        // const res = await fetch(`/api/reviews/${slug}`);
        // if (!res.ok) {
        //   if (res.status === 404) {
        //     notFound();
        //   }
        //   throw new Error('Failed to fetch review');
        // }
        // const data = await res.json();
        // setReview(data as Review);
        setReview(null); // Placeholder
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <ErrorMessage message={error} />; // Use ErrorMessage component
  }

  if (!review) {
    // return <div>Review not found.</div>; // Or redirect to notFound()
  }

  const handleSubmit = async (formData: ReviewFormData) => {
    // TODO: Implement update logic
    console.log('Submitting:', formData);
  };

  return (
    <div>
      <h1>Edit Review: {slug}</h1>
      {/* Pass initial data to ReviewForm if review exists */}
      <ReviewForm initialData={review || undefined} onSubmit={handleSubmit} />
    </div>
  );
}
