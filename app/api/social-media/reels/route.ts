import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user || !['SOCIAL_MEDIA_HANDLER', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized for social media desk' }, { status: 403 });
  }

  try {
    // Retrieve all events
    const allEvents = await prisma.event.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true, department: true } },
        mediaAssets: { where: { fileType: 'FINAL_REEL' } },
        approvalSteps: { include: { reviewer: { select: { id: true, name: true, role: true } } } },
        socialMediaPublication: {
          include: {
            postedBy: { select: { id: true, name: true, role: true } }
          }
        },
      },
      orderBy: { dateTime: 'desc' },
    });

    // STRICT APPROVAL GATE ENFORCEMENT
    // Only return events where Dean = APPROVED AND HOD = APPROVED AND Coordinator = APPROVED
    const approvedEvents = allEvents.filter((event) => {
      const deanApproved = event.approvalSteps.some((step) => step.stage === 'DEAN' && step.status === 'APPROVED');
      const hodApproved = event.approvalSteps.some((step) => step.stage === 'HOD' && step.status === 'APPROVED');
      const coordApproved = event.approvalSteps.some((step) => step.stage === 'COORDINATOR' && step.status === 'APPROVED');

      return deanApproved && hodApproved && coordApproved;
    });

    return NextResponse.json({ events: approvedEvents });
  } catch (err: any) {
    console.error('[Social Media Reels API Error]', err);
    return NextResponse.json({ error: 'Failed to fetch approved reels' }, { status: 500 });
  }
}
