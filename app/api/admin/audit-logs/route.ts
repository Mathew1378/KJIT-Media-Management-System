import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';

export async function GET() {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'audit:view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ auditLogs });
}
