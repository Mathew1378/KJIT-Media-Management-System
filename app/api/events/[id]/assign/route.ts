import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'assignments:manage'))) {
    return NextResponse.json({ error: 'Unauthorized to assign media team' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const { assignments } = await req.json();
    // assignments: array of { userId: string, roleInEvent: 'PHOTOGRAPHER' | 'VIDEOGRAPHER' | 'EDITOR' }

    if (!Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Assignments array required' }, { status: 400 });
    }

    // Filter out rows without a valid non-empty userId
    const validAssignments = assignments.filter(
      (a: any) => a && typeof a.userId === 'string' && a.userId.trim() !== ''
    );

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: 'Target event not found' }, { status: 404 });
    }

    // Atomic transaction to clear existing assignments and insert valid ones
    await prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({
        where: { eventId },
      });

      if (validAssignments.length > 0) {
        await tx.assignment.createMany({
          data: validAssignments.map((a: any) => ({
            eventId,
            userId: a.userId.trim(),
            roleInEvent: a.roleInEvent || 'PHOTOGRAPHER',
          })),
        });
      }

      // Update event status to ASSIGNED if currently REGISTERED and at least 1 person assigned
      if (event.status === 'REGISTERED' && validAssignments.length > 0) {
        await tx.event.update({
          where: { id: eventId },
          data: { status: 'ASSIGNED' },
        });
      }
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'MEDIA_TEAM_ASSIGNED',
      details: `Assigned ${validAssignments.length} media team personnel for event ${event.name}`,
    });

    return NextResponse.json({ success: true, count: validAssignments.length });
  } catch (err: any) {
    console.error('[Assign Error Details]', err?.stack || err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update media team assignment' },
      { status: 500 }
    );
  }
}
