'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users,
  UploadCloud,
  FileCheck,
  FileSpreadsheet,
  ShieldAlert,
  UserPlus,
  BookOpen,
  Sparkles,
  HardDrive,
} from 'lucide-react';
import KjitLogo from './KjitLogo';

interface SidebarProps {
  userRole?: string;
  permissions?: string[];
}

export default function Sidebar({ userRole = 'FACULTY', permissions = [] }: SidebarProps) {
  const pathname = usePathname();

  const isPermitted = (permCode: string) => {
    return permissions.includes(permCode);
  };

  const navItems = [
    {
      label: 'Dashboard Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: isPermitted('dashboard:view'),
    },
    {
      label: 'User Management',
      href: '/dashboard/admin/users',
      icon: UserPlus,
      show: isPermitted('users:manage'),
    },
    {
      label: 'System Audit Logs',
      href: '/dashboard/admin/audit-logs',
      icon: ShieldAlert,
      show: isPermitted('audit:view'),
    },
    {
      label: 'Active User Directory',
      href: '/dashboard/directory',
      icon: BookOpen,
      show: isPermitted('directory:view') && userRole !== 'FACULTY',
    },
    {
      label: 'Register Event',
      href: '/dashboard/events/new',
      icon: PlusCircle,
      show: isPermitted('events:create'),
    },
    {
      label: 'Team Assignments',
      href: '/dashboard/assignments',
      icon: Users,
      show: isPermitted('assignments:manage'),
    },
    {
      label: 'Upload Media Assets',
      href: '/dashboard/uploads',
      icon: UploadCloud,
      show: isPermitted('media:upload'),
    },
    {
      label: 'Department Approvals',
      href: '/dashboard/approvals',
      icon: FileCheck,
      show: isPermitted('approvals:view'),
    },
    {
      label: 'Academic Reports',
      href: '/dashboard/reports',
      icon: FileSpreadsheet,
      show: isPermitted('reports:generate') && userRole !== 'ADMIN',
    },
    {
      label: 'Calendar / Schedule',
      href: '/dashboard/calendar',
      icon: CalendarDays,
      show: isPermitted('calendar:view'),
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200/80 min-h-[calc(100vh-5rem)] p-5 flex flex-col justify-between shadow-sm shrink-0">
      <div className="space-y-6">
        {/* Institutional Sidebar Header Card */}
        <div className="bg-gradient-to-br from-[#0F2C59] to-[#162E4D] rounded-2xl p-4 text-white shadow-md border border-blue-900/40 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Active Workspace
            </span>
          </div>
          <div className="font-serif font-bold text-sm leading-tight text-white">
            KJIT Media Portal
          </div>
          <div className="text-[10.5px] text-slate-300 font-sans mt-0.5">
            Role: <span className="font-extrabold text-amber-300">{userRole.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-kjit-gold" />
            Institutional Navigation
          </p>
          <nav className="space-y-1.5">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#0F2C59] text-white shadow-lg shadow-blue-950/20 border border-blue-900/60'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-[#0F2C59]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-kjit-gold' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-4 rounded-full bg-[#D4AF37]" />
                    )}
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>

      {/* Google Drive Repository Status Footer */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="flex items-center gap-1.5 text-[10.5px]">
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              Drive Storage Engine
            </span>
            <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
              Active v3
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Directly synced to official KJIT Google Drive cloud folder.
          </p>
        </div>
      </div>
    </aside>
  );
}

