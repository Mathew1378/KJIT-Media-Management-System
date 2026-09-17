'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  FileCheck,
  HardDrive,
  BarChart3,
  Search,
  Compass,
  Layers,
  CheckSquare,
  Award,
  BookOpen,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import KjitLogo from '@/components/KjitLogo';

export default function LandingPage() {
  const roles = [
    {
      title: 'Administrator',
      roleKey: 'admin',
      route: '/login/admin',
      desc: 'Provision staff accounts, manage system RBAC permissions, inspect audit logs, and enforce security policies.',
      badge: 'System Control',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    },
    {
      title: 'Faculty',
      roleKey: 'faculty',
      route: '/login/faculty',
      desc: 'Register academic events, upload dignitary details, track coverage deadlines, and generate 8-format official reports.',
      badge: 'Event Registration',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      title: 'Media Team Head',
      roleKey: 'media-head',
      route: '/login/media-head',
      desc: 'Oversee department media calendar, assign field coverage personnel, designate event Editor, and monitor Drive folders.',
      badge: 'Media Operations',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'Media Team Member',
      roleKey: 'media-member',
      route: '/login/media-member',
      desc: 'Access assigned coverage tasks, upload geotagged photos, raw press images, and compiled video reels.',
      badge: 'Field Coverage',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    },
    {
      title: 'Dean',
      roleKey: 'dean',
      route: '/login/dean',
      desc: 'First-stage formal review of compiled final event reels and department media publications.',
      badge: 'Approval Stage 1',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    },
    {
      title: 'Head of Department (HOD)',
      roleKey: 'hod',
      route: '/login/hod',
      desc: 'Second-stage review of event media assets, documentation accuracy, and academic compliance.',
      badge: 'Approval Stage 2',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    },
    {
      title: 'Program Coordinator',
      roleKey: 'coordinator',
      route: '/login/coordinator',
      desc: 'Final stage approval for publishing event reels and archiving academic documentation.',
      badge: 'Final Publishing',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0F2C59] transition-colors">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/60 dark:from-[#071226] dark:via-[#0c1a30] dark:to-slate-950 text-slate-900 dark:text-white pt-8 sm:pt-12 pb-16 sm:pb-20 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(#0F2C59_1px,transparent_1px)] dark:bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-10 dark:opacity-15 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/90 dark:bg-white/10 backdrop-blur-md border border-blue-200/80 dark:border-amber-400/30 text-xs font-extrabold text-[#0F2C59] dark:text-[#D4AF37] shadow-sm dark:shadow-xl"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-[#D4AF37] animate-pulse" />
              <span>Kristu Jayanti Institute of Technology • Media Management System</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#0F2C59] via-blue-800 to-indigo-900 dark:from-[#D4AF37] dark:via-amber-200 dark:to-amber-400 font-serif font-black">
                  Kristu Jayanti Institute of Technology
                </span>
                <span className="block text-[#0F2C59] dark:text-white font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl mt-2">
                  Media Management System
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto"
            >
              Official internal digital platform for managing departmental events, media coverage, cloud archives, and academic reporting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-2 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/login"
                className="px-7 py-3.5 rounded-xl bg-[#0F2C59] hover:bg-[#162E4D] text-white dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-amber-500 dark:hover:from-amber-400 dark:hover:to-amber-600 dark:text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg dark:shadow-xl flex items-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#0F2C59] border border-slate-300/80 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 font-bold text-xs uppercase tracking-wider transition-all shadow-sm backdrop-blur-md flex items-center gap-2"
              >
                <span>Explore Platform</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-300 font-medium border-t border-slate-200/80 dark:border-white/10 w-full max-w-xl mx-auto"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Role-Based RBAC</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Google Drive API v3</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3-Stage Approvals</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A192F] dark:bg-slate-950 text-white py-12 border-t border-blue-900/60 dark:border-slate-800 text-xs">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-serif font-black text-sm text-white tracking-wide">
              KRISTU JAYANTI UNIVERSITY (DEEMED TO BE UNIVERSITY)
            </div>
            <div className="text-slate-400 text-[11px]">
              Kristu Jayanti Institute of Technology • School of Computer Science & Technology
            </div>
            <div className="text-amber-300/80 text-[10px] font-semibold">
              K. Narayanapura, Kothanur P.O., Bengaluru - 560077, Karnataka, India
            </div>
          </div>

          <div className="text-slate-400 text-[11px] space-y-1 md:text-right">
            <div>&copy; {new Date().getFullYear()} Kristu Jayanti University. All rights reserved.</div>
            <div className="text-[10px] text-slate-500">Internal Media Management System • Confidential</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
