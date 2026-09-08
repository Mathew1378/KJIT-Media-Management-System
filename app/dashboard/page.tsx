'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  ShieldCheck,
  Building2,
  Compass,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import EventCard from '@/components/EventCard';
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
      .catch((err) => setLoading(false));
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

  return (
    <div className="space-y-10">
      {/* INSTITUTIONAL WELCOME BANNER */}
      <div className="bg-gradient-to-r from-[#0F2C59] via-[#162E4D] to-[#0A192F] rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute right-0 top-0 w-[450px] h-[450px] bg-gradient-to-br from-[#D4AF37]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-extrabold backdrop-blur-md border border-white/15 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Kristu Jayanti University • Institutional Command Centre</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Good morning, {user?.name || 'Faculty'}
            </h1>
            <p className="text-amber-200/90 text-sm font-semibold tracking-wide">
              KJIT Media Management System • {user?.department || 'Department Workspace'}
            </p>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal pt-1">
            Welcome to your official digital operations workspace. Manage event registrations, assign field media teams, track Google Drive v3 cloud storage, and process 3-stage departmental approvals.
          </p>
        </div>
      </div>

      {/* 4 LARGE INSTITUTIONAL STATISTIC CARDS */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0F2C59]" />
            Departmental Media Operations Metrics
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Academic Year 2026-2027
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="TOTAL EVENTS"
            value={loading ? '...' : totalEvents}
            subtitle={`${Math.max(0, totalEvents - publishedEvents)} active/upcoming events`}
            icon={CalendarDays}
            colorVariant="navy"
            delay={0}
          />
          <StatCard
            title="PENDING MEDIA"
            value={loading ? '...' : inProgress}
            subtitle={`${inProgress} active media team tasks`}
            icon={UploadCloud}
            colorVariant="amber"
            delay={0.1}
          />
          <StatCard
            title="APPROVALS"
            value={loading ? '...' : pendingApprovals}
            subtitle="Awaiting Dean / HOD / Coordinator review"
            icon={Clock}
            colorVariant="gold"
            delay={0.2}
          />
          <StatCard
            title="COMPLETED"
            value={loading ? '...' : publishedEvents}
            subtitle="Archived in academic repository"
            icon={CheckCircle2}
            colorVariant="emerald"
            delay={0.3}
          />
        </div>
      </div>

      {/* QUICK WORKSPACE ACTIONS */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
          Quick Workflows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {isPermitted('events:create') && (
            <Link
              href="/dashboard/events/new"
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#0F2C59] shadow-md hover:shadow-xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0F2C59] flex items-center justify-center font-bold shrink-0">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Register New Event
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Faculty 6-step guided wizard</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {isPermitted('assignments:manage') && (
            <Link
              href="/dashboard/assignments"
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#0F2C59] shadow-md hover:shadow-xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Coverage Assignments
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Assign media team members & Editor</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {isPermitted('media:upload') && (
            <Link
              href="/dashboard/uploads"
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#0F2C59] shadow-md hover:shadow-xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold shrink-0">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Upload Media Assets
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Geotagged photos, raw press & reels</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {isPermitted('approvals:view') && (
            <Link
              href="/dashboard/approvals"
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#0F2C59] shadow-md hover:shadow-xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Department Approvals
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Dean / HOD / Coordinator workflow</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          {isPermitted('reports:generate') && user?.role !== 'ADMIN' && (
            <Link
              href="/dashboard/reports"
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#0F2C59] shadow-md hover:shadow-xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                    Academic Report Generator
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">8 official formats + PDF/Word export</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F2C59] group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>
      </div>

      {/* RECENT ACADEMIC EVENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Registered Department Events</h2>
            <p className="text-xs text-slate-500 mt-0.5">Active institutional events, venue details, and workflow progress</p>
          </div>
          <Link
            href="/dashboard/calendar"
            className="text-xs font-black text-[#0F2C59] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors bg-blue-50 px-4 py-2 rounded-xl border border-blue-200"
          >
            <CalendarDays className="w-4 h-4" /> View Calendar &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading department events...</div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CalendarDays className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-600">No events registered yet in clean state mode.</p>
            {isPermitted('events:create') && (
              <Link
                href="/dashboard/events/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0F2C59] to-[#162E4D] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:from-[#162E4D] hover:to-slate-900 transition-all font-sans"
              >
                <PlusCircle className="w-4 h-4" /> Register First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10.5px] font-black">
                <tr>
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date & Venue</th>
                  <th className="px-6 py-4">Organizer</th>
                  <th className="px-6 py-4">Media Assets</th>
                  <th className="px-6 py-4">Workflow Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900">
                      <Link href={`/dashboard/events/${evt.id}`} className="hover:text-[#0F2C59]">
                        {evt.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {evt.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-bold text-slate-900">{new Date(evt.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{evt.venue}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {evt.createdBy?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-[#0F2C59] border border-blue-200 px-3 py-1 rounded-full font-extrabold text-[11px]">
                        {evt.mediaAssets?.length || 0} Assets
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={evt.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/events/${evt.id}`}
                        className="text-xs font-extrabold text-[#0F2C59] hover:text-white hover:bg-[#0F2C59] px-4 py-2 rounded-xl border border-blue-200 transition-all inline-block shadow-sm"
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
