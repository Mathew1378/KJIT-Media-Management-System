import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { storageService } from '@/lib/storage/StorageService';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { id: true, name: true, email: true, department: true } },
      assignments: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      mediaAssets: {
        include: {
          uploader: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      approvalSteps: {
        include: {
          reviewer: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Only administrators can delete events' }, { status: 403 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      mediaAssets: true,
      createdBy: { select: { department: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  try {
    // Execute database deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated notifications
      await tx.notification.deleteMany({ where: { eventId: params.id } });

      // 2. Delete social media publication
      await tx.socialMediaPublication.deleteMany({ where: { eventId: params.id } });

      // 3. Delete generated reports
      await tx.report.deleteMany({ where: { eventId: params.id } });

      // 4. Delete approval steps
      await tx.approvalStep.deleteMany({ where: { eventId: params.id } });

      // 5. Delete media assets metadata
      await tx.mediaAsset.deleteMany({ where: { eventId: params.id } });

      // 6. Delete assignments
      await tx.assignment.deleteMany({ where: { eventId: params.id } });

      // 7. Delete the event itself
      await tx.event.delete({ where: { id: params.id } });
    });
  } catch (error: any) {
    console.error('[Delete Event DB Error]', error);
    return NextResponse.json(
      { error: 'Failed to delete event from database' },
      { status: 500 }
    );
  }

  // Cleanup physical files from storage if present (post-commit)
  if (event.posterFileId) {
    try {
      await storageService.deleteFile(event.posterFileId);
    } catch (err) {
      console.warn(`[StorageService] Could not remove poster file ${event.posterFileId}:`, err);
    }
  }

  if (event.mediaAssets && event.mediaAssets.length > 0) {
    for (const asset of event.mediaAssets) {
      if (asset.fileId) {
        try {
          await storageService.deleteFile(asset.fileId);
        } catch (err) {
          console.warn(`[StorageService] Could not remove media file ${asset.fileId}:`, err);
        }
      }
    }
  }

  // Record the deletion in System Audit Logs (isolated so audit failure cannot mask successful deletion)
  try {
    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'EVENT_DELETED',
      details: `Permanently deleted event: "${event.name}" (ID: ${event.id}) under department "${event.createdBy?.department || 'N/A'}"`,
    });
  } catch (auditErr) {
    console.error('[AuditLog Error] Failed to record EVENT_DELETED log:', auditErr);
  }

  return NextResponse.json({
    success: true,
    message: `Event "${event.name}" has been permanently deleted.`,
  });
}
