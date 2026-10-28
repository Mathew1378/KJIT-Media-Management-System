import nodemailer from 'nodemailer';

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}

export function getSMTPConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  let fromEmail = process.env.SMTP_FROM_EMAIL?.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fromEmail || !emailRegex.test(fromEmail)) {
    if (user && emailRegex.test(user)) {
      fromEmail = user;
    } else {
      fromEmail = 'no-reply@kristujayanti.edu.in';
    }
  }
  const fromName = process.env.SMTP_FROM_NAME?.trim() || 'Kristu Jayanti Institute of Technology Media Management System';
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const isConfigured = Boolean(host && user && password);

  return {
    isConfigured,
    host: host || 'Not set',
    port,
    secure,
    user: user || 'Not set',
    hasPassword: Boolean(password),
    fromEmail,
    fromName,
  };
}

function createTransporter() {
  const config = getSMTPConfig();

  if (!config.isConfigured || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASSWORD.trim(),
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
    connectionTimeout: 10000, // 10s
    greetingTimeout: 10000,
  });
}

export async function verifySMTPConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  message: string;
  error?: string;
}> {
  const config = getSMTPConfig();
  if (!config.isConfigured) {
    const missing: string[] = [];
    if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
    if (!process.env.SMTP_USER) missing.push('SMTP_USER');
    if (!process.env.SMTP_PASSWORD) missing.push('SMTP_PASSWORD');

    return {
      configured: false,
      connected: false,
      message: 'SMTP credentials missing in environment variables (.env.local)',
      error: `Missing required environment variables: ${missing.join(', ')}`,
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      configured: false,
      connected: false,
      message: 'Transporter creation failed.',
      error: 'Unable to initialize nodemailer transporter with current configuration.',
    };
  }

  try {
    await transporter.verify();
    return {
      configured: true,
      connected: true,
      message: `Successfully connected and authenticated with SMTP server (${config.host}:${config.port}).`,
    };
  } catch (err: any) {
    console.error('[SMTP Verification Error]', err);
    let errorMessage = err.message || 'SMTP Authentication / Connection Refused error.';
    if (err.code === 'ECONNREFUSED') {
      errorMessage = `Connection refused at ${config.host}:${config.port}. Check host and port.`;
    } else if (err.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Verify SMTP_USER and SMTP_PASSWORD.';
    } else if (err.code === 'ESOCKET' || err.code === 'ETIMEDOUT') {
      errorMessage = `Connection to ${config.host}:${config.port} timed out. Verify network or firewall rules.`;
    }

    return {
      configured: true,
      connected: false,
      message: `Failed to connect/authenticate with SMTP server (${config.host}:${config.port}).`,
      error: errorMessage,
    };
  }
}

export interface ProvisioningEmailOptions {
  name: string;
  email: string;
  role: string;
  department?: string;
  password?: string;
  resetToken?: string;
  resetUrl?: string;
  loginUrl?: string;
}

