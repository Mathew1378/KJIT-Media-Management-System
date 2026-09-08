const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('Resetting KJIT Media Management Database (Clean Slate Mode)...');

  // 1. Delete all operational data
  await prisma.report.deleteMany({});
  await prisma.approvalStep.deleteMany({});
  await prisma.mediaAsset.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.rolePermission.deleteMany({});

  console.log('Cleared all events, assignments, media assets, reports, approval steps, and audit logs.');

  // 2. Clean local uploads directory if it exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (fs.existsSync(uploadsDir)) {
    fs.rmSync(uploadsDir, { recursive: true, force: true });
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Cleaned local uploads directory.');
  }

  // 3. Ensure clean seed of RBAC permissions
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

  // 4. Delete demo users except master admin
  await prisma.user.deleteMany({
    where: {
      email: {
        not: 'admin@kristujayanti.edu.in',
      },
    },
  });

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

  // Create initial system reset audit log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      role: 'ADMIN',
      action: 'DATABASE_RESET',
      details: 'Database reset performed. System returned to Clean Slate production baseline.',
    },
  });

  console.log('Database reset completed successfully! All sample data has been cleared.');
}

resetDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
