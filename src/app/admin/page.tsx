'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { GameReview } from '@/types/game-review';
import Link from 'next/link';
import AdminStats from '@/components/admin/AdminStats';

export default function AdminDashboard() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [allReviews, setAllReviews] = useState<GameReview[]>([]); // Store all reviews
  const [publishedReviews, setPublishedReviews] = useState<GameReview[]>([]);
  const [draftReviews, setDraftReviews] = useState<GameReview[]>([]);
  const [scheduledReviews, setScheduledReviews] = useState<GameReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]); // State for selected reviews
  const [bulkActionTier, setBulkActionTier] = useState<GameReview['fairPriceTier'] | ''>(''); // State for bulk tier change

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

  useEffect(() => {
    // Filter reviews by status whenever allReviews changes
    setPublishedReviews(allReviews.filter(review => review.status === 'published'));
    setDraftReviews(allReviews.filter(review => review.status === 'draft'));
    setScheduledReviews(allReviews.filter(review => review.status === 'scheduled'));
  }, [allReviews]);


  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all reviews for admin view
      // Note: The /api/reviews endpoint now returns { reviews: [], total: ..., page: ..., limit: ... }
      const res = await fetch('/api/reviews?status=all&limit=1000', { cache: 'no-store' }); // Fetch a large limit to get all for admin
      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const responseData = await res.json();
      // Ensure responseData.reviews is an array before setting
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
      // First get the review to access its featuredImage
      const reviewToDelete = allReviews.find(r => r.slug === slug);
      if (!reviewToDelete) {
        throw new Error('Review not found');
      }

      // Delete the review via API
      const res = await fetch(`/api/reviews/${slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete review');
      }

      // If review deleted successfully, try to delete the associated image
      if (reviewToDelete.featuredImage) {
        try {
          await fetch(`/api/upload?filename=${reviewToDelete.featuredImage}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error('Failed to delete image:', err instanceof Error ? err.message : 'Unknown error');
        }
      }

      // Update local state by refetching all reviews
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const handleDuplicateReview = async (slug: string) => {
    if (!window.confirm('Are you sure you want to duplicate this review?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Duplication failed');
      }

      const newReview = await res.json();
      setSuccess(`Review "${newReview.title}" duplicated successfully!`);
      fetchReviews(); // Refresh the list to show the new duplicate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate review');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEditTier = async (slug: string, newTier: GameReview['fairPriceTier']) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/reviews/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fairPriceTier: newTier, updatedAt: new Date().toISOString() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Quick edit tier failed');
      }

      setSuccess(`Successfully updated tier for review with slug "${slug}".`);
      fetchReviews(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform quick edit tier');
    } finally {
      setLoading(false);
    }
  };


  const handleCancelSchedule = async (review: GameReview) => {
     if (!window.confirm(`Are you sure you want to cancel the schedule for "${review.title}"?`)) {
      return;
    }

    try {
      const updatedReview: Partial<GameReview> = {
        slug: review.slug, // Identify the review
        status: 'draft', // Change status to draft
        scheduledPublishAt: undefined, // Clear scheduled time
        updatedAt: new Date().toISOString(), // Update timestamp
      };

      const res = await fetch(`/api/reviews/${review.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedReview),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to cancel schedule');
      }

      // Update local state by refetching all reviews
      fetchReviews();
      setSuccess(`Schedule for "${review.title}" cancelled.`);

    } catch (err) {
       setError(err instanceof Error ? err.message : 'Failed to cancel schedule');
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

  const handleCheckboxChange = (reviewId: string) => {
    setSelectedReviewIds(prev =>
      prev.includes(reviewId) ? prev.filter(id => id !== reviewId) : [...prev, reviewId]
    );
  };

  const handleSelectAll = (reviews: GameReview[], checked: boolean) => {
    if (checked) {
      setSelectedReviewIds(reviews.map(review => review.id));
    } else {
      setSelectedReviewIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviewIds.length === 0) {
      setError('No reviews selected for deletion.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedReviewIds.length} selected reviews?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Fetch selected reviews to get featuredImage filenames before deleting
      const reviewsToDelete = allReviews.filter(review => selectedReviewIds.includes(review.id));

      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedReviewIds }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Bulk deletion failed');
      }

      // Attempt to delete associated images
      for (const review of reviewsToDelete) {
        if (review.featuredImage) {
           try {
              await fetch(`/api/upload?filename=${review.featuredImage}`, {
                method: 'DELETE',
              });
            } catch (err) {
              console.error(`Failed to delete image for ${review.slug}:`, err instanceof Error ? err.message : 'Unknown error');
            }
        }
      }


      setSuccess(`Successfully deleted ${selectedReviewIds.length} reviews.`);
      setSelectedReviewIds([]); // Clear selection
      fetchReviews(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk deletion');
    } finally {
      setLoading(false);
    }
  };

   const handleBulkChangeTier = async () => {
    if (selectedReviewIds.length === 0) {
      setError('No reviews selected for tier change.');
      return;
    }
    if (!bulkActionTier) {
       setError('Please select a tier for bulk change.');
       return;
    }
    if (!window.confirm(`Are you sure you want to change the tier for ${selectedReviewIds.length} selected reviews to "${bulkActionTier}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedReviewIds, fairPriceTier: bulkActionTier }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Bulk tier change failed');
      }

      setSuccess(`Successfully changed tier for ${selectedReviewIds.length} reviews to "${bulkActionTier}".`);
      setSelectedReviewIds([]); // Clear selection
      setBulkActionTier(''); // Reset tier selection
      fetchReviews(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk tier change');
    } finally {
      setLoading(false);
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

  const fairPriceTiers: GameReview['fairPriceTier'][] = [
    'Premium', 'Standard', 'Budget', 'Free-to-Play',
    'Wait-for-Sale', 'Never-Buy', 'Subscription-Only',
  ];


  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Admin Statistics */}
      <AdminStats />

      <div className="mt-8 flex justify-between items-center">
        <Link href="/admin/reviews/new" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block">
          Create New Review
        </Link>

        {/* Bulk Actions */}
        <div className="flex items-center space-x-4">
           {selectedReviewIds.length > 0 && (
             <>
               <button
                 onClick={handleBulkDelete}
                 className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                 disabled={loading}
               >
                 Delete Selected ({selectedReviewIds.length})
               </button>

               <select
                 value={bulkActionTier}
                 onChange={(e) => setBulkActionTier(e.target.value as GameReview['fairPriceTier'])}
                 className="py-2 px-3 border rounded text-sm"
               >
                 <option value="">Change Tier...</option>
                 {fairPriceTiers.map(tier => (
                   <option key={tier} value={tier}>{tier}</option>
                 ))}
               </select>
                <button
                 onClick={handleBulkChangeTier}
                 className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm"
                 disabled={loading || !bulkActionTier}
               >
                 Apply Tier Change
               </button>
             </>
           )}
        </div>
      </div>

      {loading && <p className="text-gray-600">Loading reviews...</p>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}


      {/* Scheduled Reviews Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Scheduled Reviews ({scheduledReviews.length})</h2>
        {!loading && scheduledReviews.length === 0 && (
          <p className="text-gray-600">No reviews are currently scheduled.</p>
        )}
         {!loading && scheduledReviews.length > 0 && (
           <div className="overflow-x-auto">
             <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
               <thead>
                 <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4 border-b">
                       <input
                         type="checkbox"
                         onChange={(e) => handleSelectAll(scheduledReviews, e.target.checked)}
                         checked={selectedReviewIds.length === scheduledReviews.length && scheduledReviews.length > 0}
                         className="mr-2"
                       />
                       Title
                    </th>
                   <th className="py-3 px-4 border-b">Game Title</th>
                   <th className="py-3 px-4 border-b">Scheduled For</th>
                   <th className="py-3 px-4 border-b">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {scheduledReviews.map((review) => (
                   <tr key={review.id} className="border-b border-gray-200 hover:bg-gray-50">
                     <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedReviewIds.includes(review.id)}
                          onChange={() => handleCheckboxChange(review.id)}
                          className="mr-2"
                        />
                        {review.title}
                     </td>
                     <td className="py-3 px-4">{review.gameTitle}</td>
                     <td className="py-3 px-4">{review.scheduledPublishAt ? new Date(review.scheduledPublishAt).toLocaleString() : 'N/A'}</td>
                     <td className="py-3 px-4 flex space-x-2">
                       <Link href={`/admin/reviews/${review.slug}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded">
                         Edit
                       </Link>
                        <button
                         onClick={() => handleDuplicateReview(review.slug)}
                         className="bg-gray-500 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded"
                         disabled={loading}
                       >
                         Duplicate
                       </button>
                       <button
                         onClick={() => handleCancelSchedule(review)}
                         className="bg-yellow-500 hover:bg-yellow-700 text-white text-sm py-1 px-3 rounded"
                         disabled={loading}
                       >
                         Cancel Schedule
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
      </div>


      {/* Draft Reviews Section */}
       <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Draft Reviews ({draftReviews.length})</h2>
        {!loading && draftReviews.length === 0 && (
          <p className="text-gray-600">No reviews are currently in draft.</p>
        )}
         {!loading && draftReviews.length > 0 && (
           <div className="overflow-x-auto">
             <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
               <thead>
                 <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4 border-b">
                       <input
                         type="checkbox"
                         onChange={(e) => handleSelectAll(draftReviews, e.target.checked)}
                         checked={selectedReviewIds.length === draftReviews.length && draftReviews.length > 0}
                         className="mr-2"
                       />
                       Title
                    </th>
                   <th className="py-3 px-4 border-b">Game Title</th>
                   <th className="py-3 px-4 border-b">Last Updated</th>
                   <th className="py-3 px-4 border-b">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {draftReviews.map((review) => (
                   <tr key={review.id} className="border-b border-gray-200 hover:bg-gray-50">
                     <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedReviewIds.includes(review.id)}
                          onChange={() => handleCheckboxChange(review.id)}
                          className="mr-2"
                        />
                        {review.title}
                     </td>
                     <td className="py-3 px-4">{review.gameTitle}</td>
                     <td className="py-3 px-4">{new Date(review.updatedAt).toLocaleDateString()}</td>
                     <td className="py-3 px-4 flex space-x-2">
                       <Link href={`/admin/reviews/${review.slug}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded">
                         Edit
                       </Link>
                        <button
                         onClick={() => handleDuplicateReview(review.slug)}
                         className="bg-gray-500 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded"
                         disabled={loading}
                       >
                         Duplicate
                       </button>
                       <button
                         onClick={() => handleDelete(review.slug)}
                         className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                         disabled={loading}
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


      {/* Published Reviews Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Published Reviews ({publishedReviews.length})</h2>
        {!loading && publishedReviews.length === 0 && (
          <p className="text-gray-600">No reviews are currently published.</p>
        )}
        {!loading && publishedReviews.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                   <th className="py-3 px-4 border-b">
                       <input
                         type="checkbox"
                         onChange={(e) => handleSelectAll(publishedReviews, e.target.checked)}
                         checked={selectedReviewIds.length === publishedReviews.length && publishedReviews.length > 0}
                         className="mr-2"
                       />
                       Title
                    </th>
                  <th className="py-3 px-4 border-b">Game Title</th>
                   <th className="py-3 px-4 border-b">Tier</th>
                   <th className="py-3 px-4 border-b">Published At</th>
                   <th className="py-3 px-4 border-b">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {publishedReviews.map((review) => (
                   <tr key={review.id} className="border-b border-gray-200 hover:bg-gray-50">
                     <td className="py-3 px-4">
                       <input
                         type="checkbox"
                         onChange={(e) => handleSelectAll(publishedReviews, e.target.checked)}
                         checked={selectedReviewIds.length === publishedReviews.length && publishedReviews.length > 0}
                         className="mr-2"
                       />
                       {review.title}
                    </td>
                    <td className="py-3 px-4">{review.gameTitle}</td>
                    <td className="py-3 px-4">
                       <select
                         value={review.fairPriceTier}
                         onChange={(e) => handleQuickEditTier(review.slug, e.target.value as GameReview['fairPriceTier'])}
                         className="py-1 px-2 border rounded text-sm"
                         disabled={loading}
                       >
                         {fairPriceTiers.map(tier => (
                           <option key={tier} value={tier}>{tier}</option>
                         ))}
                       </select>
                    </td>
                    <td className="py-3 px-4">{new Date(review.publishedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Link href={`/admin/reviews/${review.slug}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded">
                        Edit
                      </Link>
                       <button
                         onClick={() => handleDuplicateReview(review.slug)}
                         className="bg-gray-500 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded"
                         disabled={loading}
                       >
                         Duplicate
                       </button>
                       <button
                         onClick={() => handleDelete(review.slug)}
                         className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                         disabled={loading}
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
    </AdminLayout>
  );
}

const fairPriceTiers: GameReview['fairPriceTier'][] = [
  'Premium', 'Standard', 'Budget', 'Free-to-Play',
  'Wait-for-Sale', 'Never-Buy', 'Subscription-Only',
];
