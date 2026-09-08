import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'kjit-media-management-secret-key-2026';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (e) {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<UserSession | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get('kjit_auth_token')?.value;
  } else {
    const cookieStore = cookies();
    token = cookieStore.get('kjit_auth_token')?.value;
  }

  if (!token) return null;
  return verifyToken(token);
}
