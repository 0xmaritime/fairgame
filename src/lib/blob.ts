import { put, del, list } from '@vercel/blob';

export interface BlobUploadResult {
  url: string;
  pathname: string;
  filename: string;
}

export class BlobStorageManager {
  // Upload any file to blob storage
  static async uploadFile(
    file: File, 
    folder: 'reviews' | 'ui' | 'assets' = 'reviews'
  ): Promise<BlobUploadResult> {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const pathname = `${folder}/${filename}`;

      const blob = await put(pathname, file, {
        access: 'public',
        addRandomSuffix: false, // We're handling naming ourselves
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        filename: filename,
      };
    } catch (error) {
      console.error('Blob upload error:', error);
      throw new Error('Failed to upload file to Vercel Blob');
    }
  }

  // Upload from buffer (for UI assets migration)
  static async uploadBuffer(
    buffer: Buffer, 
    filename: string,
    contentType: string,
    folder: 'reviews' | 'ui' | 'assets' = 'assets'
  ): Promise<BlobUploadResult> {
    try {
      const pathname = `${folder}/${filename}`;
      
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: contentType,
        addRandomSuffix: false,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        filename: filename,
      };
    } catch (error) {
      console.error('Blob buffer upload error:', error);
      throw new Error('Failed to upload buffer to Vercel Blob');
    }
  }

  // Delete file from blob storage
  static async deleteFile(pathname: string): Promise<void> {
    try {
      await del(pathname);
    } catch (error) {
      console.error('Blob delete error:', error);
      throw new Error('Failed to delete file from Vercel Blob');
    }
  }

  // List files in a folder
  static async listFiles(prefix?: string) {
    try {
      const { blobs } = await list({ prefix });
      return blobs;
    } catch (error) {
      console.error('Blob list error:', error);
      throw new Error('Failed to list files from Vercel Blob');
    }
  }

  // Extract pathname from full URL for deletion
  static getPathnameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch (error) {
      console.error('Invalid URL:', url);
      throw new Error('Invalid blob URL provided');
    }
  }
}

export async function uploadToBlob(file: File, pathname: string) {
  try {
    const blob = await put(pathname, file, {
      access: 'public',
    });
    return blob;
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw error;
  }
}

export async function deleteFromBlob(url: string) {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting from blob:', error);
    throw error;
  }
}

export function generateBlobPathname(filename: string, prefix: string = 'reviews') {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${prefix}/${timestamp}-${sanitizedFilename}`;
} 