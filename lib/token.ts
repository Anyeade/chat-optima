import { sign, verify } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret';

export function generateToken(payload: object, expiresIn: string | number) {
  const options = { expiresIn: typeof expiresIn === 'string' ? Number.parseInt(expiresIn, 10) : expiresIn };
  return sign(payload, SECRET_KEY, options);
}

export function verifyToken(token: string) {
  try {
    return verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}
