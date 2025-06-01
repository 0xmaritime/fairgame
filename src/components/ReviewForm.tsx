'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { GameReview } from '@/types/game-review';
import FairPriceBadge from './FairPriceBadge';
import TextareaAutosize from 'react-textarea-autosize';

interface ReviewFormProps {
  initialData?: GameReview;
}

const fairPriceTiers: GameReview['fairPriceTier'][] = [
  'Premium',
  'Standard',
  'Budget',
  'Free-to-Play',
  'Wait-for-Sale',
  'Never-Buy',
];

const ReviewForm: React.FC<ReviewFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<GameReview>>(initialData || {
    title: '',
    gameTitle: '',
    fairPriceTier: 'Standard',
    fairPriceAmount: undefined,
    quickVerdict: '',
    content: '',
    featuredImage: '',
    youtubeVideoId: '',
    pros: [''],
    cons: [''],
    status: 'draft',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.featuredImage ? `/uploads/${initialData.featuredImage}` : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        pros: initialData.pros && initialData.pros.length > 0 ? initialData.pros : [''],
        cons: initialData.cons && initialData.cons.length > 0 ? initialData.cons : [''],
        status: initialData.status || 'draft',
      });
      setImagePreview(initialData.featuredImage ? `/uploads/${initialData.featuredImage}` : null);
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayItemChange = (e: ChangeEvent<HTMLInputElement>, field: 'pros' | 'cons', index: number) => {
    const { value } = e.target;
    setFormData((prev) => {
      const currentArray = [...(prev[field] || [])];
      currentArray[index] = value;
      return { ...prev, [field]: currentArray };
    });
  };

  const handleAddArrayItem = (field: 'pros' | 'cons') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  };

  const handleRemoveArrayItem = (field: 'pros' | 'cons', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) {
      return formData.featuredImage || null;
    }

    const data = new FormData();
    data.append('file', imageFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Image upload failed');
      }

      const result = await res.json();
      return result.filename;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadedFilename = await handleImageUpload();
      if (imageFile && !uploadedFilename) {
        setLoading(false);
        return;
      }

      const reviewToSave: Partial<GameReview> = {
        ...formData,
        id: formData.id || undefined,
        slug: formData.slug || undefined,
        featuredImage: uploadedFilename || formData.featuredImage || '',
        fairPriceAmount: formData.fairPriceAmount ? Number(formData.fairPriceAmount) : undefined,
        pros: (formData.pros || []).filter(item => item.trim() !== ''),
        cons: (formData.cons || []).filter(item => item.trim() !== ''),
        updatedAt: new Date().toISOString(),
      };

      if (formData.status === 'published') {
        reviewToSave.publishedAt = new Date().toISOString();
      }

      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/reviews/${initialData.slug}` : '/api/reviews';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewToSave),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${initialData ? 'update' : 'create'} review`);
      }

      const result = await res.json();
      setSuccess(`Review ${initialData ? 'updated' : 'created'} successfully!`);
      if (!initialData) {
        router.push(`/admin/edit/${result.slug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{initialData ? 'Edit Review' : 'Create New Review'}</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="gameTitle" className="block text-gray-700 text-sm font-bold mb-2">Game Title:</label>
        <input
          type="text"
          id="gameTitle"
          name="gameTitle"
          value={formData.gameTitle || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="fairPriceTier" className="block text-gray-700 text-sm font-bold mb-2">Price Tier:</label>
        <select
          id="fairPriceTier"
          name="fairPriceTier"
          value={formData.fairPriceTier || 'Standard'}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          {fairPriceTiers.map((tier) => (
            <option key={tier} value={tier}>{tier}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="fairPriceAmount" className="block text-gray-700 text-sm font-bold mb-2">Price Amount (optional):</label>
        <input
          type="number"
          id="fairPriceAmount"
          name="fairPriceAmount"
          value={formData.fairPriceAmount || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          min="0"
          step="0.01"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="quickVerdict" className="block text-gray-700 text-sm font-bold mb-2">Quick Verdict:</label>
        <TextareaAutosize
          id="quickVerdict"
          name="quickVerdict"
          value={formData.quickVerdict || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          minRows={2}
          maxRows={4}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content (Markdown):</label>
        <textarea
          id="content"
          name="content"
          value={formData.content || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={10}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="youtubeVideoId" className="block text-gray-700 text-sm font-bold mb-2">YouTube Video ID (optional):</label>
        <input
          type="text"
          id="youtubeVideoId"
          name="youtubeVideoId"
          value={formData.youtubeVideoId || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Featured Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Preview" className="max-w-xs rounded" />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Pros:</label>
        {(formData.pros || ['']).map((pro, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={pro}
              onChange={(e) => handleArrayItemChange(e, 'pros', index)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={`Pro ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveArrayItem('pros', index)}
              className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem('pros')}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Pro
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Cons:</label>
        {(formData.cons || ['']).map((con, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={con}
              onChange={(e) => handleArrayItemChange(e, 'cons', index)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={`Con ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveArrayItem('cons', index)}
              className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem('cons')}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Con
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={formData.status === 'draft'}
              onChange={handleChange}
              className="form-radio"
            />
            <span className="ml-2">Draft</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="status"
              value="published"
              checked={formData.status === 'published'}
              onChange={handleChange}
              className="form-radio"
            />
            <span className="ml-2">Published</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? 'Saving...' : initialData ? 'Update Review' : 'Create Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
