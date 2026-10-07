import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { storageService } from '@/lib/storage/StorageService';
import { isPastIST } from '@/lib/dateUtils';

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
        socialMediaPublication: true,
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
        socialMediaPublication: true,
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
    const contentType = req.headers.get('content-type') || '';
    let name = '';
    let category = '';
    let dateTime = '';
    let venue = '';
    let expectedAudience = '';
    let dignitaries: any[] = [];
    let chiefGuestStr = '';
    let guestCount = 0;
    let specialInstructions = '';
    let mediaDeadline = '';
    let posterFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = (formData.get('name') as string) || '';
      category = (formData.get('category') as string) || '';
      dateTime = (formData.get('dateTime') as string) || '';
      venue = (formData.get('venue') as string) || '';
      expectedAudience = (formData.get('expectedAudience') as string) || '';
      
      const rawDignitaries = formData.get('dignitaries');
      if (typeof rawDignitaries === 'string') {
        try { dignitaries = JSON.parse(rawDignitaries); } catch (e) {}
      }

      const rawChiefGuest = formData.get('chiefGuest');
      if (typeof rawChiefGuest === 'string') {
        chiefGuestStr = rawChiefGuest;
      }

      guestCount = Number(formData.get('guestCount')) || 0;
      specialInstructions = (formData.get('specialInstructions') as string) || '';
      mediaDeadline = (formData.get('mediaDeadline') as string) || '';
      posterFile = formData.get('poster') as File | null;
    } else {
      const data = await req.json();
      name = data.name;
      category = data.category;
      dateTime = data.dateTime;
      venue = data.venue;
      expectedAudience = data.expectedAudience;
      dignitaries = data.dignitaries || [];
      chiefGuestStr = typeof data.chiefGuest === 'object' ? JSON.stringify(data.chiefGuest) : (data.chiefGuest || '');
      guestCount = Number(data.guestCount) || 0;
      specialInstructions = data.specialInstructions || '';
      mediaDeadline = data.mediaDeadline;
    }

    if (!name || !category || !dateTime || !venue || !mediaDeadline) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }

    // SERVER-SIDE VALIDATION: Disallow past date/time for scheduled event and media deadline (Asia/Kolkata IST)
    if (isPastIST(dateTime)) {
      return NextResponse.json({ error: 'Event date and time cannot be in the past' }, { status: 400 });
    }

    if (isPastIST(mediaDeadline)) {
      return NextResponse.json({ error: 'Media deadline cannot be in the past' }, { status: 400 });
    }

    // Handle optional Event Poster file upload using existing StorageService architecture
    let posterFileId: string | null = null;
    let posterFileName: string | null = null;
    let posterDrivePath: string | null = null;
    let posterMimeType: string | null = null;
    let posterUploadedAt: Date | null = null;

    if (posterFile && posterFile.size > 0) {
      const arrayBuffer = await posterFile.arrayBuffer();
      const eventDateStr = new Date(dateTime).toISOString().split('T')[0];

      const storedFile = await storageService.uploadFile({
        fileName: posterFile.name,
        fileBuffer: Buffer.from(arrayBuffer),
        mimeType: posterFile.type || 'image/jpeg',
        eventName: name,
        eventDate: eventDateStr,
        categoryFolder: 'Poster',
      });

      posterFileId = storedFile.fileId;
      posterFileName = storedFile.fileName;
      posterDrivePath = storedFile.drivePath;
      posterMimeType = storedFile.mimeType;
      posterUploadedAt = new Date();
    }

    const event = await prisma.event.create({
      data: {
        name,
        category,
        dateTime: new Date(dateTime),
        venue,
        expectedAudience: expectedAudience || 'Standard Audience',
        dignitariesJson: JSON.stringify(dignitaries),
        chiefGuest: chiefGuestStr,
        guestCount,
        specialInstructions,
        mediaDeadline: new Date(mediaDeadline),
        status: 'REGISTERED',
        createdById: user.id,
        posterFileId,
        posterFileName,
        posterDrivePath,
        posterMimeType,
        posterUploadedAt,
      },
    });

    // Create initial approval steps structure (Program Coordinator -> HOD -> Dean)
    await prisma.approvalStep.createMany({
      data: [
        { eventId: event.id, stage: 'COORDINATOR', status: 'PENDING' },
        { eventId: event.id, stage: 'HOD', status: 'PENDING' },
        { eventId: event.id, stage: 'DEAN', status: 'PENDING' },
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
