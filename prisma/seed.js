const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KJIT Media Management System Role Permissions...');

  // Standard RBAC Role Permissions matching lib/rbac.ts
  const rolePermissions = {
    ADMIN: ['dashboard:view', 'users:manage', 'audit:view', 'directory:view', 'events:directory', 'calendar:view'],
    FACULTY: ['dashboard:view', 'events:create', 'reports:generate', 'events:directory', 'calendar:view'],
    MEDIA_HEAD: ['dashboard:view', 'assignments:manage', 'media:upload', 'directory:view', 'events:directory', 'calendar:view'],
    MEDIA_MEMBER: ['dashboard:view', 'media:upload', 'events:directory', 'calendar:view'],
    DEAN: ['dashboard:view', 'approvals:view', 'events:directory', 'calendar:view'],
    HOD: ['dashboard:view', 'approvals:view', 'events:directory', 'calendar:view'],
    COORDINATOR: ['dashboard:view', 'approvals:view', 'events:directory', 'calendar:view'],
    SOCIAL_MEDIA_HANDLER: ['dashboard:view', 'social:manage'],
  };

  // Safe, idempotent role-permission seeding: does not delete operational data or modify users
  for (const [role, perms] of Object.entries(rolePermissions)) {
    for (const code of perms) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionCode: {
            role,
            permissionCode: code,
          },
        },
        update: {},
        create: {
          role,
          permissionCode: code,
        },
      });
    }
  }

  console.log('Role permission seeding completed successfully! No user records were modified.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
