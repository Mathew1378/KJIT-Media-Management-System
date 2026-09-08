'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Shield, Sparkles, Compass } from 'lucide-react';
import KjitLogo from './KjitLogo';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
    department: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    ADMIN: { bg: 'bg-purple-900/60', text: 'text-purple-200', border: 'border-purple-500/40' },
    FACULTY: { bg: 'bg-blue-900/60', text: 'text-blue-200', border: 'border-blue-500/40' },
    MEDIA_HEAD: { bg: 'bg-amber-900/60', text: 'text-amber-200', border: 'border-amber-500/40' },
    MEDIA_MEMBER: { bg: 'bg-teal-900/60', text: 'text-teal-200', border: 'border-teal-500/40' },
    DEAN: { bg: 'bg-indigo-900/60', text: 'text-indigo-200', border: 'border-indigo-500/40' },
    HOD: { bg: 'bg-cyan-900/60', text: 'text-cyan-200', border: 'border-cyan-500/40' },
    COORDINATOR: { bg: 'bg-emerald-900/60', text: 'text-emerald-200', border: 'border-emerald-500/40' },
  };

  const roleBadge = user ? roleColors[user.role] || { bg: 'bg-slate-800', text: 'text-slate-200', border: 'border-slate-600' } : null;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F2C59] text-white border-b border-[#1E3E62] shadow-xl">
      {/* Top Institutional Ribbon */}
      <div className="bg-[#0A192F] border-b border-[#162E4D] px-4 py-1.5 text-[10.5px] font-medium text-slate-300">
        <div className="max-w-[1536px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <span className="text-kjit-gold font-black tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-kjit-gold" />
              KRISTU JAYANTI UNIVERSITY
            </span>
            <span className="hidden md:inline text-slate-400 font-normal">
              Kristu Jayanti Institute of Technology (KJIT)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300">
            <span className="hidden sm:inline text-amber-300">A CMI Institution</span>
            <span className="hidden sm:inline">• NAAC A++ Accredited</span>
            <span className="bg-[#0066CC] text-white px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider">
              Internal Media System
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Official Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center group py-1">
          <KjitLogo variant="light" size="md" layout="full" showSubtitle={true} />
        </Link>

        {/* User Status / Navigation Actions */}
        {user ? (
          <div className="flex items-center gap-4 sm:gap-6">
            {/* User Profile Card */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs font-black text-white tracking-wide">{user.name}</span>
              <span className="text-[11px] text-blue-200 font-medium">{user.department}</span>
            </div>

            {/* Role Badge */}
            {roleBadge && (
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
              >
                {user.role.replace('_', ' ')}
              </span>
            )}

            {/* Notification Bell */}
            <button
              className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-[#162E4D] hover:bg-red-600 px-3.5 py-2 rounded-xl transition-all border border-blue-400/20 shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              <Compass className="w-3.5 h-3.5 text-kjit-gold" />
              Explore Platform
            </Link>
            <Link
              href="/login/faculty"
              className="text-xs font-black bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-slate-950 px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 font-sans tracking-wide"
            >
              Staff Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

