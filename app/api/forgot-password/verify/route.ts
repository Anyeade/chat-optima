import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const [user] = await getUser(email);

    if (!user) {
      // For security, we return success even if the email doesn't exist
      // The UI will show the same message either way
      return NextResponse.json({ success: true });
    }

    // User exists, return success
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
