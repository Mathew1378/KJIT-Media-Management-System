import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

function isValidUrl(urlStr: string): boolean {
  if (!urlStr || !urlStr.trim()) return true; // empty allowed
  try {
    const parsed = new URL(urlStr.trim());
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !['SOCIAL_MEDIA_HANDLER', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized to save social media publication' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      eventId,
      caption,
      instagramUrl,
      facebookUrl,
      instagramPosted,
      facebookPosted,
    } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    // Server-Side Verification: Fetch event & approval steps
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        approvalSteps: true,
        mediaAssets: { where: { fileType: 'FINAL_REEL' } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // STRICT APPROVAL GATE: Dean = APPROVED AND HOD = APPROVED AND Coordinator = APPROVED
    const deanApproved = event.approvalSteps.some((step) => step.stage === 'DEAN' && step.status === 'APPROVED');
    const hodApproved = event.approvalSteps.some((step) => step.stage === 'HOD' && step.status === 'APPROVED');
    const coordApproved = event.approvalSteps.some((step) => step.stage === 'COORDINATOR' && step.status === 'APPROVED');

    if (!deanApproved || !hodApproved || !coordApproved) {
      return NextResponse.json(
        { error: 'Cannot process publication: Event has not completed all departmental approvals (Dean, HOD, Coordinator).' },
        { status: 403 }
      );
    }

    // Validate URLs if provided
    const cleanIgUrl = (instagramUrl || '').trim();
    const cleanFbUrl = (facebookUrl || '').trim();

    if (cleanIgUrl && !isValidUrl(cleanIgUrl)) {
      return NextResponse.json({ error: 'Please enter a valid Instagram URL (e.g. https://instagram.com/p/...)' }, { status: 400 });
    }
    if (cleanFbUrl && !isValidUrl(cleanFbUrl)) {
      return NextResponse.json({ error: 'Please enter a valid Facebook URL (e.g. https://facebook.com/reel/...)' }, { status: 400 });
    }

    // Determine posting booleans based on URL presence or checkbox
    const isIgPosted = Boolean(instagramPosted || cleanIgUrl.length > 0);
    const isFbPosted = Boolean(facebookPosted || cleanFbUrl.length > 0);

    // Derive status
    let status = 'AWAITING_SOCIAL_MEDIA';
    if (isIgPosted && isFbPosted) {
      status = 'PUBLISHED';
    } else if (isIgPosted || isFbPosted) {
      status = 'PARTIALLY_POSTED';
    }

    const reelId = event.mediaAssets[0]?.id || null;

    // Create or update SocialMediaPublication record
    const publication = await prisma.socialMediaPublication.upsert({
      where: { eventId: event.id },
      create: {
        eventId: event.id,
        reelId: reelId,
        caption: caption || '',
        instagramUrl: cleanIgUrl || null,
        facebookUrl: cleanFbUrl || null,
        instagramPosted: isIgPosted,
        facebookPosted: isFbPosted,
        status: status,
        postedAt: (isIgPosted || isFbPosted) ? new Date() : null,
        postedById: user.id,
      },
      update: {
        reelId: reelId || undefined,
        caption: caption !== undefined ? caption : undefined,
        instagramUrl: cleanIgUrl || null,
        facebookUrl: cleanFbUrl || null,
        instagramPosted: isIgPosted,
        facebookPosted: isFbPosted,
        status: status,
        postedAt: (isIgPosted || isFbPosted) ? new Date() : undefined,
        postedById: user.id,
      },
    });

    // Audit logging
    let auditAction = 'SOCIAL_MEDIA_PUBLICATION_UPDATED';
    if (status === 'PUBLISHED') auditAction = 'SOCIAL_MEDIA_PUBLISHED_BOTH';
    else if (status === 'PARTIALLY_POSTED') auditAction = 'SOCIAL_MEDIA_PARTIALLY_POSTED';

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: auditAction,
      details: `Saved social media publication for event "${event.name}". Status: ${status}. Instagram: ${cleanIgUrl ? 'Posted' : 'Not posted'}, Facebook: ${cleanFbUrl ? 'Posted' : 'Not posted'}.`,
    });

    return NextResponse.json({ success: true, publication });
  } catch (err: any) {
    console.error('[Save Social Media Publication Error]', err);
    return NextResponse.json({ error: 'Failed to save publication' }, { status: 500 });
  }
}
