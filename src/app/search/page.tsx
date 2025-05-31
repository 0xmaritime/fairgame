'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GameReview } from '@/types/game-review';
import ReviewCard from '@/components/ReviewCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';

interface SearchResult extends GameReview {
  highlights?: {
    title?: string;
    gameTitle?: string;
    content?: string;
  };
}

const SearchResultsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await res.json();
        setResults(data.results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && results.length === 0 && (
        <EmptyState message={`No results found for "${query}".`} />
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <p className="text-gray-600 mb-6">{results.length} result{results.length !== 1 ? 's' : ''} found.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((review) => (
              <ReviewCard key={review.slug} review={review} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
