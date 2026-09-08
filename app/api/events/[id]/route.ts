import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { id: true, name: true, email: true, department: true } },
      assignments: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      mediaAssets: {
        include: {
          uploader: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      approvalSteps: {
        include: {
          reviewer: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json({ event });
}
