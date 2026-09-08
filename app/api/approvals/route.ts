import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const user = await getSessionUser();
  if (!user || !['DEAN', 'HOD', 'COORDINATOR', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized for approval chain' }, { status: 403 });
  }

  let stageFilter = 'DEAN';
  if (user.role === 'HOD') stageFilter = 'HOD';
  if (user.role === 'COORDINATOR') stageFilter = 'COORDINATOR';

  // Fetch pending events where approval steps match user's stage
  let events;
  if (user.role === 'ADMIN') {
    events = await prisma.event.findMany({
      where: {
        status: { in: ['REEL_SUBMITTED', 'DEAN_APPROVED', 'HOD_APPROVED', 'PUBLISHED', 'REJECTED'] },
      },
      include: {
        createdBy: { select: { name: true, email: true, department: true } },
        assignments: { include: { user: { select: { name: true, role: true } } } },
        mediaAssets: { where: { fileType: 'FINAL_REEL' } },
        approvalSteps: { include: { reviewer: { select: { name: true, role: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  } else {
    // For DEAN: event status must be REEL_SUBMITTED
    // For HOD: event status must be DEAN_APPROVED
    // For COORDINATOR: event status must be HOD_APPROVED
    let requiredEventStatus = 'REEL_SUBMITTED';
    if (user.role === 'HOD') requiredEventStatus = 'DEAN_APPROVED';
    if (user.role === 'COORDINATOR') requiredEventStatus = 'HOD_APPROVED';

    events = await prisma.event.findMany({
      where: {
        status: requiredEventStatus,
      },
      include: {
        createdBy: { select: { name: true, email: true, department: true } },
        assignments: { include: { user: { select: { name: true, role: true } } } },
        mediaAssets: { where: { fileType: 'FINAL_REEL' } },
        approvalSteps: { include: { reviewer: { select: { name: true, role: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  return NextResponse.json({ events, userStage: stageFilter });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !['DEAN', 'HOD', 'COORDINATOR', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized for approval actions' }, { status: 403 });
  }

  try {
    const { eventId, action, comments } = await req.json();
    // action: 'APPROVE' | 'REJECT'

    if (!eventId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Valid eventId and action required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { approvalSteps: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let userStage = 'DEAN';
    if (user.role === 'HOD') userStage = 'HOD';
    if (user.role === 'COORDINATOR') userStage = 'COORDINATOR';

    if (action === 'APPROVE') {
      // Update step record for this stage
      await prisma.approvalStep.updateMany({
        where: { eventId: event.id, stage: userStage },
        data: {
          status: 'APPROVED',
          reviewerId: user.id,
          comments: comments || 'Approved',
          reviewedAt: new Date(),
        },
      });

      let nextStatus = event.status;
      if (userStage === 'DEAN') nextStatus = 'DEAN_APPROVED';
      if (userStage === 'HOD') nextStatus = 'HOD_APPROVED';
      if (userStage === 'COORDINATOR') nextStatus = 'PUBLISHED';

      await prisma.event.update({
        where: { id: event.id },
        data: { status: nextStatus },
      });

      await logAudit({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: `APPROVED_STAGE_${userStage}`,
        details: `Approved final reel for event ${event.name}. Event status changed to ${nextStatus}.`,
      });

      return NextResponse.json({ success: true, newStatus: nextStatus });
    } else {
      // REJECT action: Send back to Editor and restart chain at Dean stage
      await prisma.approvalStep.updateMany({
        where: { eventId: event.id, stage: userStage },
        data: {
          status: 'REJECTED',
          reviewerId: user.id,
          comments: comments || 'Revision requested by reviewer',
          reviewedAt: new Date(),
        },
      });

      await prisma.event.update({
        where: { id: event.id },
        data: { status: 'REJECTED' },
      });

      await logAudit({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: `REJECTED_STAGE_${userStage}`,
        details: `Rejected final reel for event ${event.name} at ${userStage} stage. Comments: "${comments || 'None'}"`,
      });

      return NextResponse.json({ success: true, newStatus: 'REJECTED' });
    }
  } catch (err: any) {
    console.error('[Approval Action Error]', err);
    return NextResponse.json({ error: 'Failed to process approval action' }, { status: 500 });
  }
}
