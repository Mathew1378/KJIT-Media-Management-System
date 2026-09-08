import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  // Fetch DB role permissions
  let permissions: string[] = [];
  try {
    const dbPerms = await prisma.rolePermission.findMany({
      where: { role: user.role },
    });
    permissions = dbPerms.map((p) => p.permissionCode);
  } catch (e) {}

  if (permissions.length === 0) {
    permissions = DEFAULT_ROLE_PERMISSIONS[user.role.toUpperCase()] || [];
  }

  return NextResponse.json({
    authenticated: true,
    user,
    permissions,
  });
}
