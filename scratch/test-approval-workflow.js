const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWorkflow() {
  console.log('--- Testing Approval Workflow ---');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  
  // 1. Create a test event
  const testEvt = await prisma.event.create({
    data: {
      name: 'Workflow Order Test Event',
      category: 'Academic',
      dateTime: new Date(),
      venue: 'A1 Hall',
      expectedAudience: '50',
      dignitariesJson: '[]',
      mediaDeadline: new Date(),
      status: 'REGISTERED',
      createdById: admin.id,
    }
  });

  // 2. Initialize approval steps (Program Coordinator -> HOD -> Dean)
  await prisma.approvalStep.createMany({
    data: [
      { eventId: testEvt.id, stage: 'COORDINATOR', status: 'PENDING' },
      { eventId: testEvt.id, stage: 'HOD', status: 'PENDING' },
      { eventId: testEvt.id, stage: 'DEAN', status: 'PENDING' },
    ]
  });

  const steps = await prisma.approvalStep.findMany({
    where: { eventId: testEvt.id }
  });

  console.log('Created Approval Steps in DB:');
  steps.forEach(s => console.log(`  - Stage: ${s.stage}, Status: ${s.status}`));

  if (steps[0].stage === 'COORDINATOR' && steps[1].stage === 'HOD' && steps[2].stage === 'DEAN') {
    console.log('✅ Approval Step Order PASSED: Program Coordinator -> HOD -> Dean');
  } else {
    console.error('❌ Approval Step Order FAILED');
  }

  // Clean up test event
  await prisma.event.delete({ where: { id: testEvt.id } });
}

testWorkflow().catch(console.error).finally(() => prisma.$disconnect());
