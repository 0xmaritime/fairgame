'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Review, ReviewFormData } from '../types';
import FairPriceBadge from './FairPriceBadge';
import { ErrorMessage } from './ErrorMessage';

interface ReviewFormProps {
  initialData?: Review;
  onSubmit: (data: ReviewFormData) => Promise<void>;
}

const fairPriceTiers: Review['fairPriceTier'][] = [
  'Premium',
  'Standard',
  'Budget',
  'Free-to-Play',
  'Wait-for-Sale',
  'Never-Buy',
  'Subscription-Only',
];

const ReviewForm: React.FC<ReviewFormProps> = ({ initialData, onSubmit }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    title: initialData?.title || '',
    gameTitle: initialData?.gameTitle || '',
    fairPriceTier: initialData?.fairPriceTier || 'Standard',
    fairPriceAmount: initialData?.fairPriceAmount,
    quickVerdict: initialData?.quickVerdict || '',
    content: initialData?.content || '',
    featuredImage: undefined,
    youtubeVideoId: initialData?.youtubeVideoId || '',
    pros: initialData?.pros || [],
    cons: initialData?.cons || [],
    status: initialData?.status || 'draft', // Add status with default
  });
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.featuredImage || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        gameTitle: initialData.gameTitle || '',
        fairPriceTier: initialData.fairPriceTier || 'Standard',
        fairPriceAmount: initialData.fairPriceAmount,
        quickVerdict: initialData.quickVerdict || '',
        content: initialData.content || '',
        featuredImage: undefined,
        youtubeVideoId: initialData.youtubeVideoId || '',
        pros: initialData.pros || [],
        cons: initialData.cons || [],
        status: initialData.status || 'draft', // Include status
      });
      setImagePreview(initialData.featuredImage || null);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'pros' | 'cons') => {
    const target = e.target as HTMLTextAreaElement;
    const { value } = target;
    const items = value.split('\n').map(item => item.trim()).filter(item => item !== '');
    setFormData((prev) => ({ ...prev, [field]: items }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      setFormData((prev) => ({ ...prev, featuredImage: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, featuredImage: undefined }));
      setImagePreview(initialData?.featuredImage || null);
    }
  };

  const handleSubmit = async (e: FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create a copy of formData and set the status
      const dataToSubmit: ReviewFormData = { ...formData, status };
      await onSubmit(dataToSubmit);
      setSuccess(`Review ${initialData ? 'updated' : 'created'} successfully!`);
      if (!initialData) {
        router.push('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {initialData?.id ? 'Edit Review' : 'Create Review'}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

      <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="gameTitle" className="block text-sm font-medium mb-2">
            Game Title
          </label>
          <input
            id="gameTitle"
            name="gameTitle"
            type="text"
            value={formData.gameTitle}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="fairPriceTier" className="block text-sm font-medium mb-2">
            Price Tier
          </label>
          <select
            id="fairPriceTier"
            name="fairPriceTier" // Add name attribute
            value={formData.fairPriceTier || 'Standard'}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          >
            {fairPriceTiers.map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fairPriceAmount" className="block text-sm font-medium mb-2">
            Price Amount (optional)
          </label>
          <input
            id="fairPriceAmount"
            name="fairPriceAmount"
            type="number"
            value={formData.fairPriceAmount || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="quickVerdict" className="block text-sm font-medium mb-2">
            Quick Verdict
          </label>
          <textarea
            id="quickVerdict"
            name="quickVerdict"
            value={formData.quickVerdict}
            onChange={handleChange}
            className="w-full h-24 p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full h-96 p-4 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="youtubeVideoId" className="block text-sm font-medium mb-2">
            YouTube Video ID (optional)
          </label>
          <input
            id="youtubeVideoId"
            name="youtubeVideoId"
            type="text"
            value={formData.youtubeVideoId}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium mb-2">
            Featured Image
          </label>
          <input
            type="file"
            id="featuredImage"
            name="featuredImage"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-w-xs rounded" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="pros" className="block text-sm font-medium mb-2">
            Pros (one per line)
          </label>
          <textarea
            id="pros"
            name="pros"
            value={formData.pros.join('\n')} // Join array for textarea
            onChange={(e) => handleArrayChange(e, 'pros')}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Enter pros, one per line"
          />
        </div>

        <div>
          <label htmlFor="cons" className="block text-sm font-medium mb-2">
            Cons (one per line)
          </label>
          <textarea
            id="cons"
            name="cons"
            value={formData.cons.join('\n')} // Join array for textarea
            onChange={(e) => handleArrayChange(e, 'cons')}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Enter cons, one per line"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
