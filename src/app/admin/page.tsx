import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import ReviewCard from '@/components/ReviewCard';
import { Review } from '@/types';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Please sign in to access the admin dashboard.</p>
      </div>
    );
  }

  // In a real implementation, we would fetch reviews from API
  const reviews: Review[] = []; 

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link 
          href="/admin/edit/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Review
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Review Management</h2>
        {reviews.length === 0 ? (
          <p>No reviews found.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border rounded-lg p-4">
                <ReviewCard review={review} />
                <div className="mt-4 flex space-x-2">
                  <Link 
                    href={`/admin/edit/${review.slug}`} 
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    Edit
                  </Link>
                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
