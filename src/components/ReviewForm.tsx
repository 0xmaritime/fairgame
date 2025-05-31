'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { GameReview } from '@/types/game-review';
import FairPriceBadge from './FairPriceBadge';
import TextareaAutosize from 'react-textarea-autosize'; // Keep for quickVerdict
import ReviewTemplateSelector from './ReviewTemplateSelector'; // Import ReviewTemplateSelector

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
  'Subscription-Only',
];

const ReviewForm: React.FC<ReviewFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<GameReview>>(initialData || {
    title: '',
    gameTitle: '',
    fairPriceTier: 'Standard',
    fairPriceAmount: undefined,
    quickVerdict: '',
    content: '', // Renamed from reviewContent
    featuredImage: '',
    youtubeVideoId: '',
    pros: [''], // Initialize with one empty field
    cons: [''], // Initialize with one empty field
    status: 'draft', // Default status
    scheduledPublishAt: undefined,
    viewCount: 0,
    lastModifiedBy: undefined,
  });
  const [publishOption, setPublishOption] = useState<'now' | 'schedule'>(initialData?.status === 'scheduled' ? 'schedule' : 'now');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(
    initialData?.scheduledPublishAt ? new Date(initialData.scheduledPublishAt).toISOString().slice(0, 16) : '' // Format for datetime-local input
  );
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
        scheduledPublishAt: initialData.scheduledPublishAt,
        viewCount: initialData.viewCount || 0,
        lastModifiedBy: initialData.lastModifiedBy,
      });
      setImagePreview(initialData.featuredImage ? `/uploads/${initialData.featuredImage}` : null);
      setPublishOption(initialData.status === 'scheduled' ? 'schedule' : 'now');
      setScheduledDateTime(initialData.scheduledPublishAt ? new Date(initialData.scheduledPublishAt).toISOString().slice(0, 16) : '');
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Modified to handle individual input changes for dynamic fields
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
      [field]: [...(prev[field] || []), ''], // Add an empty string for a new field
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
      return formData.featuredImage || null; // Use existing image if no new file
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
        // If a new image was selected but upload failed
        setLoading(false);
        return;
      }

      const reviewToSave: Partial<GameReview> = {
        ...formData,
        id: formData.id || undefined, // Will be generated on POST if new
        slug: formData.slug || undefined, // Will be generated on POST if new
        // publishedAt and updatedAt will be handled by the API based on status
        featuredImage: uploadedFilename || formData.featuredImage || '', // Use uploaded, existing, or empty
        fairPriceAmount: formData.fairPriceAmount ? Number(formData.fairPriceAmount) : undefined,
        // Filter out empty strings from pros/cons arrays before saving
        pros: (formData.pros || []).filter(item => item.trim() !== ''),
        cons: (formData.cons || []).filter(item => item.trim() !== ''),
        viewCount: formData.viewCount || 0,
        lastModifiedBy: formData.lastModifiedBy,
      };

      // Handle scheduling logic
      if (publishOption === 'now') {
        reviewToSave.status = 'published';
        reviewToSave.publishedAt = new Date().toISOString();
        reviewToSave.scheduledPublishAt = undefined; // Clear scheduled date if publishing now
      } else { // schedule
        if (!scheduledDateTime) {
            setError('Please select a date and time to schedule the review.');
            setLoading(false);
            return;
        }
        const scheduledDate = new Date(scheduledDateTime);
        if (scheduledDate < new Date()) {
             setError('Scheduled date and time must be in the future.');
             setLoading(false);
             return;
        }
        reviewToSave.status = 'scheduled';
        reviewToSave.scheduledPublishAt = scheduledDate.toISOString();
        reviewToSave.publishedAt = undefined; // Clear published date if scheduled
      }
      reviewToSave.updatedAt = new Date().toISOString(); // Always update updatedAt

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
        // Redirect to edit page for new review
        router.push(`/admin/reviews/${result.slug}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateData: any) => {
    setFormData(prev => ({
      ...prev,
      ...templateData,
    }));
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
        <label htmlFor="fairPriceTier" className="block text-gray-700 text-sm font-bold mb-2">Fair Price Tier:</label>
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
        {formData.fairPriceTier && (
          <div className="mt-2">
            <FairPriceBadge tier={formData.fairPriceTier} amount={formData.fairPriceAmount} />
          </div>
        )}
      </div>

      {formData.fairPriceTier !== 'Free-to-Play' && (
        <div className="mb-4">
          <label htmlFor="fairPriceAmount" className="block text-gray-700 text-sm font-bold mb-2">Fair Price Amount ($):</label>
          <input
            type="number"
            id="fairPriceAmount"
            name="fairPriceAmount"
            value={formData.fairPriceAmount || ''}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
          />
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="quickVerdict" className="block text-gray-700 text-sm font-bold mb-2">Quick Verdict (max 300 chars):</label>
        <textarea
          id="quickVerdict"
          name="quickVerdict"
          value={formData.quickVerdict || ''}
          onChange={handleChange}
          maxLength={300}
          rows={3}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Review Content (Markdown):</label>
        <textarea
          id="content"
          name="content"
          value={formData.content || ''}
          onChange={handleChange}
          rows={10}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="featuredImage" className="block text-gray-700 text-sm font-bold mb-2">Featured Image:</label>
        <input
          type="file"
          id="featuredImage"
          name="featuredImage"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
            <img src={imagePreview} alt="Featured Image Preview" className="max-w-xs h-auto rounded-lg shadow-md" />
          </div>
        )}
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

      {/* Template Selector */}
      <div className="mb-4">
        <ReviewTemplateSelector onTemplateSelect={handleTemplateSelect} />
      </div>


      {/* Publish Options */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Publish Options:</label>
        <div className="flex items-center mb-2">
          <input
            type="radio"
            id="publishNow"
            name="publishOption"
            value="now"
            checked={publishOption === 'now'}
            onChange={() => setPublishOption('now')}
            className="mr-2"
          />
          <label htmlFor="publishNow">Publish Now</label>
        </div>
        <div className="flex items-center mb-2">
          <input
            type="radio"
            id="scheduleForLater"
            name="publishOption"
            value="schedule"
            checked={publishOption === 'schedule'}
            onChange={() => setPublishOption('schedule')}
            className="mr-2"
          />
          <label htmlFor="scheduleForLater">Schedule for Later</label>
        </div>

        {publishOption === 'schedule' && (
          <div className="mt-2 pl-4">
            <label htmlFor="scheduledPublishAt" className="block text-gray-700 text-sm font-bold mb-2">Schedule Date and Time:</label>
            <input
              type="datetime-local"
              id="scheduledPublishAt"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required={publishOption === 'schedule'}
            />
          </div>
        )}
      </div>


      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Pros:</label>
        {formData.pros?.map((pro, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={pro}
              onChange={(e) => handleArrayItemChange(e, 'pros', index)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              placeholder={`Pro ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveArrayItem('pros', index)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem('pros')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm mt-2"
        >
          + Add Pro
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Cons:</label>
        {formData.cons?.map((con, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={con}
              onChange={(e) => handleArrayItemChange(e, 'cons', index)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              placeholder={`Con ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveArrayItem('cons', index)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem('cons')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm mt-2"
        >
          + Add Con
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={loading}
      >
        {loading ? 'Saving...' : (initialData ? 'Update Review' : 'Create Review')}
      </button>
    </form>
  );
};

export default ReviewForm;