export async function sendProvisioningEmail(
  options: ProvisioningEmailOptions
): Promise<{ success: boolean; error?: string; smtpConfigured: boolean; messageId?: string }> {
  const { name, email, role, department, password, resetToken } = options;
  const baseUrl = getAppBaseUrl();

  const resetUrl =
    options.resetUrl ||
    (resetToken ? `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}` : `${baseUrl}/reset-password`);
  const loginUrl = options.loginUrl || `${baseUrl}/login`;

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return {
      success: false,
      smtpConfigured: false,
      error: `Invalid recipient email address: '${email}'`,
    };
  }

  const config = getSMTPConfig();
  if (!config.isConfigured) {
    console.warn('[Email Service] SMTP configuration missing. Provisioning email not sent.');
    return {
      success: false,
      smtpConfigured: false,
      error:
        'SMTP server not configured in environment variables (.env.local). Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.',
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      smtpConfigured: false,
      error: 'Failed to initialize SMTP mail transporter.',
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #0f2942; color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
          .content { padding: 36px 28px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .field { margin-bottom: 12px; }
          .field:last-child { margin-bottom: 0; }
          .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
          .field-value { font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-all; }
          .badge { display: inline-block; font-size: 11px; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background: #0f2942; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; letter-spacing: 0.3px; text-align: center; }
          .notice { font-size: 12px; color: #475569; background: #eff6ff; border: 1px solid #dbeafe; padding: 14px; border-radius: 8px; margin: 24px 0; line-height: 1.5; }
          .link-box { font-size: 11px; color: #64748b; background: #f1f5f9; padding: 10px 14px; border-radius: 6px; word-break: break-all; font-family: monospace; margin-top: 8px; }
          .footer { background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Kristu Jayanti University</h1>
            <p>Kristu Jayanti Institute of Technology · Media Management System</p>
          </div>
          <div class="content">
            <h2 style="margin-top:0; font-size: 18px; color: #0f2942;">Account Provisioning & Password Setup</h2>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              An institutional account for the <strong>Kristu Jayanti Institute of Technology Media Management System</strong> has been provisioned for you by the system administrator.
            </p>

            <div class="card">
              <div class="field">
                <div class="field-label">Account Holder</div>
                <div class="field-value">${name}</div>
              </div>
              <div class="field">
                <div class="field-label">Institutional Email</div>
                <div class="field-value">${email}</div>
              </div>
              <div class="field">
                <div class="field-label">Assigned Role</div>
                <div class="field-value"><span class="badge">${role}</span></div>
              </div>
              ${
                department
                  ? `
              <div class="field">
                <div class="field-label">Department</div>
                <div class="field-value">KRISTU JAYANTI INSTITUTE OF TECHNOLOGY (KJIT)</div>
              </div>
              `
                  : ''
              }
            </div>

            <div class="notice">
              <strong>Action Required:</strong> For security compliance, you must set your personal password before signing in. Click the button below to configure your password:
            </div>

            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">Set Your Password & Activate Account</a>
            </div>

            <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
              If the button above does not open, copy and paste this secure link into your web browser:
            </p>
            <div class="link-box">
              ${resetUrl}
            </div>

            <p style="font-size: 11px; color: #94a3b8; margin-top: 20px; line-height: 1.5;">
              * This activation link is secure, single-use, and valid for <strong>24 hours</strong>. Once used, it will be automatically invalidated.
            </p>
          </div>
          <div class="footer">
            <strong>Kristu Jayanti Institute of Technology Media Management System</strong><br/>
            Kristu Jayanti Institute of Technology · Kristu Jayanti University<br/>
            This is an automated system email. Please do not reply directly to this address.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: email.trim(),
      subject: 'Activate Your Kristu Jayanti Institute of Technology Media Portal Account',
      html: htmlContent,
    });
    console.log('[Email Service] Provisioning email dispatched successfully:', info.messageId);
    return { success: true, smtpConfigured: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[Email Service Error]', err);
    let errorMessage = err.message || 'SMTP server error during mail dispatch.';
    if (err.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Verify SMTP username and password.';
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = `Connection to SMTP server (${config.host}:${config.port}) was refused.`;
    }
    return {
      success: false,
      smtpConfigured: true,
      error: errorMessage,
    };
  }
}

export async function sendTestEmail(recipientEmail: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!recipientEmail || !emailRegex.test(recipientEmail.trim())) {
    return { success: false, error: `Invalid recipient email address: '${recipientEmail}'` };
  }

  const config = getSMTPConfig();
  if (!config.isConfigured) {
    return { success: false, error: 'SMTP credentials missing in environment variables (.env.local).' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to initialize SMTP transporter.' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipientEmail.trim(),
      subject: 'Kristu Jayanti Institute of Technology Media Portal — Diagnostic SMTP Connection Test',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 550px; margin: 0 auto;">
          <h2 style="color: #0f2942; margin-top: 0;">SMTP Diagnostic Test Successful</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">This message confirms that real SMTP email dispatch is operational for the <strong>Kristu Jayanti Institute of Technology Media Management System</strong>.</p>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Configured SMTP Host:</strong> ${config.host}:${config.port}</p>
            <p style="margin: 4px 0;"><strong>Sender Address:</strong> ${config.fromEmail}</p>
            <p style="margin: 4px 0;"><strong>Recipient:</strong> ${recipientEmail.trim()}</p>
            <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Kristu Jayanti Institute of Technology · Media Management System</p>
        </div>
      `,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[Send Test Email Error]', err);
    return { success: false, error: err.message || 'Failed to dispatch test email.' };
  }
}
