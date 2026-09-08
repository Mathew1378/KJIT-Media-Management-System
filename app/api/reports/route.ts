import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden. Admin does not have permission to generate academic reports.' }, { status: 403 });
  }

  try {
    const { eventId, formatType, reportData } = await req.json();

    if (!eventId || !formatType || !reportData) {
      return NextResponse.json({ error: 'Missing required report fields' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        eventId,
        formatType,
        reportDataJson: JSON.stringify(reportData),
        generatedById: user.id,
      },
    });

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'REPORT_GENERATED',
      details: `Generated academic report using ${formatType} for event ${event?.name || eventId}`,
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error('[Save Report Error]', err);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden. Admin does not have permission to view academic reports.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ error: 'eventId param required' }, { status: 400 });
  }

  const reports = await prisma.report.findMany({
    where: { eventId },
    include: { generatedBy: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ reports });
}
