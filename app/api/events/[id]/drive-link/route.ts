import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const eventId = params.id;
    const { driveFolderUrl } = await req.json();

    if (!driveFolderUrl) {
      return NextResponse.json({ error: 'Google Drive URL is required' }, { status: 400 });
    }

    // Extract drive folder ID if possible
    let folderId = 'drive_folder';
    const match = driveFolderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (match) {
      folderId = match[1];
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        driveFolderUrl,
        driveFolderId: folderId,
        driveFolderAddedBy: user.name,
        driveFolderAddedAt: new Date(),
      },
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'DRIVE_LINK_UPDATED',
      details: `Updated Google Drive Folder Link for event ${updatedEvent.name}`,
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (err: any) {
    console.error('[Drive Link Update Error]', err);
    return NextResponse.json({ error: 'Failed to update Google Drive link' }, { status: 500 });
  }
}
