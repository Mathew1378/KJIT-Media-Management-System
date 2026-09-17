import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const user = await getSessionUser();
  if (!user || !['DEAN', 'HOD', 'COORDINATOR', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized for approval chain' }, { status: 403 });
  }

  let stageFilter = 'COORDINATOR';
  if (user.role === 'HOD') stageFilter = 'HOD';
  if (user.role === 'DEAN') stageFilter = 'DEAN';
  if (user.role === 'ADMIN') stageFilter = 'ADMIN';

  // All authorized roles (COORDINATOR, HOD, DEAN, ADMIN) can review events ready for approval with equal authority
  const events = await prisma.event.findMany({
    where: {
      status: { in: ['REEL_SUBMITTED', 'COORDINATOR_APPROVED', 'HOD_APPROVED', 'DEAN_APPROVED', 'PUBLISHED', 'REJECTED'] },
    },
    include: {
      createdBy: { select: { name: true, email: true, department: true } },
      assignments: { include: { user: { select: { name: true, role: true } } } },
      mediaAssets: { where: { fileType: 'FINAL_REEL' } },
      approvalSteps: { include: { reviewer: { select: { name: true, role: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ events, userStage: stageFilter });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !['COORDINATOR', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized for approval actions' }, { status: 403 });
  }

  try {
    const { eventId, action, comments, targetStage } = await req.json();
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

    let userStage = targetStage || user.role;
    if (!['COORDINATOR', 'HOD', 'DEAN'].includes(userStage)) {
      userStage = 'COORDINATOR';
    }

    if (action === 'APPROVE') {
      // Independent approval: Update step record for this specific stage
      await prisma.approvalStep.updateMany({
        where: { eventId: event.id, stage: userStage },
        data: {
          status: 'APPROVED',
          reviewerId: user.id,
          comments: comments || 'Approved',
          reviewedAt: new Date(),
        },
      });

      // Any single approval makes the event status PUBLISHED (Approved / Completed)
      const nextStatus = 'PUBLISHED';

      await prisma.event.update({
        where: { id: event.id },
        data: { status: nextStatus },
      });

      // Check if all 3 stages (or COORDINATOR stage) are approved to trigger Social Media Handler notification
      const updatedSteps = await prisma.approvalStep.findMany({
        where: { eventId: event.id },
      });

      const deanOk = updatedSteps.some((s) => s.stage === 'DEAN' && s.status === 'APPROVED');
      const hodOk = updatedSteps.some((s) => s.stage === 'HOD' && s.status === 'APPROVED');
      const coordOk = updatedSteps.some((s) => s.stage === 'COORDINATOR' && s.status === 'APPROVED');

      // Create notification only when final approval is satisfied (specifically when Coordinator or all 3 approve)
      if (coordOk || (deanOk && hodOk && coordOk)) {
        // Prevent duplicate notification for same event
        const existingNotif = await prisma.notification.findFirst({
          where: { eventId: event.id, role: 'SOCIAL_MEDIA_HANDLER' },
        });

        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              role: 'SOCIAL_MEDIA_HANDLER',
              eventId: event.id,
              title: 'Final reel approved — ready for social media publishing.',
              message: `Final reel for event "${event.name}" scheduled on ${new Date(event.dateTime).toLocaleDateString()} has received final departmental approval and is ready for social media publishing.`,
            },
          });
        }
      }

      await logAudit({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: `APPROVED_STAGE_${userStage}`,
        details: `Independently approved final reel for event ${event.name} as ${userStage}. Event status updated to ${nextStatus}.`,
      });

      return NextResponse.json({ success: true, newStatus: nextStatus });
    } else {
      // REJECT action: Send back to Editor for revision
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
