'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Mail,
  Building2,
  RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import KjitLogo from '@/components/KjitLogo';

interface TokenUser {
  email: string;
  name: string;
  role: string;
  department?: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenUser, setTokenUser] = useState<TokenUser | null>(null);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('Password reset token is missing from the link. Please check your email or contact your administrator.');
      return;
    }

    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
          setTokenUser({
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.department,
          });
        } else {
          setTokenValid(false);
          setTokenError(data.error || 'This password reset link is invalid or has expired.');
        }
        setVerifying(false);
      })
      .catch(() => {
        setTokenValid(false);
        setTokenError('Unable to connect to the authentication server to verify this link.');
        setVerifying(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update password.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
    } catch (err) {
      setFormError('A network error occurred while updating your password. Please try again.');
      setSubmitting(false);
    }
  };

  const getRoleLoginRoute = (role?: string) => {
    if (!role) return '/login';
    const slugMap: Record<string, string> = {
      ADMIN: 'admin',
      FACULTY: 'faculty',
      MEDIA_HEAD: 'media-head',
      MEDIA_MEMBER: 'media-member',
      DEAN: 'dean',
      HOD: 'hod',
      COORDINATOR: 'coordinator',
      SOCIAL_MEDIA_HANDLER: 'social-media-handler',
    };
    const slug = slugMap[role.toUpperCase()];
    return slug ? `/login/${slug}` : '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#0F2C59] selection:text-white transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              <span>Kristu Jayanti Institute of Technology Security Gateway</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {success ? 'Password Configured' : 'Configure Account Password'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {success
                ? 'Your password has been securely updated and your account is active.'
                : 'Set a new personalized password to activate your institutional access.'}
            </p>
          </div>

          {/* Loading verification state */}
          {verifying && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Verifying your secure password activation token...
              </p>
            </div>
          )}

          {/* Invalid / Expired Token */}
          {!verifying && !tokenValid && !success && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  Link Invalid or Expired
                </div>
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  {tokenError}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p className="font-semibold text-slate-700 dark:text-slate-200">What should I do?</p>
                <ul className="list-disc list-inside space-y-1 text-[11.5px]">
                  <li>Check if you received a more recent provisioning email.</li>
                  <li>Password reset links expire 24 hours after being issued.</li>
                  <li>Contact the Kristu Jayanti Institute of Technology Administrator to request a new link.</li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-2.5 bg-[#0F2C59] hover:bg-[#162E4D] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  Return to Portal Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Success State */}
          {!verifying && success && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Account Ready & Active!
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your new password has been configured successfully. Any initial temporary password has been permanently invalidated.
                </p>
              </div>

              {tokenUser && (
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-left space-y-1">
                  <div>
                    <span className="font-bold text-slate-500">Account:</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{tokenUser.name}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Email:</span>{' '}
                    <span className="font-mono text-slate-900 dark:text-white">{tokenUser.email}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Assigned Role:</span>{' '}
                    <span className="font-bold uppercase text-purple-700 dark:text-purple-400">{tokenUser.role}</span>
                  </div>
                </div>
              )}

              <div className="pt-3">
                <Link
                  href={getRoleLoginRoute(tokenUser?.role)}
                  className="w-full py-3 bg-[#0F2C59] hover:bg-[#162E4D] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Active Reset Form */}
          {!verifying && tokenValid && !success && (
            <div className="space-y-5">
              {/* User Identity Pill */}
              {tokenUser && (
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Account Holder</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {tokenUser.role}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{tokenUser.name}</div>
                  <div className="font-mono text-slate-600 dark:text-slate-400 text-xs">{tokenUser.email}</div>
                  {tokenUser.department && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{tokenUser.department}</div>
                  )}
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Account Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-red-500 mt-1 font-medium">Passwords do not match.</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match.
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Security Requirement:</p>
                  <p>• Once set, the initial default password will be permanently disabled.</p>
                  <p>• Use this new password to sign in across the institutional portal.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !password || password !== confirmPassword}
                  className="w-full py-3 bg-[#0F2C59] hover:bg-[#162E4D] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving New Password...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Set Password & Activate Account
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        Kristu Jayanti University • Kristu Jayanti Institute of Technology • Media Management System
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-xs font-bold text-slate-500">Loading Password Reset Gateway...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
