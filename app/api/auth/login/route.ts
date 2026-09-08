import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const { email, password, role: expectedRole } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials or account deactivated' }, { status: 401 });
    }

    // Role check if logged in via specific role portal
    if (expectedRole && user.role.toUpperCase() !== expectedRole.toUpperCase()) {
      return NextResponse.json(
        { error: `This account has role '${user.role}', but you tried logging in via '${expectedRole}' portal.` },
        { status: 403 }
      );
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGIN',
      details: `User logged in successfully via ${user.role} role session`,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    });

    response.cookies.set('kjit_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('[Login API Error]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
