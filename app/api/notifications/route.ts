import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { role: user.role },
        ],
      },
      include: {
        event: { select: { id: true, name: true, category: true, dateTime: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    console.error('[Get Notifications Error]', err);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { notificationId, markAll } = await req.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: user.id },
            { role: user.role },
          ],
          isRead: false,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Update Notification Error]', err);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
