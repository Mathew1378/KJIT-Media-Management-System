'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Key, ArrowLeft, AlertCircle, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import KjitLogo from '@/components/KjitLogo';

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
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    demoEmail: 'admin@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'System provisioning, active user directory, and audit log inspection.',
  },
  faculty: {
    name: 'Faculty Portal',
    roleKey: 'FACULTY',
    badge: 'Event Registration',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    demoEmail: 'faculty@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Register academic events, track media deadlines, and generate official reports.',
  },
  'media-head': {
    name: 'Media Team Head Portal',
    roleKey: 'MEDIA_HEAD',
    badge: 'Media Operations',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    demoEmail: 'mediahead@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Assign media coverage personnel, designate event Editor, and manage Drive uploads.',
  },
  'media-member': {
    name: 'Media Team Member Portal',
    roleKey: 'MEDIA_MEMBER',
    badge: 'Field Coverage',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    demoEmail: 'mediamember@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Access assigned coverage tasks, upload geotagged photos, raw images, and video footage.',
  },
  dean: {
    name: 'Dean Approval Portal',
    roleKey: 'DEAN',
    badge: 'Approval Stage 1',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    demoEmail: 'dean@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Stage 1 review of final compiled event reels and department media publications.',
  },
  hod: {
    name: 'Head of Department (HOD) Portal',
    roleKey: 'HOD',
    badge: 'Approval Stage 2',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    demoEmail: 'hod@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Stage 2 review of department event media and academic compliance.',
  },
  coordinator: {
    name: 'Program Coordinator Portal',
    roleKey: 'COORDINATOR',
    badge: 'Final Publishing',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    demoEmail: 'coordinator@kristujayanti.edu.in',
    demoPass: 'password123',
    description: 'Final stage approval for publishing event reels to institutional archives.',
  },
};

export default function RoleLoginPage({ params }: { params: { role: string } }) {
  const router = useRouter();
  const roleSlug = params.role.toLowerCase();
  const config = ROLE_CONFIGS[roleSlug] || ROLE_CONFIGS['faculty'];

  const [email, setEmail] = useState(config.demoEmail);
  const [password, setPassword] = useState(config.demoPass);
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

  const handleAutoFillDemo = () => {
    setEmail(config.demoEmail);
    setPassword(config.demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0F2C59]">
      {/* Top Header */}
      <header className="w-full bg-[#0F2C59] border-b border-[#1E3E62] px-6 py-3 flex items-center justify-between text-white">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Back to Institutional Portal</span>
        </Link>
        <div className="text-[11px] text-amber-300 font-extrabold uppercase tracking-wider">
          Kristu Jayanti University • Internal Portal
        </div>
      </header>

      {/* Main Split Screen Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* LEFT COLUMN: Campus Branding Visual Area */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#0F2C59] via-[#162E4D] to-[#0A192F] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Texture & Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <KjitLogo variant="gold" size="lg" layout="full" showSubtitle={true} />

              <div className="pt-6 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 block">
                  Official Institutional Portal
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white leading-snug">
                  Kristu Jayanti Institute of Technology
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Private Media Management & Accreditation System for Departmental Operations, Event Documentation, and Academic Approvals.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-8 border-t border-white/10 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>NAAC A++ Accredited • UGC Autonomous</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Google Drive API v3 Encrypted Archival</span>
              </div>
              <div className="text-[10.5px] text-amber-300/80 font-serif italic pt-1">
                "Light & Prosperity • A CMI Educational Institution"
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Glass Login Form */}
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between bg-slate-50">
            <div className="space-y-6">
              {/* Header Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full border ${config.badgeColor}`}>
                    {config.badge}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Role Login
                  </span>
                </div>

                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {config.name}
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {config.description}
                </p>
              </div>

              {/* Quick Auto-Fill Demo Box */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs flex items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="font-extrabold text-[#0F2C59] block text-[11.5px]">Demo Account Credentials</span>
                  <span className="text-[11px] text-slate-600 font-mono">{config.demoEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="text-[11px] font-black bg-[#0F2C59] hover:bg-[#162E4D] text-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm shrink-0"
                >
                  Auto-Fill
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Controls */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0F2C59] focus:outline-none transition-all font-medium shadow-sm"
                      placeholder="name@kristujayanti.edu.in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0F2C59] focus:outline-none transition-all font-medium shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#0F2C59] focus:ring-[#0F2C59]"
                    />
                    <span>Remember this session</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact the KJIT Administrator to reset password.'); }} className="text-[#0F2C59] hover:underline font-bold text-[11px]">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#0F2C59] to-[#162E4D] hover:from-[#162E4D] hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 font-sans"
                >
                  {loading ? 'Authenticating Credentials...' : `Sign In to ${config.roleKey} Portal`}
                </button>
              </form>
            </div>

            <div className="pt-6 text-center border-t border-slate-200/80">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Protected by KJIT RBAC & Database Security Policies
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-[11px] text-slate-400 border-t border-slate-800 bg-[#0A192F]">
        Kristu Jayanti University • Kristu Jayanti Institute of Technology • Media Management Platform
      </footer>
    </div>
  );
}
