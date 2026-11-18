import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !session.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to update your password.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { newPassword, confirmPassword } = body;

    // Validate fields
    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'New password is required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!confirmPassword || typeof confirmPassword !== 'string') {
      return NextResponse.json(
        { error: 'Confirm password is required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation password do not match.' },
        { status: 400 }
      );
    }

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User account not found or deactivated.' },
        { status: 401 }
      );
    }

    // Hash password using bcrypt via hashPassword
    const passwordHash = hashPassword(newPassword);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    // Record audit log in isolated try/catch so audit failure doesn't mask successful password update
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
      await logAudit({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: 'PASSWORD_CHANGED',
        details: `User ${user.email} successfully updated their account password.`,
        ipAddress: ip,
      });
    } catch (auditErr) {
      console.error('[AuditLog Error] Failed to log PASSWORD_CHANGED:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err: any) {
    console.error('[Change Password Error]', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while updating password.' },
      { status: 500 }
    );
  }
}
