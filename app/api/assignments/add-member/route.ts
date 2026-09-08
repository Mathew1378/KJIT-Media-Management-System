import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'assignments:manage'))) {
    return NextResponse.json({ error: 'Unauthorized to add team members' }, { status: 403 });
  }

  try {
    const { name, email, role, department } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ success: true, user: existing, alreadyExisted: true });
    }

    const passwordHash = hashPassword('password123');

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        role: role || 'MEDIA_MEMBER',
        department: department || 'Department of Media & Communication',
        passwordHash,
      },
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'MEDIA_MEMBER_PROVISIONED_BY_HEAD',
      details: `Media Head ${user.name} registered new team member ${newUser.name} (${newUser.email})`,
    });

    return NextResponse.json({ success: true, user: newUser, alreadyExisted: false });
  } catch (err: any) {
    console.error('[Add Member Error]', err);
    return NextResponse.json({ error: 'Failed to register new team member' }, { status: 500 });
  }
}
