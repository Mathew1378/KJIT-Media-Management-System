'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Key, ArrowLeft, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import KjitLogo from '@/components/KjitLogo';
import Navbar from '@/components/Navbar';

interface RoleConfig {
  name: string;
  roleKey: string;
  badge: string;
  badgeColor: string;
  demoEmail: string;
  demoPass: string;
  description: string;
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  admin: {
    name: 'Administrator Portal',
    roleKey: 'ADMIN',
    badge: 'System Control',
    badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
    demoEmail: 'admin@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'System provisioning, active user directory, and audit log inspection.',
  },
  faculty: {
    name: 'Faculty Portal',
    roleKey: 'FACULTY',
    badge: 'Event Registration',
    badgeColor: 'bg-blue-50 text-[#0F2C59] border-blue-200',
    demoEmail: 'faculty@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Register academic events, track media deadlines, and generate official reports.',
  },
  'media-head': {
    name: 'Media Team Head Portal',
    roleKey: 'MEDIA_HEAD',
    badge: 'Media Operations',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
    demoEmail: 'mediahead@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Assign media coverage personnel, designate event Editor, and manage Drive uploads.',
  },
  'media-member': {
    name: 'Media Team Member Portal',
    roleKey: 'MEDIA_MEMBER',
    badge: 'Field Coverage',
    badgeColor: 'bg-teal-50 text-teal-900 border-teal-200',
    demoEmail: 'mediamember@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Access assigned coverage tasks, upload geotagged photos, raw images, and video footage.',
  },
  dean: {
    name: 'Dean Approval Portal',
    roleKey: 'DEAN',
    badge: 'Approval Stage 1',
    badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    demoEmail: 'dean@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Stage 1 review of final compiled event reels and department media publications.',
  },
  hod: {
    name: 'Head of Department (HOD) Portal',
    roleKey: 'HOD',
    badge: 'Approval Stage 2',
    badgeColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
    demoEmail: 'hod@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Stage 2 review of department event media and academic compliance.',
  },
  coordinator: {
    name: 'Program Coordinator Portal',
    roleKey: 'COORDINATOR',
    badge: 'Final Publishing',
    badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    demoEmail: 'coordinator@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Final stage approval for publishing event reels to institutional archives.',
  },
  'social-media-handler': {
    name: 'Social Media Handler Portal',
    roleKey: 'SOCIAL_MEDIA_HANDLER',
    badge: 'Social Media Desk',
    badgeColor: 'bg-pink-50 text-pink-900 border-pink-200',
    demoEmail: 'socialmedia@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Access fully approved department reels, generate AI captions, and publish to Instagram & Facebook.',
  },
};

export default function RoleLoginPage({ params }: { params: { role: string } }) {
  const router = useRouter();
  const roleSlug = params.role.toLowerCase();
  const config = ROLE_CONFIGS[roleSlug] || ROLE_CONFIGS['faculty'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: config.roleKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError('Connection error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#0F2C59] selection:text-white transition-colors">
      {/* Top Header */}
      <Navbar />

      {/* Main Split Screen Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
          {/* LEFT COLUMN: Campus Branding Visual Area */}
          <div className="lg:col-span-5 bg-[#0F2C59] dark:bg-slate-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <KjitLogo variant="light" size="login" layout="full" showSubtitle={true} />

              <div className="pt-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
                  Official Institutional Portal
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
                  Kristu Jayanti Institute of Technology
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Private Media Management & Accreditation System for Departmental Operations, Event Documentation, and Academic Approvals.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>NAAC A++ Accredited • UGC Autonomous</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Drive API v3 Encrypted Archival</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Clean ERP Login Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white dark:bg-slate-900">
            <div className="space-y-6">
              {/* Back button & Header Title */}
              <div className="space-y-3">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#0F2C59] dark:hover:text-amber-400 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5 text-[#0F2C59] dark:text-amber-400" />
                  <span>Back to Sign In Selection</span>
                </Link>

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${config.badgeColor}`}>
                    {config.badge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Role Login
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {config.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  {config.description}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg p-3 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Controls */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#0F2C59] dark:focus:ring-amber-400 focus:border-[#0F2C59] dark:focus:border-amber-400 focus:outline-none transition-all font-medium"
                      placeholder="name@kristujayanti.edu.in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#0F2C59] dark:focus:ring-amber-400 focus:border-[#0F2C59] dark:focus:border-amber-400 focus:outline-none transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#0F2C59] focus:ring-[#0F2C59]"
                    />
                    <span>Remember this session</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact the Kristu Jayanti Institute of Technology Administrator to reset password.'); }} className="text-[#0F2C59] dark:text-amber-400 hover:underline font-semibold text-[11px]">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0F2C59] hover:bg-[#162E4D] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Authenticating Credentials...' : `Sign In to ${config.roleKey} Portal`}
                </button>
              </form>
            </div>

            <div className="pt-5 text-center border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                Protected by Kristu Jayanti Institute of Technology RBAC & Security Policies
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        Kristu Jayanti University • Kristu Jayanti Institute of Technology • Media Management Platform
      </footer>
    </div>
  );
}
