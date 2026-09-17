'use client';

import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';

export interface ApprovalTimelineProps {
  status: string;
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
      id: 'COORDINATOR',
      title: 'Program Coordinator',
      subtitle: 'Coordinator Approval Authority',
      approved: !!coordinatorApprovedAt,
      isPending: !coordinatorApprovedAt && status !== 'REJECTED',
      date: coordinatorApprovedAt,
    },
    {
      id: 'HOD',
      title: 'HOD Review',
      subtitle: 'HOD Approval Authority',
      approved: !!hodApprovedAt,
      isPending: !hodApprovedAt && status !== 'REJECTED',
      date: hodApprovedAt,
    },
    {
      id: 'DEAN',
      title: 'Dean Review',
      subtitle: 'Dean Approval Authority',
      approved: !!deanApprovedAt,
      isPending: !deanApprovedAt && status !== 'REJECTED',
      date: deanApprovedAt,
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F2C59]" />
            Institutional Approval Workflow
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Program Coordinator, HOD, and Dean possess equal approval authority. Any one approval completes authorization.
          </p>
        </div>
        <div className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-bold text-[#0F2C59] uppercase tracking-wider">
          {status === 'PUBLISHED' ? 'APPROVED / PUBLISHED' : status.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Visual Timeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((step) => {
          let cardBg = 'bg-slate-50 border-slate-200 text-slate-600';
          let badgeBg = 'bg-slate-200 text-slate-700';

          if (step.approved) {
            cardBg = 'bg-emerald-50/60 border-emerald-300 text-emerald-950';
            badgeBg = 'bg-emerald-700 text-white';
          } else if (status === 'REJECTED') {
            cardBg = 'bg-red-50/60 border-red-300 text-red-950';
            badgeBg = 'bg-red-700 text-white';
          } else {
            cardBg = 'bg-amber-50/50 border-amber-200 text-amber-950';
            badgeBg = 'bg-amber-600 text-white font-bold';
          }

          return (
            <div
              key={step.id}
              className={`rounded-lg p-4 border transition-all relative flex flex-col justify-between ${cardBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeBg}`}>
                    {step.id} Stage
                  </span>
                  {step.approved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : status === 'REJECTED' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600" />
                  )}
                </div>

                <h4 className="text-xs font-bold tracking-tight text-slate-900">{step.title}</h4>
                <p className="text-[11px] mt-0.5 leading-relaxed text-slate-500">
                  {step.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[10.5px] font-medium flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-800">
                  {step.approved
                    ? `Approved ${step.date ? `(${new Date(step.date).toLocaleDateString()})` : ''}`
                    : status === 'REJECTED'
                      ? 'Rejected'
                      : 'Pending Authorization'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-xs text-red-900 space-y-1">
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
