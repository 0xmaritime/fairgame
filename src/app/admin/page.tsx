'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { GameReview } from '@/types/game-review';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [allReviews, setAllReviews] = useState<GameReview[]>([]);
  const [publishedReviews, setPublishedReviews] = useState<GameReview[]>([]);
  const [draftReviews, setDraftReviews] = useState<GameReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('adminAuthenticated');
    if (storedAuth === 'true') {
      setAuthenticated(true);
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        localStorage.setItem('adminAuthenticated', 'true');
        setAuthenticated(true);
        fetchReviews();
      } else {
        const errorData = await res.json();
        setAuthError(errorData.message || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('An error occurred during authentication.');
    }
  };

  useEffect(() => {
    setPublishedReviews(allReviews.filter(review => review.status === 'published'));
    setDraftReviews(allReviews.filter(review => review.status === 'draft'));
  }, [allReviews]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews?status=all', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const responseData = await res.json();
      setAllReviews(Array.isArray(responseData.reviews) ? responseData.reviews : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const reviewToDelete = allReviews.find(r => r.slug === slug);
      if (!reviewToDelete) {
        throw new Error('Review not found');
      }

      const res = await fetch(`/api/reviews/${slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete review');
      }

      if (reviewToDelete.featuredImage) {
        try {
          await fetch(`/api/upload?filename=${reviewToDelete.featuredImage}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error('Failed to delete image:', err instanceof Error ? err.message : 'Unknown error');
        }
      }

      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const handlePublish = async (slug: string) => {
    try {
      const res = await fetch(`/api/reviews/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'published',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to publish review');
      }

      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish review');
    }
  };

  const handleUnpublish = async (slug: string) => {
    try {
      const res = await fetch(`/api/reviews/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'draft',
          updatedAt: new Date().toISOString()
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to unpublish review');
      }

      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish review');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          {authError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{authError}</div>}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link
            href="/admin/new"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            New Review
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Published Reviews</h2>
          {loading ? (
            <p>Loading...</p>
          ) : publishedReviews.length === 0 ? (
            <p>No published reviews found.</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {publishedReviews.map((review) => (
                    <tr key={review.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/admin/edit/${review.slug}`} className="text-blue-600 hover:text-blue-900">
                          {review.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{review.gameTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{review.fairPriceTier}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleUnpublish(review.slug)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                        >
                          Unpublish
                        </button>
                        <button
                          onClick={() => handleDelete(review.slug)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Draft Reviews</h2>
          {loading ? (
            <p>Loading...</p>
          ) : draftReviews.length === 0 ? (
            <p>No draft reviews found.</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {draftReviews.map((review) => (
                    <tr key={review.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/admin/edit/${review.slug}`} className="text-blue-600 hover:text-blue-900">
                          {review.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{review.gameTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{review.fairPriceTier}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handlePublish(review.slug)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleDelete(review.slug)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
