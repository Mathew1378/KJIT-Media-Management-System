'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, ShieldCheck, Mail, User as UserIcon, Building2, Lock, CheckCircle2, XCircle, AlertTriangle, Copy, RefreshCw, KeyRound, Check, Server, Send } from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
}

interface SMTPStatus {
  isConfigured: boolean;
  connected?: boolean;
  host?: string;
  port?: number;
  user?: string;
  fromEmail?: string;
  message?: string;
  error?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // SMTP Diagnostics State
  const [smtpStatus, setSmtpStatus] = useState<SMTPStatus | null>(null);
  const [checkingSmtp, setCheckingSmtp] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState('');
  const [testEmailErr, setTestEmailErr] = useState('');

  // Provisioning Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('FACULTY');
  const [department, setDepartment] = useState('School of Computer Science & Technology');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);

  // Feedback Alerts
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [emailModal, setEmailModal] = useState<{
    open: boolean;
    type: 'failed' | 'success';
    userId?: string;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    tempPassword?: string;
    errorMsg?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
        setLoading(false);
      });
  };

  const checkSMTP = () => {
    setCheckingSmtp(true);
    fetch('/api/admin/email/test')
      .then((res) => res.json())
      .then((data) => {
        setSmtpStatus({
          isConfigured: data.config?.isConfigured ?? false,
          connected: data.connected ?? false,
          host: data.config?.host,
          port: data.config?.port,
          user: data.config?.user,
          fromEmail: data.config?.fromEmail,
          message: data.message,
          error: data.error,
        });
        setCheckingSmtp(false);
      })
      .catch(() => {
        setSmtpStatus({ isConfigured: false, message: 'Failed to fetch SMTP diagnostics' });
        setCheckingSmtp(false);
      });
  };

  useEffect(() => {
    fetchUsers();
    checkSMTP();
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput) return;
    setSendingTestEmail(true);
    setTestEmailMsg('');
    setTestEmailErr('');

    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: testEmailInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailMsg(`Test email successfully delivered to ${testEmailInput}! Check inbox.`);
      } else {
        setTestEmailErr(data.error || 'Failed to dispatch test email.');
      }
    } catch (err) {
      setTestEmailErr('Network error while testing email.');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, department, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create user');
        setSubmitting(false);
        return;
      }

      if (data.emailSent) {
        setMsg(`User account created successfully for ${name} (${role}) and provisioning email sent.`);
      } else {
        // Email dispatch failed: open non-silent alert modal
        setEmailModal({
          open: true,
          type: 'failed',
          userId: data.user.id,
          userName: name,
          userEmail: email,
          userRole: role,
          tempPassword: password,
          errorMsg: data.emailError || 'SMTP server could not be reached or credentials missing.',
        });
      }

      setName('');
      setEmail('');
      setPassword('password123');
      setSubmitting(false);
      fetchUsers();
    } catch (err: any) {
      setError('Server error while provisioning account.');
      setSubmitting(false);
    }
  };

  const handleResendEmail = async (userId: string, generateNewPassword = false) => {
    try {
      const res = await fetch('/api/admin/users/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, generateNewPassword }),
      });
      const data = await res.json();
      if (res.ok && data.emailSent) {
        setMsg(`Provisioning email successfully dispatched.`);
        setEmailModal(null);
      } else {
        const u = users.find((x) => x.id === userId);
        setEmailModal({
          open: true,
          type: 'failed',
          userId,
          userName: u?.name || 'User',
          userEmail: u?.email || '',
          userRole: u?.role || '',
          tempPassword: data.tempPassword || 'Check Admin Records',
          errorMsg: data.emailError || 'Failed to resend provisioning email.',
        });
      }
    } catch (e) {
      setError('Error resending email');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      fetchUsers();
    } catch (e) {}
  };

  const copyLoginDetails = () => {
    if (!emailModal) return;
    const text = `Kristu Jayanti Institute of Technology Media Portal Account Credentials\nName: ${emailModal.userName}\nEmail: ${emailModal.userEmail}\nRole: ${emailModal.userRole}\nTemporary Password: ${emailModal.tempPassword}\nLogin: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-purple-700 dark:text-purple-400" />
          User Provisioning & Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Every user in the system is provisioned by an Administrator. Provisioning emails are dispatched automatically upon creation.
        </p>
      </div>

      {/* Real SMTP Delivery Diagnostics Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#0F2C59] dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                SMTP Real Email Service Diagnostics
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Verifies SMTP mail server connection and authentication in environment variables (.env.local)
              </p>
            </div>
          </div>

          <button
            onClick={checkSMTP}
            disabled={checkingSmtp}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingSmtp ? 'animate-spin' : ''}`} />
            {checkingSmtp ? 'Verifying...' : 'Test SMTP Connection'}
          </button>
        </div>

        {smtpStatus && (
          <div className="space-y-3">
            {smtpStatus.isConfigured ? (
              <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                smtpStatus.connected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}>
                {smtpStatus.connected ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <div><span className="font-bold">SMTP Host:</span> {smtpStatus.host}:{smtpStatus.port} ({smtpStatus.user})</div>
                  <div><span className="font-bold">Sender:</span> {smtpStatus.fromEmail}</div>
                  <div><span className="font-bold">Status:</span> {smtpStatus.message}</div>
                  {smtpStatus.error && <div className="text-[11px] font-mono text-red-600 dark:text-red-400">Error: {smtpStatus.error}</div>}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs space-y-1.5 font-medium">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  SMTP Server Credentials Missing in .env.local
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  Accounts will be created locally in the system database, but recipient emails cannot be delivered until real SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`) are added to <code className="font-mono bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-950 dark:text-amber-100">.env.local</code>.
                </p>
              </div>
            )}

            {/* Test Real Email Dispatch Form */}
            <form onSubmit={handleSendTestEmail} className="flex items-center gap-2 pt-1">
              <input
                type="email"
                required
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                placeholder="Enter recipient email to test real delivery (e.g. test@domain.com)"
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              <button
                type="submit"
                disabled={sendingTestEmail || !testEmailInput}
                className="px-3 py-1.5 bg-[#0F2C59] dark:bg-blue-600 hover:bg-[#162E4D] dark:hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingTestEmail ? 'Sending Test...' : 'Send Test Email'}
              </button>
            </form>
            {testEmailMsg && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{testEmailMsg}</div>}
            {testEmailErr && <div className="text-xs text-red-600 dark:text-red-400 font-bold">Error: {testEmailErr}</div>}
          </div>
        )}
      </div>

      {/* Email Delivery Failure Modal */}
      {emailModal && emailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Account Created, Email Delivery Failed
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  The account was created, but the email could not be sent.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 space-y-2 text-xs">
              <div><span className="font-bold text-slate-500 dark:text-slate-400">Account Name:</span> <span className="font-semibold text-slate-900 dark:text-white">{emailModal.userName}</span></div>
              <div><span className="font-bold text-slate-500 dark:text-slate-400">Email Address:</span> <span className="font-mono font-semibold text-slate-900 dark:text-white">{emailModal.userEmail}</span></div>
              <div><span className="font-bold text-slate-500 dark:text-slate-400">Assigned Role:</span> <span className="font-bold uppercase text-purple-700 dark:text-purple-400">{emailModal.userRole}</span></div>
              <div><span className="font-bold text-slate-500 dark:text-slate-400">Initial Password:</span> <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-slate-900 dark:text-white">{emailModal.tempPassword}</span></div>
              <div className="text-[11px] text-red-600 dark:text-red-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold">Error:</span> {emailModal.errorMsg}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => emailModal.userId && handleResendEmail(emailModal.userId)}
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Email
              </button>

              <button
                onClick={copyLoginDetails}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Login Details'}
              </button>

              <button
                onClick={() => setEmailModal(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision New User Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Provision New Account
        </h2>

        {msg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {msg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
              placeholder="Dr. John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
              placeholder="johndoe@kristujayanti.edu.in"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
            >
              <option value="ADMIN">ADMIN (System Control)</option>
              <option value="FACULTY">FACULTY (Event Creator)</option>
              <option value="MEDIA_HEAD">MEDIA HEAD (Operations Lead)</option>
              <option value="MEDIA_MEMBER">MEDIA MEMBER (Photographer/Editor)</option>
              <option value="DEAN">DEAN (Approval Stage 1)</option>
              <option value="HOD">HOD (Approval Stage 2)</option>
              <option value="COORDINATOR">PROGRAM COORDINATOR (Final Stage)</option>
              <option value="SOCIAL_MEDIA_HANDLER">SOCIAL MEDIA HANDLER (Reel Publishing)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Provisioning...' : 'Provision User Account'}
            </button>
          </div>
        </form>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Provisioned Accounts Directory</h2>
          <span className="text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            {users.length} Total Users
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">User Name</th>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold uppercase tracking-wider text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{u.department}</td>
                    <td className="px-5 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Resend Email Button */}
                        <button
                          onClick={() => handleResendEmail(u.id, false)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                          title="Resend Provisioning Email"
                        >
                          <Mail className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          Resend Email
                        </button>

                        {/* Reset Password & Send Credentials */}
                        <button
                          onClick={() => handleResendEmail(u.id, true)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1"
                          title="Generate New Temporary Password & Send Email"
                        >
                          <KeyRound className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Reset & Send
                        </button>

                        {/* Activate / Deactivate Toggle */}
                        <button
                          onClick={() => toggleUserStatus(u.id, u.isActive)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                            u.isActive
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
