import nodemailer from 'nodemailer';

export function getSMTPConfig() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@kristujayanti.edu.in';
  const fromName = process.env.SMTP_FROM_NAME || 'Kristu Jayanti Institute of Technology Media Management System';

  const isConfigured = Boolean(host && user && password);

  return {
    isConfigured,
    host: host || 'Not set',
    port,
    user: user || 'Not set',
    hasPassword: Boolean(password),
    fromEmail,
    fromName,
  };
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
    connectionTimeout: 10000, // 10s
  });
}

export async function verifySMTPConnection(): Promise<{ configured: boolean; connected: boolean; message: string; error?: string }> {
  const config = getSMTPConfig();
  if (!config.isConfigured) {
    return {
      configured: false,
      connected: false,
      message: 'SMTP credentials missing in environment variables (.env.local)',
      error: 'SMTP_HOST, SMTP_USER, or SMTP_PASSWORD not configured.',
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      configured: false,
      connected: false,
      message: 'Transporter creation failed.',
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
    return {
      configured: true,
      connected: false,
      message: `Failed to connect/authenticate with SMTP server (${config.host}:${config.port}).`,
      error: err.message || 'SMTP Authentication / Connection Refused error.',
    };
  }
}

export interface ProvisioningEmailOptions {
  name: string;
  email: string;
  role: string;
  password: string;
  loginUrl?: string;
}

export async function sendProvisioningEmail(options: ProvisioningEmailOptions): Promise<{ success: boolean; error?: string; smtpConfigured: boolean }> {
  const { name, email, role, password } = options;
  const loginUrl = options.loginUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/login';

  const config = getSMTPConfig();
  if (!config.isConfigured) {
    console.warn('[Email Service] SMTP configuration missing. Provisioning email not sent.');
    return {
      success: false,
      smtpConfigured: false,
      error: 'SMTP server not configured in environment variables (.env.local). Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.',
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
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          .header { background: #0f2942; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 12px; color: #cbd5e1; text-transform: uppercase; tracking: 1px; }
          .content { padding: 32px 24px; }
          .card { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .field { margin-bottom: 12px; }
          .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
          .field-value { font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-all; }
          .password-value { font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700; color: #0f2942; background: #e2e8f0; padding: 6px 10px; border-radius: 4px; display: inline-block; }
          .btn { display: inline-block; background: #0f2942; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 16px; text-align: center; }
          .notice { font-size: 12px; color: #64748b; background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px; margin-top: 20px; }
          .footer { background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Kristu Jayanti University</h1>
            <p>Kristu Jayanti Institute of Technology — Media Management System</p>
          </div>
          <div class="content">
            <h2 style="margin-top:0; font-size: 18px; color: #0f2942;">Your Account Has Been Created</h2>
            <p style="font-size: 14px; color: #334155;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 14px; color: #334155;">Your account for the <strong>Kristu Jayanti Institute of Technology Media Management System</strong> has been created by the system administrator.</p>

            <div class="card">
              <div class="field">
                <div class="field-label">Account Holder Name</div>
                <div class="field-value">${name}</div>
              </div>
              <div class="field">
                <div class="field-label">Registered Email</div>
                <div class="field-value">${email}</div>
              </div>
              <div class="field">
                <div class="field-label">Assigned Role</div>
                <div class="field-value">${role}</div>
              </div>
              <div class="field" style="margin-bottom:0;">
                <div class="field-label">Initial Temporary Password</div>
                <div class="password-value">${password}</div>
              </div>
            </div>

            <div class="notice">
              <strong>Security Requirement:</strong> For security reasons, you will be required to change your initial password when you first sign in.
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="${loginUrl}" class="btn">Sign In to Media Portal</a>
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 24px;">If you did not expect this account, please contact the system administrator.</p>
          </div>
          <div class="footer">
            <strong>Kristu Jayanti Institute of Technology Media Management System</strong><br/>
            Kristu Jayanti Institute of Technology · Kristu Jayanti University
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: email,
      subject: 'Your Kristu Jayanti Institute of Technology Media Management System Account Has Been Created',
      html: htmlContent,
    });
    console.log('[Email Service] Provisioning email dispatched successfully:', info.messageId);
    return { success: true, smtpConfigured: true };
  } catch (err: any) {
    console.error('[Email Service Error]', err);
    return {
      success: false,
      smtpConfigured: true,
      error: err.message || 'SMTP server error during mail dispatch.',
    };
  }
}

export async function sendTestEmail(recipientEmail: string): Promise<{ success: boolean; error?: string }> {
  const config = getSMTPConfig();
  if (!config.isConfigured) {
    return { success: false, error: 'SMTP credentials missing in environment variables (.env.local).' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to initialize SMTP transporter.' };
  }

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipientEmail,
      subject: 'Kristu Jayanti Institute of Technology Media Portal — Diagnostic SMTP Connection Test',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <h2 style="color: #0f2942;">SMTP Diagnostic Test Successful</h2>
          <p>This test message confirms that real SMTP email dispatch is working for the <strong>Kristu Jayanti Institute of Technology Media Management System</strong>.</p>
          <p><strong>Configured SMTP Host:</strong> ${config.host}:${config.port}</p>
          <p><strong>Sender:</strong> ${config.fromEmail}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch test email.' };
  }
}
