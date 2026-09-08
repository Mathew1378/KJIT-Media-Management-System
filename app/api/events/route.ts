import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let events;

  // Deans, HODs, Coordinators, Media Head, Admin can see all department events
  if (['ADMIN', 'DEAN', 'HOD', 'COORDINATOR', 'MEDIA_HEAD', 'FACULTY'].includes(user.role)) {
    events = await prisma.event.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignments: { include: { user: { select: { id: true, name: true, role: true } } } },
        mediaAssets: true,
        approvalSteps: { include: { reviewer: { select: { name: true, role: true } } } },
      },
      orderBy: { dateTime: 'desc' },
    });
  } else {
    // Media Member sees assigned events or all events for calendar view
    events = await prisma.event.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignments: { include: { user: { select: { id: true, name: true, role: true } } } },
        mediaAssets: true,
        approvalSteps: true,
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'events:create'))) {
    return NextResponse.json({ error: 'Unauthorized to register event' }, { status: 403 });
  }

  try {
    const data = await req.json();

    const {
      name,
      category,
      dateTime,
      venue,
      expectedAudience,
      dignitaries,
      chiefGuest,
      guestCount,
      specialInstructions,
      mediaDeadline,
    } = data;

    if (!name || !category || !dateTime || !venue || !mediaDeadline) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        category,
        dateTime: new Date(dateTime),
        venue,
        expectedAudience: expectedAudience || 'Standard Audience',
        dignitariesJson: JSON.stringify(dignitaries || []),
        chiefGuest: chiefGuest || '',
        guestCount: Number(guestCount) || 0,
        specialInstructions: specialInstructions || '',
        mediaDeadline: new Date(mediaDeadline),
        status: 'REGISTERED',
        createdById: user.id,
      },
    });

    // Create initial approval steps structure (Dean -> HOD -> Coordinator)
    await prisma.approvalStep.createMany({
      data: [
        { eventId: event.id, stage: 'DEAN', status: 'PENDING' },
        { eventId: event.id, stage: 'HOD', status: 'PENDING' },
        { eventId: event.id, stage: 'COORDINATOR', status: 'PENDING' },
      ],
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'EVENT_REGISTERED',
      details: `Registered new event: ${event.name} scheduled for ${event.dateTime.toISOString().split('T')[0]}`,
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error('[Register Event Error]', err);
    return NextResponse.json({ error: 'Failed to register event' }, { status: 500 });
  }
}
