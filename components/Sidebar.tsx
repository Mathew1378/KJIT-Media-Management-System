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
  HardDrive,
  Share2,
} from 'lucide-react';

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
      show: isPermitted('directory:view') && userRole === 'ADMIN',
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
      label: 'Social Media Desk',
      href: '/dashboard/social-media',
      icon: Share2,
      show: isPermitted('social:manage'),
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
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-3.75rem)] p-4 flex flex-col justify-between shadow-sm shrink-0">
      <div className="space-y-5">
        {/* Active Workspace Info Card */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Workspace
            </span>
          </div>
          <div className="font-bold text-xs text-[#0F2C59]">
            Kristu Jayanti Institute of Technology Media Management
          </div>
          <div className="text-[10.5px] text-slate-500 font-medium">
            Role: <span className="font-bold text-[#0F2C59]">{userRole.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            ERP Navigation
          </p>
          <nav className="space-y-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${isActive
                        ? 'bg-blue-50 text-[#0F2C59] font-bold border-l-4 border-[#0F2C59] shadow-none'
                        : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-[#0F2C59]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F2C59]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>

      {/* Google Drive Status Footer */}
      <div className="pt-3 border-t border-slate-200">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10.5px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="flex items-center gap-1.5 text-[10px]">
              <HardDrive className="w-3.5 h-3.5 text-[#0F2C59]" />
              Drive Storage Engine
            </span>
            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
              Active v3
            </span>
          </div>
          <p className="text-[9.5px] text-slate-500 leading-tight">
            Synced to official Kristu Jayanti Institute of Technology Google Drive cloud folder.
          </p>
        </div>
      </div>
    </aside>
  );
}
