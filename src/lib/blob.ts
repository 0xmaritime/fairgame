import { put, del } from '@vercel/blob';

/**
 * Uploads an image file to Vercel Blob storage and returns the public URL.
 * @param file - The image file to upload.
 * @returns The public URL of the uploaded image.
 * @throws If the upload fails.
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const blob = await put(file.name, file, {
      access: 'public',
    });
    return blob.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Image upload failed');
  }
}

/**
 * Deletes an image from Vercel Blob storage by its URL.
 * @param url - The public URL of the image to delete.
 * @throws If the deletion fails.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Image deletion failed');
  }
}
