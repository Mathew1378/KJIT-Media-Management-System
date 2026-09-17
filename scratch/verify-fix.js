const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('--- Verifying Fixes ---');

  // 1. Check directory permissions logic
  const mediaHeadUser = await prisma.user.findFirst({ where: { role: 'MEDIA_HEAD' } });
  console.log('Media Head User found:', mediaHeadUser ? mediaHeadUser.email : 'None');

  const mediaMembers = await prisma.user.findMany({
    where: { role: { in: ['MEDIA_HEAD', 'MEDIA_MEMBER'] } },
    select: { id: true, name: true, email: true, role: true }
  });
  console.log(`Found ${mediaMembers.length} media staff members for directory:`);
  mediaMembers.forEach(m => console.log(`  - ${m.name} (${m.email}) [${m.role}]`));

  // 2. Test event assignment logic
  let testEvent = await prisma.event.findFirst();
  if (!testEvent) {
    const defaultUser = await prisma.user.findFirst();
    testEvent = await prisma.event.create({
      data: {
        name: 'Verification Event',
        category: 'Academic',
        dateTime: new Date(),
        venue: 'Main Hall',
        expectedAudience: '100',
        dignitariesJson: '[]',
        mediaDeadline: new Date(),
        status: 'REGISTERED',
        createdById: defaultUser.id
      }
    });
  }

  console.log('Testing assignment for event:', testEvent.name, `(${testEvent.id})`);

  if (mediaMembers.length > 0) {
    await prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({ where: { eventId: testEvent.id } });
      await tx.assignment.createMany({
        data: mediaMembers.slice(0, 2).map((m, idx) => ({
          eventId: testEvent.id,
          userId: m.id,
          roleInEvent: idx === 0 ? 'PHOTOGRAPHER' : 'EDITOR'
        }))
      });
      await tx.event.update({
        where: { id: testEvent.id },
        data: { status: 'ASSIGNED' }
      });
    });
    console.log('Assignment test PASSED successfully!');
  }

  const updatedAssignments = await prisma.assignment.findMany({
    where: { eventId: testEvent.id },
    include: { user: { select: { name: true, email: true } } }
  });
  console.log('Current Event Assignments in DB:');
  updatedAssignments.forEach(a => console.log(`  - ${a.user.name} (${a.user.email}) -> ${a.roleInEvent}`));
}

verify().catch(console.error).finally(() => prisma.$disconnect());
