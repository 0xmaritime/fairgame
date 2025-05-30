import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json(
        { message: 'Filename parameter is required' },
        { status: 400 }
      );
    }

    const filePath = path.join(uploadDirectory, filename);
    await fs.unlink(filePath);

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = path.extname(file.name);
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDirectory, filename);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ filename, url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error('Failed to upload image:', error);
    return NextResponse.json({ message: 'Failed to upload image' }, { status: 500 });
  }
}
