import { prisma } from './prisma';

export async function logAudit(options: {
  userId?: string;
  userName?: string;
  role?: string;
  action: string;
  details: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        userName: options.userName,
        role: options.role,
        action: options.action,
        details: options.details,
        ipAddress: options.ipAddress || '127.0.0.1',
      },
    });
  } catch (err) {
    console.error('[AuditLog Error]', err);
  }
}
