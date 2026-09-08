'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Tag,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Film,
  Image as ImageIcon,
  UserCheck,
  ArrowLeft,
  Download,
  AlertCircle,
  Sparkles,
  Building2,
} from 'lucide-react';
import GoogleDriveCard from '@/components/GoogleDriveCard';
import StatusBadge from '@/components/StatusBadge';
import ApprovalTimeline from '@/components/ApprovalTimeline';

interface EventDetail {
  id: string;
  name: string;
  category: string;
  dateTime: string;
  venue: string;
  expectedAudience: string;
  dignitariesJson: string;
  chiefGuest: string;
  guestCount: number;
  specialInstructions: string;
  mediaDeadline: string;
  status: string;
  driveFolderUrl?: string;
  driveFolderId?: string;
  driveFolderAddedBy?: string;
  driveFolderAddedAt?: string;
  createdBy: { name: string; email: string; department: string };
  assignments: { id: string; roleInEvent: string; user: { name: string; role: string } }[];
  mediaAssets: {
    id: string;
    fileName: string;
    fileType: string;
    fileId: string;
    drivePath: string;
    caption: string;
    geotagData: string;
    createdAt: string;
    uploader: { name: string; role: string };
  }[];
  approvalSteps: {
    id: string;
    stage: string;
    status: string;
    comments: string;
    reviewedAt: string;
    reviewer: { name: string; role: string } | null;
  }[];
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchEvent = () => {
    fetch(`/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.event) setEvent(data.event);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400 font-medium">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="text-slate-600 font-black text-lg">Event Not Found</div>
        <Link href="/dashboard" className="text-xs text-[#0F2C59] underline font-bold">
          Return to Dashboard Overview
        </Link>
      </div>
    );
  }

  const dignitaries = JSON.parse(event.dignitariesJson || '[]');

  return (
    <div className="space-y-10">
      {/* BACK LINK */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#0F2C59] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" /> Back to Dashboard Overview
        </Link>
      </div>

      {/* EDITORIAL HERO HEADER */}
      <div className="bg-gradient-to-br from-[#0F2C59] via-[#162E4D] to-[#0A192F] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-blue-900/50 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-amber-300 px-3 py-1 rounded-full border border-white/20">
                {event.category}
              </span>
              <StatusBadge status={event.status} size="sm" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif leading-tight">
              {event.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Registered by <strong className="text-white">{event.createdBy?.name}</strong> ({event.createdBy?.department}) • Kristu Jayanti Institute of Technology
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            {['MEDIA_HEAD', 'ADMIN'].includes(user?.role) && (
              <Link
                href="/dashboard/assignments"
                className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all font-sans"
              >
                Assign Media Team
              </Link>
            )}

            {['MEDIA_HEAD', 'MEDIA_MEMBER', 'ADMIN'].includes(user?.role) && (
              <Link
                href="/dashboard/uploads"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/20 backdrop-blur-md transition-all"
              >
                Upload Media
              </Link>
            )}

            {['FACULTY', 'DEAN', 'HOD', 'COORDINATOR'].includes(user?.role) && (
              <Link
                href={`/dashboard/reports?eventId=${event.id}`}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all font-sans"
              >
                Generate Report
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* PROMINENT GOOGLE DRIVE CARD */}
      <GoogleDriveCard
        driveFolderLink={event.driveFolderUrl}
        eventName={event.name}
        addedBy={event.driveFolderAddedBy || 'Media Team'}
        date={event.driveFolderAddedAt ? new Date(event.driveFolderAddedAt).toLocaleDateString('en-IN') : 'Current Year'}
        status={event.driveFolderUrl ? 'Synced & Active' : 'Drive Link Pending'}
      />

      {/* SECTION CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* EVENT DETAILS SPEC CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-lg space-y-6">
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0F2C59]" />
              Event Schedule & Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Date & Time</span>
                <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#0F2C59]" />
                  {new Date(event.dateTime).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Venue</span>
                <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  {event.venue}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Expected Audience</span>
                <div className="font-bold text-slate-800 text-xs">{event.expectedAudience}</div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-800 block">Coverage Deadline</span>
                <div className="font-black text-amber-950 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  {new Date(event.mediaDeadline).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {event.chiefGuest && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Keynote / Chief Guest</span>
                <div className="font-black text-slate-900 text-sm">{event.chiefGuest}</div>
              </div>
            )}

            {event.specialInstructions && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Special Instructions for Media Team</span>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium italic leading-relaxed">
                  "{event.specialInstructions}"
                </p>
              </div>
            )}
          </div>

          {/* DIGNITARIES TABLE */}
          {dignitaries.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-lg space-y-4">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Visiting Dignitaries & Resource Persons ({dignitaries.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Dignitary Name</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Organisation / Affiliation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {dignitaries.map((d: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-black text-slate-900">{d.name}</td>
                        <td className="p-3 text-slate-600">{d.designation}</td>
                        <td className="p-3 text-slate-600">{d.organisation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MEDIA ASSETS GALLERY */}
          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">
                Uploaded Media Assets ({event.mediaAssets.length})
              </h2>
              <span className="text-xs font-bold text-slate-400">Google Drive Storage</span>
            </div>

            {event.mediaAssets.length === 0 ? (
              <div className="p-12 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 font-bold">No media assets uploaded yet for this event.</p>
                {['MEDIA_HEAD', 'MEDIA_MEMBER', 'FACULTY', 'ADMIN'].includes(user?.role) && (
                  <Link
                    href="/dashboard/uploads"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F2C59] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow transition-colors font-sans"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload Media Now
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {event.mediaAssets.map((asset) => (
                  <div key={asset.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 text-xs shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 truncate max-w-[200px]">{asset.fileName}</span>
                      <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-[#0F2C59] px-2.5 py-0.5 rounded-full border border-blue-200">
                        {asset.fileType}
                      </span>
                    </div>

                    {asset.caption && <p className="text-xs text-slate-600 italic">"{asset.caption}"</p>}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-[11px]">
                      <span className="text-slate-500 font-medium">By {asset.uploader?.name}</span>
                      <a
                        href={`/api/media/file/${asset.fileId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-black text-[#0F2C59] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Stream
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Assignments & Approvals */}
        <div className="space-y-8">
          {/* MEDIA TEAM ASSIGNMENTS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-lg space-y-4">
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Assigned Media Team</span>
              <Users className="w-5 h-5 text-[#0F2C59]" />
            </h2>

            {event.assignments.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">No media team personnel assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {event.assignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="font-black text-slate-900 block">{a.user?.name}</span>
                      <span className="text-[10px] text-slate-500">{a.user?.role}</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {a.roleInEvent}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3-STAGE APPROVAL WORKFLOW STATUS */}
          <ApprovalTimeline
            status={event.status}
            deanApprovedAt={event.approvalSteps?.find((s) => s.stage === 'DEAN' && s.status === 'APPROVED')?.reviewedAt}
            hodApprovedAt={event.approvalSteps?.find((s) => s.stage === 'HOD' && s.status === 'APPROVED')?.reviewedAt}
            coordinatorApprovedAt={event.approvalSteps?.find((s) => s.stage === 'COORDINATOR' && s.status === 'APPROVED')?.reviewedAt}
          />
        </div>
      </div>
    </div>
  );
}
