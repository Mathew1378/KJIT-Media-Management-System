import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { createPasswordResetToken } from '@/lib/tokens';
import { sendProvisioningEmail } from '@/lib/email/email-service';

export async function GET() {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'users:manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'users:manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name, email, role, department, password } = await req.json();

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role,
        department: department?.trim() || 'School of Computer Science & Technology',
        passwordHash,
        mustChangePassword: true,
      },
    });

    // Generate secure, single-use, time-limited password reset token
    const resetToken = await createPasswordResetToken(newUser.id, 24);

    // Attempt email delivery via SMTP service
    const emailResult = await sendProvisioningEmail({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      password,
      resetToken,
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'USER_PROVISIONED',
      details: `Created new account for ${newUser.name} (${newUser.email}) with role ${newUser.role}. Provisioning email ${
        emailResult.success ? 'sent successfully' : `failed: ${emailResult.error}`
      }`,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      emailSent: emailResult.success,
      emailError: emailResult.error,
    });
  } catch (err: any) {
    console.error('[Create User Error]', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'users:manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userId, isActive } = await req.json();

    const targetUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'USER_STATUS_UPDATED',
      details: `Changed active status of ${targetUser.email} to ${isActive ? 'Active' : 'Deactivated'}`,
    });

    return NextResponse.json({ success: true, user: targetUser });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
