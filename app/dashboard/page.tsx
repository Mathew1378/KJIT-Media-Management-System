'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  FileCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Users,
  Tag,
  Building2,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';

interface EventItem {
  id: string;
  name: string;
  category: string;
  dateTime: string;
  venue: string;
  status: string;
  createdBy: { name: string; email: string };
  assignments: any[];
  mediaAssets: any[];
  approvalSteps: any[];
}

export default function DashboardOverview() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        if (data.permissions) setPermissions(data.permissions);
      });

    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalEvents = events.length;
  const pendingApprovals = events.filter((e) =>
    ['REEL_SUBMITTED', 'DEAN_APPROVED', 'HOD_APPROVED', 'AWAITING_DEAN', 'AWAITING_HOD', 'AWAITING_COORDINATOR'].includes(e.status)
  ).length;
  const inProgress = events.filter((e) =>
    ['REGISTERED', 'ASSIGNED', 'MEDIA_UPLOADED', 'MEDIA_ASSIGNED', 'EDITING'].includes(e.status)
  ).length;
  const publishedEvents = events.filter((e) => ['PUBLISHED', 'APPROVED', 'COMPLETED'].includes(e.status)).length;

  const isPermitted = (code: string) => permissions.includes(code);

  if (user?.role === 'SOCIAL_MEDIA_HANDLER') {
    const SocialMediaDashboardPage = require('./social-media/page').default;
    return <SocialMediaDashboardPage />;
  }

  return (
    <div className="space-y-8">
      {/* INSTITUTIONAL ERP WELCOME BANNER */}
      <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm text-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#0F2C59] text-[10.5px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#0F2C59]" />
            <span>Kristu Jayanti University • Institutional Command Centre</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name || 'Faculty'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Kristu Jayanti Institute of Technology Media Management System • {user?.department || 'School of Computer Science & Technology'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Academic Year 2026-2027
          </span>
        </div>
      </div>

      {/* 4 INSTITUTIONAL STATISTIC CARDS */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F2C59]" />
            Departmental Media Operations Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="TOTAL EVENTS"
            value={loading ? '...' : totalEvents}
            subtitle={`${Math.max(0, totalEvents - publishedEvents)} active/upcoming events`}
            icon={CalendarDays}
            colorVariant="navy"
          />
          <StatCard
            title="PENDING MEDIA"
            value={loading ? '...' : inProgress}
            subtitle={`${inProgress} active media team tasks`}
            icon={UploadCloud}
            colorVariant="amber"
          />
          <StatCard
            title="APPROVALS"
            value={loading ? '...' : pendingApprovals}
            subtitle="Awaiting Dean / HOD / Coordinator"
            icon={Clock}
            colorVariant="gold"
          />
          <StatCard
            title="COMPLETED"
            value={loading ? '...' : publishedEvents}
            subtitle="Archived in academic repository"
            icon={CheckCircle2}
            colorVariant="emerald"
          />
        </div>
      </div>

      {/* QUICK WORKSPACE ACTIONS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Workflows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isPermitted('events:create') && (
            <Link
              href="/dashboard/events/new"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0F2C59] shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0F2C59] flex items-center justify-center font-bold shrink-0 border border-blue-100">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Register New Event
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Faculty 6-step guided wizard</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}

          {isPermitted('assignments:manage') && (
            <Link
              href="/dashboard/assignments"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0F2C59] shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold shrink-0 border border-amber-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Coverage Assignments
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Assign media team members & Editor</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}

          {isPermitted('media:upload') && (
            <Link
              href="/dashboard/uploads"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0F2C59] shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold shrink-0 border border-purple-100">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Upload Media Assets
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Geotagged photos, raw press & reels</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}

          {isPermitted('approvals:view') && (
            <Link
              href="/dashboard/approvals"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0F2C59] shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold shrink-0 border border-indigo-100">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Department Approvals
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dean / HOD / Coordinator workflow</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}

          {isPermitted('reports:generate') && user?.role !== 'ADMIN' && (
            <Link
              href="/dashboard/reports"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0F2C59] shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0 border border-emerald-100">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Academic Report Generator
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">8 official formats + PDF/Word export</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}
        </div>
      </div>

      {/* RECENT ACADEMIC EVENTS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base font-bold text-slate-900">Registered Department Events</h2>
            <p className="text-xs text-slate-500 mt-0.5">Active institutional events, venue details, and workflow progress</p>
          </div>
          <Link
            href="/dashboard/calendar"
            className="text-xs font-bold text-[#0F2C59] hover:bg-blue-50 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <CalendarDays className="w-3.5 h-3.5" /> View Calendar &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading department events...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-600">No events registered yet in clean state mode.</p>
            {isPermitted('events:create') && (
              <Link
                href="/dashboard/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#162E4D] transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Register First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10.5px] font-bold">
                <tr>
                  <th className="px-5 py-3">Event Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date & Venue</th>
                  <th className="px-5 py-3">Organizer</th>
                  <th className="px-5 py-3">Media Assets</th>
                  <th className="px-5 py-3">Workflow Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <Link href={`/dashboard/events/${evt.id}`} className="hover:text-[#0F2C59]">
                        {evt.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {evt.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="font-semibold text-slate-900">{new Date(evt.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-[11px] text-slate-500">{evt.venue}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {evt.createdBy?.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-blue-50 text-[#0F2C59] border border-blue-200 px-2.5 py-0.5 rounded font-bold text-[11px]">
                        {evt.mediaAssets?.length || 0} Assets
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={evt.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/dashboard/events/${evt.id}`}
                        className="text-xs font-bold text-[#0F2C59] hover:bg-[#0F2C59] hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 transition-all inline-block shadow-sm"
                      >
                        View Event
                      </Link>
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
