'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/AdminLayout';
import ReviewForm from '@/components/ReviewForm';

export default function NewReviewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    router.push('/admin');
    return null;
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create review');
      }

      router.push('/admin/reviews');
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <ReviewForm onSubmit={handleSubmit} />
    </AdminLayout>
  );
}
