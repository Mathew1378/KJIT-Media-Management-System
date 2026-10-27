import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken, consumePasswordResetToken } from '@/lib/tokens';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ valid: false, error: 'Password reset token is missing.' }, { status: 400 });
    }

    const verification = await verifyPasswordResetToken(token);
    if (!verification.valid || !verification.user) {
      return NextResponse.json({ valid: false, error: verification.error || 'Invalid or expired token.' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      email: verification.user.email,
      name: verification.user.name,
      role: verification.user.role,
      department: verification.user.department,
    });
  } catch (err: any) {
    console.error('[Reset Password Token Check Error]', err);
    return NextResponse.json({ valid: false, error: 'Server error while checking token.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;
    const newPassword = body.password || body.newPassword;

    if (!token) {
      return NextResponse.json({ error: 'Password reset token is required.' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const result = await consumePasswordResetToken(token, newPassword);
    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error || 'Password reset failed.' }, { status: 400 });
    }

    await logAudit({
      userId: result.user.id,
      userName: result.user.name,
      role: result.user.role,
      action: 'PASSWORD_RESET',
      details: `User ${result.user.email} successfully completed first-time password reset.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Password configured successfully. You may now log in with your new password.',
    });
  } catch (err: any) {
    console.error('[Reset Password Error]', err);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
