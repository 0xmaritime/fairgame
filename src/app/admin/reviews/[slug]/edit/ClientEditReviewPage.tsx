'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/AdminLayout';
import ReviewForm from '@/components/ReviewForm';
import { GameReview } from '@/types/game-review';

export default function ClientEditReviewPage({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [review, setReview] = useState<GameReview | null>(null);
  const [loadingReview, setLoadingReview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReview();
    } else if (status === 'unauthenticated') {
      router.push('/admin');
    }
  }, [status, slug]);

  const fetchReview = async () => {
    setLoadingReview(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${slug}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch review');
      }
      const data: GameReview = await res.json();
      setReview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch review');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/reviews/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      router.push('/admin/reviews');
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  };

  if (status === 'loading' || loadingReview) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          Error: {error}
        </div>
      </AdminLayout>
    );
  }

  if (!review) {
    return (
      <AdminLayout>
        <p className="text-center text-gray-600">Review not found.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ReviewForm initialData={review} onSubmit={handleSubmit} />
    </AdminLayout>
  );
} 