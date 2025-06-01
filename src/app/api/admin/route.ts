import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Simple password check - in production, use a proper authentication system
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Set cookie
    const response = NextResponse.json({ message: 'Authentication successful' });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear the admin token cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('admin_token');
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
} 