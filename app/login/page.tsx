'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface RoleCard {
  title: string;
  roleKey: string;
  route: string;
  desc: string;
  badge: string;
  badgeColor: string;
}

const ROLES: RoleCard[] = [
  {
    title: 'Administrator',
    roleKey: 'ADMIN',
    route: '/login/admin',
    desc: 'System provisioning, active user directory management, RBAC configuration, and audit logs.',
    badge: 'System Control',
    badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
  },
  {
    title: 'Faculty / Teacher',
    roleKey: 'FACULTY',
    route: '/login/faculty',
    desc: 'Register academic events, upload dignitary details, track media deadlines, and generate official reports.',
    badge: 'Event Registration',
    badgeColor: 'bg-blue-50 text-[#0F2C59] border-blue-200',
  },
  {
    title: 'Media Team Head',
    roleKey: 'MEDIA_HEAD',
    route: '/login/media-head',
    desc: 'Oversee department media calendar, assign field personnel, designate Editor, and manage Drive folders.',
    badge: 'Media Operations',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  {
    title: 'Media Team Member',
    roleKey: 'MEDIA_MEMBER',
    route: '/login/media-member',
    desc: 'Access assigned coverage tasks, upload geotagged photos, raw press images, and compiled video reels.',
    badge: 'Field Coverage',
    badgeColor: 'bg-teal-50 text-teal-900 border-teal-200',
  },
  {
    title: 'Dean',
    roleKey: 'DEAN',
    route: '/login/dean',
    desc: 'Review compiled event media reels, validate department publications, and authorize publishing.',
    badge: 'Approval Authority',
    badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  },
  {
    title: 'Head of Department (HOD)',
    roleKey: 'HOD',
    route: '/login/hod',
    desc: 'Departmental review of event media assets, documentation accuracy, and academic compliance.',
    badge: 'Approval Authority',
    badgeColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
  },
  {
    title: 'Programme Coordinator',
    roleKey: 'COORDINATOR',
    route: '/login/coordinator',
    desc: 'Independent approval for publishing event reels and archiving academic documentation.',
    badge: 'Approval Authority',
    badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  {
    title: 'Social Media Handler',
    roleKey: 'SOCIAL_MEDIA_HANDLER',
    route: '/login/social-media-handler',
    desc: 'Access fully approved department reels, generate AI captions, and publish to Instagram and LinkedIn.',
    badge: 'Social Media Desk',
    badgeColor: 'bg-pink-50 text-pink-900 border-pink-200',
  },
];

export default function CommonLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#0F2C59] selection:text-white transition-colors">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex flex-col justify-center">
        {/* Title Header */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/80 text-[#0F2C59] dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
            <ShieldCheck className="w-4 h-4 text-[#0F2C59] dark:text-blue-400" />
            <span>Institutional Access Point</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sign In to Kristu Jayanti Institute of Technology Media Portal
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Select your assigned institutional role below to access your role-specific dashboard and workspace.
          </p>
        </div>

        {/* Roles Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROLES.map((role, idx) => (
            <motion.div
              key={role.roleKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx }}
            >
              <Link
                href={role.route}
                className="group block h-full bg-white dark:bg-slate-900 hover:border-[#0F2C59] dark:hover:border-amber-400 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-all shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${role.badgeColor}`}
                    >
                      {role.badge}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F2C59] dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0F2C59] dark:group-hover:text-amber-400 transition-colors">
                    {role.title}
                  </h2>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-[#0F2C59] dark:text-amber-400 flex items-center justify-between">
                  <span>Sign In as {role.title}</span>
                  <span className="text-base">&rarr;</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        Kristu Jayanti University • Kristu Jayanti Institute of Technology • Media Management System
      </footer>
    </div>
  );
}
