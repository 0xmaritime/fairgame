'use client';

import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { GameReview } from '@/types/game-review';

interface AnalyticsData {
  totalReviews: number;
  totalByStatus: Record<GameReview['status'], number>;
  totalByTier: Record<GameReview['fairPriceTier'], number>;
  averagePriceByTier: Record<GameReview['fairPriceTier'], number | null>;
  recentActivity: { slug: string; title: string; updatedAt: string; status: GameReview['status'] }[];
  priceRangeCounts: {
    '<$10'?: number;
    '$10-$30'?: number;
    '$30-$60'?: number;
    '>$60'?: number;
    [key: string]: number | undefined; // Allow other string keys if necessary, but define known ones
  };
  publishingFrequency: {
    [key: string]: number; // YYYY-MM format
  };
}

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data: AnalyticsData = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={`Error loading analytics: ${error}`} />;
  }

  if (!stats) {
    return <ErrorMessage message="No analytics data available." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Reviews */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.totalReviews}</p>
      </div>

      {/* Reviews by Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Reviews by Status</h3>
        <ul>
          {Object.entries(stats.totalByStatus).map(([status, count]) => (
            <li key={status} className="flex justify-between">
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}:</span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reviews by Tier */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Reviews by Tier</h3>
        <ul>
          {Object.entries(stats.totalByTier).map(([tier, count]) => (
            <li key={tier} className="flex justify-between">
              <span>{tier}:</span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Average Price by Tier */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Average Price by Tier</h3>
        <ul>
          {Object.entries(stats.averagePriceByTier).map(([tier, price]) => (
            <li key={tier} className="flex justify-between">
              <span>{tier}:</span>
              <span>{price !== null ? `$${price.toFixed(2)}` : 'N/A'}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
        <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
        <ul>
          {stats.recentActivity.map(activity => (
            <li key={activity.slug} className="mb-2 pb-2 border-b last:border-b-0">
              <span className="font-medium">{activity.title}</span> ({activity.status})
              <span className="block text-sm text-gray-500">Updated: {new Date(activity.updatedAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Price Ranges (Simple List) */}
       <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Popular Price Ranges</h3>
        <ul>
          {Object.entries(stats.priceRangeCounts).sort(([rangeA], [rangeB]) => {
             // Define a specific order for price ranges
             const order: Record<string, number> = {'<$10': 1, '$10-$30': 2, '$30-$60': 3, '>$60': 4};
             return (order[rangeA] ?? 5) - (order[rangeB] ?? 5); // Use nullish coalescing for safety
          }).map(([range, count]) => (
            <li key={range} className="flex justify-between">
              <span>{range}:</span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </div>

       {/* Publishing Frequency (Simple List) */}
       <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Publishing Frequency (Monthly)</h3>
        <ul>
          {Object.entries(stats.publishingFrequency).map(([monthYear, count]) => (
            <li key={monthYear} className="flex justify-between">
              <span>{monthYear}:</span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* TODO: Add simple charts/graphs here */}
    </div>
  );
};

export default AdminStats;
