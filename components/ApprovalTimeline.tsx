'use client';

import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export interface ApprovalTimelineProps {
  status: string; // e.g., 'AWAITING_DEAN', 'AWAITING_HOD', 'AWAITING_COORDINATOR', 'APPROVED', 'CHANGES_REQUESTED'
  deanApprovedAt?: string | null;
  hodApprovedAt?: string | null;
  coordinatorApprovedAt?: string | null;
  rejectionReason?: string | null;
}

export default function ApprovalTimeline({
  status,
  deanApprovedAt,
  hodApprovedAt,
  coordinatorApprovedAt,
  rejectionReason,
}: ApprovalTimelineProps) {
  const steps = [
    {
      id: 'DEAN',
      title: 'Dean Review',
      subtitle: 'First Stage Review',
      approved: !!deanApprovedAt || status === 'AWAITING_HOD' || status === 'AWAITING_COORDINATOR' || status === 'APPROVED',
      isCurrent: status === 'AWAITING_DEAN',
      date: deanApprovedAt,
    },
    {
      id: 'HOD',
      title: 'HOD Review',
      subtitle: 'Second Stage Review',
      approved: !!hodApprovedAt || status === 'AWAITING_COORDINATOR' || status === 'APPROVED',
      isCurrent: status === 'AWAITING_HOD',
      date: hodApprovedAt,
    },
    {
      id: 'COORDINATOR',
      title: 'Program Coordinator',
      subtitle: 'Final Stage Approval & Publishing',
      approved: !!coordinatorApprovedAt || status === 'APPROVED',
      isCurrent: status === 'AWAITING_COORDINATOR',
      date: coordinatorApprovedAt,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F2C59]" />
            Multi-Stage Departmental Approval Workflow
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional sequential validation chain before official media archiving and report publishing.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-black text-[#0F2C59] uppercase tracking-wider">
          {status.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Visual Timeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((step, index) => {
          let cardBg = 'bg-slate-50 border-slate-200 text-slate-600';
          let badgeBg = 'bg-slate-200 text-slate-700';

          if (step.approved) {
            cardBg = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-sm';
            badgeBg = 'bg-emerald-600 text-white';
          } else if (step.isCurrent) {
            cardBg = 'bg-gradient-to-br from-[#0F2C59] to-[#162E4D] border-amber-400 text-white shadow-xl ring-2 ring-amber-400/50';
            badgeBg = 'bg-[#D4AF37] text-slate-950 font-black animate-pulse';
          } else if (status === 'CHANGES_REQUESTED' && index === 0) {
            cardBg = 'bg-red-50 border-red-300 text-red-950';
            badgeBg = 'bg-red-600 text-white';
          }

          return (
            <div
              key={step.id}
              className={`rounded-xl p-5 border transition-all relative flex flex-col justify-between ${cardBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                    Stage 0{index + 1}
                  </span>
                  {step.approved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : step.isCurrent ? (
                    <Clock className="w-5 h-5 text-amber-300 animate-spin" />
                  ) : status === 'CHANGES_REQUESTED' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>

                <h4 className="text-sm font-black tracking-tight">{step.title}</h4>
                <p className={`text-xs mt-1 leading-relaxed ${step.isCurrent ? 'text-slate-200' : 'text-slate-500'}`}>
                  {step.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/40 text-[11px] font-medium flex items-center justify-between">
                <span>Status:</span>
                <span className="font-bold">
                  {step.approved
                    ? 'Approved'
                    : step.isCurrent
                    ? 'Awaiting Review'
                    : 'Pending Stage'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-red-700">
            <XCircle className="w-4 h-4" />
            Revision Feedback from Reviewer:
          </span>
          <p className="pl-5 leading-relaxed font-medium">{rejectionReason}</p>
        </div>
      )}
    </div>
  );
}
