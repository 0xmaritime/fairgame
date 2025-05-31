'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AdvancedFiltersProps {
  availableTiers: string[];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ availableTiers }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]); // Placeholder
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']); // Placeholder
  const [sortBy, setSortBy] = useState<string>('publishedAtDesc'); // Default sort

  useEffect(() => {
    // Initialize filters from URL params
    const tiers = searchParams.get('tiers')?.split(',') || [];
    setSelectedTiers(tiers);

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      setPriceRange([parseFloat(minPrice), parseFloat(maxPrice)]);
    }

    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    setDateRange([startDate, endDate]);

    const sort = searchParams.get('sortBy') || 'publishedAtDesc';
    setSortBy(sort);

  }, [searchParams]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams(searchParams.toString());

    if (selectedTiers.length > 0) {
      params.set('tiers', selectedTiers.join(','));
    } else {
      params.delete('tiers');
    }

    // Placeholder for price range
    // params.set('minPrice', priceRange[0].toString());
    // params.set('maxPrice', priceRange[1].toString());

    // Placeholder for date range
    // if (dateRange[0]) params.set('startDate', dateRange[0]); else params.delete('startDate');
    // if (dateRange[1]) params.set('endDate', dateRange[1]); else params.delete('endDate');

    params.set('sortBy', sortBy);

    router.push(`?${params.toString()}`, { scroll: false });

  }, [selectedTiers, priceRange, dateRange, sortBy, router, searchParams]);

  const handleTierChange = (tier: string) => {
    setSelectedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const handleClearFilters = () => {
    setSelectedTiers([]);
    setPriceRange([0, 100]); // Reset placeholder
    setDateRange(['', '']); // Reset placeholder
    setSortBy('publishedAtDesc'); // Reset default sort
    router.push('?', { scroll: false }); // Clear all params
  };

  return (
    <div className="mb-6 border rounded-md p-4">
      <button
        className="w-full text-left font-bold py-2 flex justify-between items-center"
        onClick={() => setShowFilters(!showFilters)}
      >
        Advanced Filters
        <span>{showFilters ? '▲' : '▼'}</span>
      </button>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Price Range Slider Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="mt-1">
              {/* Slider component will go here */}
              <p>Min: {priceRange[0]}, Max: {priceRange[1]}</p>
            </div>
          </div>

          {/* Date Range Picker Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Publication Date</label>
            <div className="mt-1">
              {/* Date picker component will go here */}
              <p>Start: {dateRange[0]}, End: {dateRange[1]}</p>
            </div>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Price Tier</label>
            <div className="mt-1 space-y-2">
              {availableTiers.map(tier => (
                <div key={tier} className="flex items-center">
                  <input
                    id={`tier-${tier}`}
                    name="tiers"
                    type="checkbox"
                    value={tier}
                    checked={selectedTiers.includes(tier)}
                    onChange={() => handleTierChange(tier)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor={`tier-${tier}`} className="ml-2 block text-sm text-gray-900">
                    {tier}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">Sort By</label>
            <select
              id="sort-by"
              name="sort-by"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="publishedAtDesc">Newest</option>
              <option value="publishedAtAsc">Oldest</option>
              <option value="priceAsc">Price (Low to High)</option>
              <option value="priceDesc">Price (High to Low)</option>
              <option value="alphabeticalAsc">Alphabetical (A-Z)</option>
              <option value="alphabeticalDesc">Alphabetical (Z-A)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="col-span-full">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={handleClearFilters}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
