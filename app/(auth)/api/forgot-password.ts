import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser, updateUserPassword } from '@/lib/db/queries';
import { sendResetPasswordEmail } from '@/lib/email';
import { generateToken, verifyToken } from '@/lib/token';
import type { JwtPayload } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const users = await getUser(email);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [user] = users;
    const token = generateToken({ id: user.id }, '1h'); // Token valid for 1 hour

    await sendResetPasswordEmail(email, token);

    return res.status(200).json({ message: 'Password reset email sent' });
  }

  if (req.method === 'PUT') {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const payload = verifyToken(token) as JwtPayload | null;

    if (!payload || typeof payload.id !== 'string') {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await updateUserPassword(payload.id, newPassword);

    return res.status(200).json({ message: 'Password updated successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
