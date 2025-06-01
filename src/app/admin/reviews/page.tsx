'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
    // TODO: Implement search
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    // TODO: Implement filtering
  };

  const handleBatchAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedReviews.length === 0) return;
    
    setLoading(true);
    try {
      // TODO: Implement batch actions
      console.log(`Performing ${action} on:`, selectedReviews);
    } catch (error) {
      console.error('Error performing batch action:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      // TODO: Implement pagination
      const nextPage = page + 1;
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Review Management</h1>
        <Button onClick={() => router.push('/admin/reviews/new')}>
          Create New Review
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedReviews.length > 0 && (
        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleBatchAction('publish')}
            disabled={loading}
          >
            Publish Selected
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBatchAction('unpublish')}
            disabled={loading}
          >
            Unpublish Selected
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleBatchAction('delete')}
            disabled={loading}
          >
            Delete Selected
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedReviews(reviews.map((r) => r.id));
                    } else {
                      setSelectedReviews([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedReviews.includes(review.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReviews([...selectedReviews, review.id]);
                      } else {
                        setSelectedReviews(selectedReviews.filter((id) => id !== review.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{review.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      review.status === 'published'
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    {review.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(review.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/reviews/${review.slug}/edit`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
} 