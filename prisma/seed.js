const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KJIT Media Management Database (Clean Slate Mode)...');

  // 1. Clear operational & sample data
  await prisma.report.deleteMany({});
  await prisma.approvalStep.deleteMany({});
  await prisma.mediaAsset.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.rolePermission.deleteMany({});

  // 2. Seed Clean Role Permissions
  const rolePermissions = {
    ADMIN: ['dashboard:view', 'users:manage', 'audit:view', 'directory:view', 'events:directory', 'calendar:view'],
    FACULTY: ['dashboard:view', 'events:create', 'reports:generate', 'events:directory', 'calendar:view'],
    MEDIA_HEAD: ['dashboard:view', 'assignments:manage', 'media:upload', 'directory:view', 'events:directory', 'calendar:view'],
    MEDIA_MEMBER: ['dashboard:view', 'media:upload', 'directory:view', 'events:directory', 'calendar:view'],
    DEAN: ['dashboard:view', 'approvals:view', 'directory:view', 'events:directory', 'calendar:view'],
    HOD: ['dashboard:view', 'approvals:view', 'directory:view', 'events:directory', 'calendar:view'],
    COORDINATOR: ['dashboard:view', 'approvals:view', 'directory:view', 'events:directory', 'calendar:view'],
  };

  for (const [role, perms] of Object.entries(rolePermissions)) {
    for (const code of perms) {
      await prisma.rolePermission.create({
        data: { role, permissionCode: code },
      });
    }
  }

  // 3. Delete non-admin demo users
  await prisma.user.deleteMany({
    where: {
      email: {
        not: 'admin@kristujayanti.edu.in',
      },
    },
  });

  // 4. Create Master System Admin User for User Provisioning
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kristujayanti.edu.in' },
    update: {
      name: 'System Administrator',
      role: 'ADMIN',
      department: 'Office of Information Technology',
    },
    create: {
      email: 'admin@kristujayanti.edu.in',
      name: 'System Administrator',
      role: 'ADMIN',
      department: 'Office of Information Technology',
      passwordHash: defaultPasswordHash,
    },
  });

  // 5. Initial System Initialization Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      role: 'ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      details: 'KJIT Media Management System initialized in Clean Slate Mode for production deployment.',
    },
  });

  console.log('Clean Slate Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
