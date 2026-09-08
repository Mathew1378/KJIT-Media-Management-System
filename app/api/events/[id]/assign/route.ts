import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'assignments:manage'))) {
    return NextResponse.json({ error: 'Unauthorized to assign media team' }, { status: 403 });
  }

  try {
    const { assignments } = await req.json();
    // assignments: array of { userId: string, roleInEvent: 'PHOTOGRAPHER' | 'VIDEOGRAPHER' | 'EDITOR' }

    if (!Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Assignments array required' }, { status: 400 });
    }

    // Delete existing assignments for this event
    await prisma.assignment.deleteMany({
      where: { eventId: params.id },
    });

    // Create new assignments
    if (assignments.length > 0) {
      await prisma.assignment.createMany({
        data: assignments.map((a: any) => ({
          eventId: params.id,
          userId: a.userId,
          roleInEvent: a.roleInEvent || 'PHOTOGRAPHER',
        })),
      });
    }

    // Update event status to ASSIGNED if currently REGISTERED
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (event && event.status === 'REGISTERED') {
      await prisma.event.update({
        where: { id: params.id },
        data: { status: 'ASSIGNED' },
      });
    }

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'MEDIA_TEAM_ASSIGNED',
      details: `Assigned ${assignments.length} media team personnel for event ${event?.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Assign Error]', err);
    return NextResponse.json({ error: 'Failed to update media team assignment' }, { status: 500 });
  }
}
