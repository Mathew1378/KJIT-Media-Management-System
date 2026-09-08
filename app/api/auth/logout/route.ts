import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGOUT',
      details: 'User logged out of session',
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('kjit_auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
