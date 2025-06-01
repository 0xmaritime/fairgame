import { NextResponse } from 'next/server';
import { BlobStorageManager } from '@/lib/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, 
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 10MB.' }, 
        { status: 400 }
      );
    }

    const result = await BlobStorageManager.uploadFile(file, 'reviews');

    return NextResponse.json({
      filename: result.filename,
      url: result.url,
      pathname: result.pathname,
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to upload image:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to upload image' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const pathname = searchParams.get('pathname');
    
    if (!url && !pathname) {
      return NextResponse.json(
        { message: 'Either URL or pathname parameter is required' },
        { status: 400 }
      );
    }

    const targetPathname = pathname || BlobStorageManager.getPathnameFromUrl(url!);
    await BlobStorageManager.deleteFile(targetPathname);

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete image:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}
