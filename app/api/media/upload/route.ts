import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { storageService } from '@/lib/storage/StorageService';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const eventId = formData.get('eventId') as string;
    const fileType = (formData.get('fileType') as string) || 'RAW';
    const caption = (formData.get('caption') as string) || '';
    const geotagData = (formData.get('geotagData') as string) || '';

    if (fileType === 'VIDEO') {
      return NextResponse.json(
        { error: 'Individual Event Video uploads have been removed. Please attach an Event Google Drive Folder Link instead.' },
        { status: 400 }
      );
    }

    if (!file || !eventId) {
      return NextResponse.json({ error: 'File and eventId are required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Map fileType to storage category folder
    let categoryFolder: 'RawPhotos' | 'GeoTagged' | 'FinalReel' = 'RawPhotos';
    if (fileType === 'GEOTAGGED') categoryFolder = 'GeoTagged';
    if (fileType === 'FINAL_REEL') categoryFolder = 'FinalReel';

    const eventDateStr = event.dateTime.toISOString().split('T')[0];

    const storedFile = await storageService.uploadFile({
      fileName: file.name,
      fileBuffer: buffer,
      mimeType: file.type || 'application/octet-stream',
      eventName: event.name,
      eventDate: eventDateStr,
      categoryFolder,
    });

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        eventId: event.id,
        fileName: storedFile.fileName,
        fileType,
        fileId: storedFile.fileId,
        drivePath: storedFile.drivePath,
        uploaderId: user.id,
        caption,
        geotagData,
      },
    });

    // Workflow state transitions
    if (fileType === 'FINAL_REEL') {
      // Mark event as REEL_SUBMITTED and reset approval chain to Dean PENDING
      await prisma.event.update({
        where: { id: event.id },
        data: { status: 'REEL_SUBMITTED' },
      });

      // Reset approval steps to PENDING for Dean stage
      await prisma.approvalStep.updateMany({
        where: { eventId: event.id },
        data: { status: 'PENDING', reviewerId: null, comments: null, reviewedAt: null },
      });

      await logAudit({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: 'REEL_SUBMITTED',
        details: `Submitted Final Reel version (${file.name}) for ${event.name}. Initiated approval chain at Dean stage.`,
      });
    } else {
      if (event.status === 'ASSIGNED' || event.status === 'REGISTERED') {
        await prisma.event.update({
          where: { id: event.id },
          data: { status: 'MEDIA_UPLOADED' },
        });
      }

      await logAudit({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: 'MEDIA_UPLOADED',
        details: `Uploaded ${fileType} asset: ${file.name} for event ${event.name}`,
      });
    }

    return NextResponse.json({ success: true, mediaAsset });
  } catch (err: any) {
    console.error('[Media Upload Error]', err);
    return NextResponse.json({ error: 'Failed to upload media asset' }, { status: 500 });
  }
}
