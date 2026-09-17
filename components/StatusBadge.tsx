'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase().replace(/ /g, '_');

  const configMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
    PENDING: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    REGISTERED: { label: 'Registered', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    MEDIA_ASSIGNED: { label: 'Media Assigned', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    MEDIA_UPLOADED: { label: 'Media Uploaded', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    EDITING: { label: 'Editing Reel', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    AWAITING_DEAN: { label: 'Awaiting Dean', bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200' },
    AWAITING_HOD: { label: 'Awaiting HOD', bg: 'bg-cyan-50', text: 'text-cyan-900', border: 'border-cyan-200' },
    AWAITING_COORDINATOR: { label: 'Awaiting Coordinator', bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200' },
    APPROVED: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    PUBLISHED: { label: 'Published', bg: 'bg-[#0F2C59]', text: 'text-white', border: 'border-[#0F2C59]' },
    CHANGES_REQUESTED: { label: 'Changes Requested', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    OVERDUE: { label: 'Overdue Deadline', bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200' },
  };

  const style = configMap[normalized] || {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  const sizeClasses = {
    sm: 'text-[9.5px] px-2 py-0.5 font-bold',
    md: 'text-[10.5px] px-2.5 py-0.5 font-bold',
    lg: 'text-xs px-3 py-1 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-wide uppercase ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span>{style.label}</span>
    </span>
  );
}
