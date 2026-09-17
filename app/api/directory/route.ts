import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed =
    (await hasPermission(user.role, 'directory:view')) ||
    (await hasPermission(user.role, 'assignments:manage')) ||
    ['ADMIN', 'MEDIA_HEAD'].includes(user.role);

  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden. User Directory access is restricted.' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ users });
}
