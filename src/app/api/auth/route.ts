import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

interface AuthRequest {
  password: string;
}

export async function POST(request: Request) {
  try {
    const { password }: AuthRequest = await request.json();

    // Read .env.local directly for testing purposes
    const envFilePath = path.join(process.cwd(), '.env.local');
    let adminPasswordHash = undefined;

    try {
      const envFileContent = await fs.readFile(envFilePath, 'utf-8');
      const lines = envFileContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('NEXT_PUBLIC_ADMIN_PASSWORD_HASH=')) {
          adminPasswordHash = trimmedLine.substring('NEXT_PUBLIC_ADMIN_PASSWORD_HASH='.length);
          break;
        }
      }
    } catch (error) {
      console.error('Error reading .env.local:', error);
      return NextResponse.json(
        { message: 'Server configuration error: Could not read environment file' },
        { status: 500 }
      );
    }


    if (!adminPasswordHash) {
      return NextResponse.json(
        { message: 'Server configuration error: ADMIN_PASSWORD_HASH not found in environment file' },
        { status: 500 }
      );
    }

    const isMatch = await bcrypt.compare(password, adminPasswordHash);

    if (isMatch) {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { authenticated: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
