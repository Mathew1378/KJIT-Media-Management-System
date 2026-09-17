import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { verifySMTPConnection, sendTestEmail, getSMTPConfig } from '@/lib/email/email-service';

export async function GET() {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'users:manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const result = await verifySMTPConnection();
  const config = getSMTPConfig();

  return NextResponse.json({
    ...result,
    config: {
      isConfigured: config.isConfigured,
      host: config.host,
      port: config.port,
      user: config.user,
      hasPassword: config.hasPassword,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    },
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !(await hasPermission(user.role, 'users:manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { testEmail } = await req.json();
    if (!testEmail) {
      return NextResponse.json({ error: 'Recipient email is required for test dispatch.' }, { status: 400 });
    }

    const result = await sendTestEmail(testEmail.trim());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
