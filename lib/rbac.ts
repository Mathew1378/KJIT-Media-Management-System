import { prisma } from './prisma';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    'dashboard:view',
    'users:manage',
    'audit:view',
    'directory:view',
    'events:directory',
    'calendar:view',
  ],
  FACULTY: [
    'dashboard:view',
    'events:create',
    'reports:generate',
    'events:directory',
    'calendar:view',
  ],
  MEDIA_HEAD: [
    'dashboard:view',
    'assignments:manage',
    'media:upload',
    'directory:view',
    'events:directory',
    'calendar:view',
  ],
  MEDIA_MEMBER: [
    'dashboard:view',
    'media:upload',
    'directory:view',
    'events:directory',
    'calendar:view',
  ],
  DEAN: [
    'dashboard:view',
    'approvals:view',
    'directory:view',
    'events:directory',
    'calendar:view',
  ],
  HOD: [
    'dashboard:view',
    'approvals:view',
    'directory:view',
    'events:directory',
    'calendar:view',
  ],
  COORDINATOR: [
    'dashboard:view',
    'approvals:view',
    'directory:view',
    'events:directory',
    'calendar:view',
  ],
};

export async function hasPermission(role: string, permissionCode: string): Promise<boolean> {
  try {
    const dbPermissions = await prisma.rolePermission.findMany({
      where: { role: role.toUpperCase() },
    });

    if (dbPermissions.length > 0) {
      return dbPermissions.some((p) => p.permissionCode === permissionCode);
    }
  } catch (err) {
    // Fall back to memory default if DB query fails during startup
  }

  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role.toUpperCase()] || [];
  return defaultPerms.includes(permissionCode);
}

export async function seedPermissions() {
  // Clear old permissions to ensure exact sync
  await prisma.rolePermission.deleteMany({});

  for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const code of perms) {
      await prisma.rolePermission.create({
        data: {
          role,
          permissionCode: code,
        },
      });
    }
  }
}
