import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs'; // Commented out for direct comparison

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    console.log('ADMIN_PASSWORD:', adminPassword); // Debug log
    console.log('Received password:', password); // Debug log

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD is not set in environment variables.');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const isMatch = (password === adminPassword); // Direct comparison
    console.log('Password match:', isMatch); // Debug log

    if (isMatch) {
      // In a real application, you would issue a token (e.g., JWT) here.
      // For this simple example, we'll just return a success status.
      return NextResponse.json({ authenticated: true }, { status: 200 });
    } else {
      return NextResponse.json({ authenticated: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
}
