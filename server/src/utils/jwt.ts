import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './constants';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
