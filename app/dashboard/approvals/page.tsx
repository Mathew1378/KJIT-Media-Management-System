'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Film,
  ArrowLeft,
  Download,
  AlertCircle,
  Building2,
  ShieldCheck,
  ExternalLink,
  Tag,
  User,
  MessageSquare,
} from 'lucide-react';
import ApprovalTimeline from '@/components/ApprovalTimeline';
import StatusBadge from '@/components/StatusBadge';

interface ApprovalEvent {
  id: string;
  name: string;
  category: string;
  dateTime: string;
  venue: string;
  status: string;
  createdBy: { name: string; email: string; department: string };
  mediaAssets: { id: string; fileName: string; fileId: string; caption: string; fileType: string; fileUrl?: string }[];
  approvalSteps: {
    stage: string;
    status: string;
    comments: string;
    reviewedAt: string;
    reviewer: { name: string; role: string } | null;
  }[];
}

export default function ApprovalsPage() {
  const [events, setEvents] = useState<ApprovalEvent[]>([]);
  const [userStage, setUserStage] = useState<string>('DEAN');
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [activeEvent, setActiveEvent] = useState<ApprovalEvent | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchApprovals = () => {
    fetch('/api/approvals')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
        if (data.userStage) setUserStage(data.userStage);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (action: 'APPROVE' | 'REJECT') => {
    if (!activeEvent) return;
    setSubmitting(true);
    setMsg('');
    setError('');

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          action,
          comments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to process decision');
        setSubmitting(false);
        return;
      }

      setMsg(
        action === 'APPROVE'
          ? `Approved event final reel successfully! Status updated to ${data.newStatus}.`
          : `Rejected event reel with comments. Returned to Editor for revision.`
      );

      setActiveEvent(null);
      setComments('');
      setSubmitting(false);
      fetchApprovals();
    } catch (err: any) {
      setError('Connection error');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#0F2C59] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" /> Back to Dashboard Overview
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-[#0F2C59]" />
            Department Approval Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sequential 3-Stage Approval Chain: Dean Review &rarr; HOD Review &rarr; Program Coordinator Final Approval.
          </p>
        </div>

        <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-xs font-black text-slate-800 shadow-md flex items-center gap-3 shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#0F2C59]" />
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-extrabold">Active Reviewer Stage</div>
            <div className="text-sm text-[#0F2C59] font-black">{userStage} STAGE</div>
          </div>
        </div>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* EVENTS APPROVAL QUEUE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden space-y-6">
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Events Awaiting Approval Action</h2>
            <p className="text-xs text-slate-500 mt-0.5">Review compiled media assets and provide formal authorization</p>
          </div>
          <span className="text-xs font-extrabold text-[#0F2C59] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
            {events.length} Events in Stage Queue
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading approval queue...</div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-black text-slate-800">All Catch-up Completed!</h3>
            <p className="text-xs text-slate-500">There are no events currently pending your stage review in the department queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((evt) => {
              const reelAsset = evt.mediaAssets?.find((m) => m.fileType === 'FINAL_REEL') || evt.mediaAssets?.[0];

              return (
                <div key={evt.id} className="p-6 sm:p-8 space-y-6 hover:bg-blue-50/20 transition-colors">
                  {/* Event Summary & Action */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-0.5 rounded-full border border-slate-200">
                          {evt.category}
                        </span>
                        <StatusBadge status={evt.status} size="sm" />
                      </div>

                      <h3 className="text-xl font-black text-slate-900">
                        <Link href={`/dashboard/events/${evt.id}`} className="hover:text-[#0F2C59]">
                          {evt.name}
                        </Link>
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        Organized by <strong className="text-slate-800">{evt.createdBy?.name}</strong> ({evt.createdBy?.department}) • Scheduled for{' '}
                        <strong>{new Date(evt.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> • Venue: {evt.venue}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveEvent(evt)}
                      className="px-6 py-3 bg-gradient-to-r from-[#0F2C59] to-[#162E4D] hover:from-[#162E4D] hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 font-sans"
                    >
                      <FileCheck className="w-4 h-4 text-amber-300" />
                      <span>Review & Take Action</span>
                    </button>
                  </div>

                  {/* VISUAL APPROVAL TIMELINE */}
                  <ApprovalTimeline
                    status={evt.status}
                    deanApprovedAt={evt.approvalSteps?.find((s) => s.stage === 'DEAN' && s.status === 'APPROVED')?.reviewedAt}
                    hodApprovedAt={evt.approvalSteps?.find((s) => s.stage === 'HOD' && s.status === 'APPROVED')?.reviewedAt}
                    coordinatorApprovedAt={evt.approvalSteps?.find((s) => s.stage === 'COORDINATOR' && s.status === 'APPROVED')?.reviewedAt}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REVIEW DECISION MODAL DIALOG */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#0F2C59] text-amber-300 px-3 py-1 rounded-full">
                  {userStage} Review Action
                </span>
                <h3 className="text-xl font-black text-slate-900 font-serif mt-2">{activeEvent.name}</h3>
              </div>
              <button
                onClick={() => setActiveEvent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-bold">
                {error}
              </div>
            )}

            {/* Reel Download & Stream Section */}
            {activeEvent.mediaAssets && activeEvent.mediaAssets.length > 0 ? (
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
                <span className="text-xs font-black text-amber-300 flex items-center gap-2 uppercase tracking-wider">
                  <Film className="w-4 h-4 text-amber-400" /> Compiled Final Reel Asset
                </span>
                {activeEvent.mediaAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                    <span className="text-slate-200 font-bold truncate max-w-[320px]">
                      {asset.fileName}
                    </span>
                    <a
                      href={asset.fileUrl || `/api/media/file/${asset.fileId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-black text-amber-300 hover:text-white flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Stream Reel
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 italic">
                No compiled final reel video uploaded yet.
              </div>
            )}

            {/* Comments Form */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                Reviewer Comments / Authorization Feedback <span className="text-slate-400 font-normal">(Required if rejecting)</span>
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0F2C59] focus:outline-none font-medium"
                placeholder="Provide official authorization notes or revision feedback..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDecision('REJECT')}
                disabled={submitting}
                className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-800 font-black text-xs uppercase tracking-wider rounded-xl border border-red-200 transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-red-600" /> Reject & Request Revision
              </button>

              <button
                type="button"
                onClick={() => handleDecision('APPROVE')}
                disabled={submitting}
                className="px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center gap-1.5 font-sans"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Advance Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
