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
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for authentication status (e.g., from a cookie or session storage)
    // For this example, we'll assume unauthenticated on first load and require login.
    // In a real app, you'd check a secure token.
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

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data: GameReview[] = await res.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete review');
      }
      setReviews((prev) => prev.filter((review) => review.slug !== slug));
    } catch (err: any) {
      setError(err.message);
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Link href="/admin/reviews/new" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-6 inline-block">
        Create New Review
      </Link>

      {loading && <p className="text-gray-600">Loading reviews...</p>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      {!loading && reviews.length === 0 && (
        <p className="text-gray-600">No reviews found. Create one!</p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 border-b">Title</th>
                <th className="py-3 px-4 border-b">Game Title</th>
                <th className="py-3 px-4 border-b">Tier</th>
                <th className="py-3 px-4 border-b">Published</th>
                <th className="py-3 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{review.title}</td>
                  <td className="py-3 px-4">{review.gameTitle}</td>
                  <td className="py-3 px-4">{review.fairPriceTier}</td>
                  <td className="py-3 px-4">{new Date(review.publishedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link href={`/admin/reviews/${review.slug}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(review.slug)}
                      className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
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
    </AdminLayout>
  );
}
