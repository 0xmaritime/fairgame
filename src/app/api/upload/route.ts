import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToBlob, generateBlobPathname, BlobStorageManager } from '@/lib/blob';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    const pathname = generateBlobPathname(file.name);
    const blob = await uploadToBlob(file, pathname);

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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
