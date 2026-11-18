import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      role: true,
      department: true,
      isActive: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'KJ';

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    ADMIN: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-900 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    FACULTY: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-[#0F2C59] dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    MEDIA_HEAD: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    MEDIA_MEMBER: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-900 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
    DEAN: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-900 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
    HOD: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-900 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    COORDINATOR: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-900 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    SOCIAL_MEDIA_HANDLER: { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-900 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
  };

  const roleBadge = roleColors[user.role] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
          Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          View your profile details and manage your account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-2xl text-purple-600 dark:text-purple-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white font-serif">
                  Profile Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your registered account details
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center py-4 space-y-3">
              <div className="w-20 h-20 rounded-full bg-[#0F2C59] dark:bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                {initials}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {user.department}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                >
                  {user.role.replace('_', ' ')}
                </span>
                {user.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white font-serif">
                  Security Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your account password.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Update Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Change your account password by setting a new password.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/profile/change-password"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F2C59] hover:bg-[#162E4D] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all font-sans"
                >
                  Update Password
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
