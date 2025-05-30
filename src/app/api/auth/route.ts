import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

interface AuthRequest {
  password: string;
}

export async function POST(request: Request) {
  try {
    const { password }: AuthRequest = await request.json();
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      return NextResponse.json(
        { message: 'Server configuration error' }, 
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
    return NextResponse.json(
      { message: 'Authentication failed' }, 
      { status: 500 }
    );
  }
}
