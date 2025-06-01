'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import AdminLayout from '@/components/AdminLayout';
import { GameReview } from '@/types/game-review';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [allReviews, setAllReviews] = useState<GameReview[]>([]);
  const [publishedReviews, setPublishedReviews] = useState<GameReview[]>([]);
  const [draftReviews, setDraftReviews] = useState<GameReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReviews();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError(result.error);
      }
    } catch (err) {
      setAuthError('An error occurred during authentication.');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin');
  };

  useEffect(() => {
    setPublishedReviews(allReviews.filter(review => review.status === 'published'));
    setDraftReviews(allReviews.filter(review => review.status === 'draft'));
  }, [allReviews]);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setAllReviews(data.reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          {authError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{authError}</div>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
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
    </AdminLayout>
  );
}
