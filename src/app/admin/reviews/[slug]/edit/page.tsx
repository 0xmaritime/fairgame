'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import ReviewForm from '@/components/ReviewForm';
import { GameReview } from '@/types/game-review';

interface EditReviewPageProps {
  params: {
    slug: string;
  };
}

export default function EditReviewPage({ params }: EditReviewPageProps) {
  const router = useRouter();
  const { slug } = params;
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [review, setReview] = useState<GameReview | null>(null);
  const [loadingReview, setLoadingReview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('adminAuthenticated');
    if (storedAuth === 'true') {
      setAuthenticated(true);
      fetchReview();
    } else {
      setLoadingAuth(false);
      router.push('/admin'); // Redirect to login if not authenticated
    }
  }, []);

  const fetchReview = async () => {
    setLoadingReview(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${slug}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/admin'); // Redirect to dashboard if review not found
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
      setLoadingAuth(false); // Auth check is done after review fetch
    }
  };

  if (loadingAuth || loadingReview) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!authenticated) {
    return null; // Already redirected by router.push
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
      <ReviewForm initialData={review} />
    </AdminLayout>
  );
}
