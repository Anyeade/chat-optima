import { getUser } from '@/lib/db/queries';
import { sendResetPasswordEmail } from '@/lib/email';
import { generateToken } from '@/lib/token';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const users = await getUser(email);

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const [user] = users;
    const token = generateToken({ id: user.id }, '1h'); // Token valid for 1 hour

    await sendResetPasswordEmail(email, token);

    return NextResponse.json(
      { message: 'Password reset email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot password route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
