import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Review } from '@/types';
import AdminDashboard from './AdminDashboard'; // Import the client component
import { getAllReviews } from '../api/reviews/lib/reviews'; // Import server-side fetch function

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

  const reviews: Review[] = await getAllReviews(); // Fetch reviews server-side

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

      {/* Render the client component and pass the fetched reviews */}
      <AdminDashboard session={session} reviews={reviews} />
    </div>
  );
}
