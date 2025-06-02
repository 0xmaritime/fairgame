'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Review } from '../../types';
import Link from 'next/link';

interface AdminDashboardProps {
  session: any;
  reviews: Review[];
}

export default function AdminDashboard({ session, reviews }: AdminDashboardProps) {
  const [publishedReviews, setPublishedReviews] = useState<Review[]>(
    reviews.filter(review => review.status === 'published')
  );
  const [draftReviews, setDraftReviews] = useState<Review[]>(
    reviews.filter(review => review.status === 'draft')
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/api/auth/signin' });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Published Reviews</h2>
          <Link
            href="/admin/reviews/new"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            New Review
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedReviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <h3 className="text-xl font-bold mb-2">{review.title}</h3>
              <p className="text-gray-600 mb-2">{review.gameTitle}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(review.publishedAt || '').toLocaleDateString()}
                </span>
                <Link
                  href={`/admin/reviews/${review.slug}/edit`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Draft Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {draftReviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <h3 className="text-xl font-bold mb-2">{review.title}</h3>
              <p className="text-gray-600 mb-2">{review.gameTitle}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(review.updatedAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/admin/reviews/${review.slug}/edit`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
