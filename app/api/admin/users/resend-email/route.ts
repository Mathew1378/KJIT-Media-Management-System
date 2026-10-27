import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { createPasswordResetToken } from '@/lib/tokens';
import { sendProvisioningEmail } from '@/lib/email/email-service';

export async function POST(req: Request) {
  const adminUser = await getSessionUser();
  if (!adminUser || !(await hasPermission(adminUser.role, 'users:manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userId, generateNewPassword } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let tempPassword: string | undefined;

    if (generateNewPassword) {
      // Generate secure 10-character temporary password
      tempPassword = 'KJIT#' + crypto.randomBytes(4).toString('hex');
      const passwordHash = hashPassword(tempPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          mustChangePassword: true,
        },
      });
    }

    // Generate fresh time-limited, single-use password reset token (invalidates any old ones)
    const resetToken = await createPasswordResetToken(user.id, 24);

    // Dispatch provisioning email with password reset link
    const emailResult = await sendProvisioningEmail({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      password: tempPassword,
      resetToken,
    });

    await logAudit({
      userId: adminUser.id,
      userName: adminUser.name,
      role: adminUser.role,
      action: generateNewPassword ? 'USER_PASSWORD_RESET_DISPATCHED' : 'USER_PROVISION_EMAIL_RESENT',
      details: `${generateNewPassword ? 'Generated new temporary password and sent reset email' : 'Resent provisioning email'} to ${user.email}. Result: ${
        emailResult.success ? 'Delivered' : `Failed: ${emailResult.error}`
      }`,
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      emailError: emailResult.error,
      tempPassword,
    });
  } catch (err: any) {
    console.error('[Resend Email Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to resend provisioning email' }, { status: 500 });
  }
}
