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
    MEDIA_MEMBER: ['dashboard:view', 'media:upload', 'events:directory', 'calendar:view'],
    DEAN: ['dashboard:view', 'approvals:view', 'events:directory', 'calendar:view'],
    HOD: ['dashboard:view', 'approvals:view', 'events:directory', 'calendar:view'],
    COORDINATOR: ['dashboard:view', 'approvals:view', 'events:directory', 'calendar:view'],
  };

  for (const [role, perms] of Object.entries(rolePermissions)) {
    for (const code of perms) {
      await prisma.rolePermission.create({
        data: { role, permissionCode: code },
      });
    }
  }

  // 3. Create Default System Users
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);

  const defaultUsers = [
    { email: 'admin@kristujayanti.edu.in', name: 'System Administrator', role: 'ADMIN', department: 'Office of Information Technology' },
    { email: 'ezra@kristujayanti.com', name: 'Ezra Pandith', role: 'MEDIA_HEAD', department: 'Department of Media & Communication' },
    { email: 'ashley@kju.com', name: 'Ashley Thomas', role: 'MEDIA_MEMBER', department: 'Department of Media & Communication' },
    { email: 'nidhin@kju.com', name: 'Nidhin Kumar', role: 'MEDIA_MEMBER', department: 'Department of Media & Communication' },
    { email: 'charles@kju.com', name: 'Charles B', role: 'MEDIA_MEMBER', department: 'Department of Media & Communication' },
    { email: 'libin@kristujayanti.com', name: 'Dr. Libin', role: 'FACULTY', department: 'School of Computer Science & Technology' },
    { email: 'kumar@kristujayanti.com', name: 'Dr. R Kumar', role: 'DEAN', department: 'School of Computer Science & Technology' },
    { email: 'muruganantham@kristujayanti.com', name: 'Dr. Muruganantham', role: 'HOD', department: 'School of Computer Science & Technology' },
    { email: 'velmurugan@kristujayanti.com', name: 'Dr. Velmurugan R', role: 'COORDINATOR', department: 'School of Computer Science & Technology' },
  ];

  for (const u of defaultUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, department: u.department },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        department: u.department,
        passwordHash: defaultPasswordHash,
      },
    });
  }

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@kristujayanti.edu.in' } });

  // 4. Initial System Initialization Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      role: 'ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      details: 'KJIT Media Management System initialized with permissions and default accounts.',
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
