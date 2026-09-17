'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  colorVariant?: 'navy' | 'gold' | 'emerald' | 'purple' | 'amber';
  delay?: number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorVariant = 'navy',
}: StatCardProps) {
  const variantStyles = {
    navy: {
      bg: 'bg-white hover:border-[#0F2C59]',
      border: 'border-slate-200',
      iconBg: 'bg-blue-50 text-[#0F2C59]',
      valColor: 'text-[#0F2C59]',
      accentLine: 'bg-[#0F2C59]',
    },
    gold: {
      bg: 'bg-white hover:border-amber-500',
      border: 'border-slate-200',
      iconBg: 'bg-amber-50 text-amber-800',
      valColor: 'text-slate-900',
      accentLine: 'bg-[#D4AF37]',
    },
    emerald: {
      bg: 'bg-white hover:border-emerald-500',
      border: 'border-slate-200',
      iconBg: 'bg-emerald-50 text-emerald-800',
      valColor: 'text-slate-900',
      accentLine: 'bg-emerald-600',
    },
    purple: {
      bg: 'bg-white hover:border-purple-500',
      border: 'border-slate-200',
      iconBg: 'bg-purple-50 text-purple-800',
      valColor: 'text-slate-900',
      accentLine: 'bg-purple-600',
    },
    amber: {
      bg: 'bg-white hover:border-amber-500',
      border: 'border-slate-200',
      iconBg: 'bg-amber-50 text-amber-800',
      valColor: 'text-slate-900',
      accentLine: 'bg-amber-500',
    },
  };

  const style = variantStyles[colorVariant] || variantStyles.navy;

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-5 border shadow-sm transition-all duration-200 ${style.bg} ${style.border}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.accentLine}`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <div className={`text-3xl sm:text-4xl font-black tracking-tight ${style.valColor}`}>
            {value}
          </div>
        </div>

        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
        <span>{subtitle}</span>
        <span className="text-[9.5px] text-slate-400">
          System Metric
        </span>
      </div>
    </div>
  );
}
