import { NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/password';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || hashPassword('admin');

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse('Missing credentials', { status: 400 });
    }

    if (email !== ADMIN_EMAIL) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const isMatch = verifyPassword(password, ADMIN_PASSWORD_HASH);

    if (!isMatch) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    return new NextResponse('Authentication successful', { status: 200 });
  } catch (error) {
    console.error('Authentication error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
