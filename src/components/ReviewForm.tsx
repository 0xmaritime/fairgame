'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { GameReview } from '@/types/game-review';
import FairPriceBadge from './FairPriceBadge';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, Calendar } from 'lucide-react';

interface ReviewFormProps {
  initialData?: GameReview;
  onSubmit: (data: any) => Promise<void>;
}

const fairPriceTiers: GameReview['fairPriceTier'][] = [
  'Premium',
  'Standard',
  'Budget',
  'Free-to-Play',
  'Wait-for-Sale',
  'Never-Buy',
];

const ReviewForm: React.FC<ReviewFormProps> = ({ initialData, onSubmit }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<Partial<GameReview>>({
    title: initialData?.title || '',
    gameTitle: initialData?.gameTitle || '',
    fairPriceTier: initialData?.fairPriceTier || 'Standard',
    fairPriceAmount: initialData?.fairPriceAmount,
    quickVerdict: initialData?.quickVerdict || '',
    content: initialData?.content || '',
    featuredImage: initialData?.featuredImage || '',
    youtubeVideoId: initialData?.youtubeVideoId || '',
    pros: initialData?.pros || '',
    cons: initialData?.cons || '',
    status: initialData?.status || 'draft',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.featuredImage ? `/uploads/${initialData.featuredImage}` : null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        pros: initialData.pros || '',
        cons: initialData.cons || '',
        status: initialData.status || 'draft',
      });
      setImagePreview(initialData.featuredImage || null);
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayItemChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'pros' | 'cons') => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddArrayItem = (field: 'pros' | 'cons') => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] ? `${prev[field]}\n` : '',
    }));
  };

  const handleRemoveArrayItem = (field: 'pros' | 'cons', index: number) => {
    setFormData((prev) => {
      const items = (prev[field] || '').split('\n').filter(Boolean);
      items.splice(index, 1);
      return {
        ...prev,
        [field]: items.join('\n'),
      };
    });
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

  const handleImageUpload = async (): Promise<{ filename: string; url: string; pathname: string } | null> => {
    if (!imageFile) {
      return formData.featuredImage ? {
        filename: formData.featuredImage.split('/').pop() || '',
        url: formData.featuredImage,
        pathname: formData.featuredImagePathname || '',
      } : null;
    }

    try {
      const data = new FormData();
      data.append('file', imageFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Image upload failed');
      }

      const result = await res.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadedImage = await handleImageUpload();
      if (imageFile && !uploadedImage) {
        setLoading(false);
        return;
      }

      const reviewToSave: Partial<GameReview> = {
        ...formData,
        id: formData.id || undefined,
        slug: formData.slug || undefined,
        featuredImage: uploadedImage?.url || formData.featuredImage || '',
        featuredImagePathname: uploadedImage?.pathname || formData.featuredImagePathname || '',
        fairPriceAmount: formData.fairPriceAmount ? Number(formData.fairPriceAmount) : undefined,
        pros: formData.pros || '',
        cons: formData.cons || '',
        updatedAt: new Date().toISOString(),
        status,
      };

      if (status === 'published') {
        reviewToSave.publishedAt = new Date().toISOString();
      }

      await onSubmit(reviewToSave);
      setSuccess(`Review ${initialData ? 'updated' : 'created'} successfully!`);
      if (!initialData) {
        router.push('/admin/reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {initialData?.id ? 'Edit Review' : 'Create Review'}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={loading}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

      {previewMode ? (
        <div className="prose max-w-none">
          <h1>{formData.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: formData.content || '' }} />
        </div>
      ) : (
        <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="gameTitle" className="block text-sm font-medium mb-2">
              Game Title
            </label>
            <Input
              id="gameTitle"
              name="gameTitle"
              value={formData.gameTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="fairPriceTier" className="block text-sm font-medium mb-2">
              Price Tier
            </label>
            <select
              id="fairPriceTier"
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
            <Input
              id="fairPriceAmount"
              name="fairPriceAmount"
              type="number"
              value={formData.fairPriceAmount || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="quickVerdict" className="block text-sm font-medium mb-2">
              Quick Verdict
            </label>
            <TextareaAutosize
              id="quickVerdict"
              name="quickVerdict"
              value={formData.quickVerdict}
              onChange={handleChange}
              className="w-full h-24 p-2 border rounded-md"
              minRows={2}
              maxRows={4}
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
            <Input
              id="youtubeVideoId"
              name="youtubeVideoId"
              value={formData.youtubeVideoId}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium mb-2">
              Featured Image
            </label>
            <input
              type="file"
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
              Pros
            </label>
            <TextareaAutosize
              id="pros"
              name="pros"
              value={formData.pros || ''}
              onChange={(e) => handleArrayItemChange(e, 'pros')}
              className="w-full p-2 border rounded-md"
              minRows={3}
              maxRows={10}
              placeholder="Enter pros, one per line"
            />
          </div>

          <div>
            <label htmlFor="cons" className="block text-sm font-medium mb-2">
              Cons
            </label>
            <TextareaAutosize
              id="cons"
              name="cons"
              value={formData.cons || ''}
              onChange={(e) => handleArrayItemChange(e, 'cons')}
              className="w-full p-2 border rounded-md"
              minRows={3}
              maxRows={10}
              placeholder="Enter cons, one per line"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
