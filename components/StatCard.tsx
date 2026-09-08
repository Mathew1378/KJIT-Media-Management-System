'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  delay = 0,
}: StatCardProps) {
  const variantStyles = {
    navy: {
      bg: 'bg-white hover:bg-slate-50',
      border: 'border-slate-200 hover:border-[#0F2C59]',
      iconBg: 'bg-blue-50 text-[#0F2C59]',
      valColor: 'text-[#0F2C59]',
      accentLine: 'bg-[#0F2C59]',
    },
    gold: {
      bg: 'bg-white hover:bg-amber-50/40',
      border: 'border-slate-200 hover:border-amber-400',
      iconBg: 'bg-amber-50 text-amber-700',
      valColor: 'text-amber-900',
      accentLine: 'bg-[#D4AF37]',
    },
    emerald: {
      bg: 'bg-white hover:bg-emerald-50/40',
      border: 'border-slate-200 hover:border-emerald-400',
      iconBg: 'bg-emerald-50 text-emerald-700',
      valColor: 'text-emerald-900',
      accentLine: 'bg-emerald-600',
    },
    purple: {
      bg: 'bg-white hover:bg-purple-50/40',
      border: 'border-slate-200 hover:border-purple-400',
      iconBg: 'bg-purple-50 text-purple-700',
      valColor: 'text-purple-900',
      accentLine: 'bg-purple-600',
    },
    amber: {
      bg: 'bg-white hover:bg-amber-50/50',
      border: 'border-slate-200 hover:border-amber-500',
      iconBg: 'bg-amber-100 text-amber-800',
      valColor: 'text-amber-950',
      accentLine: 'bg-amber-500',
    },
  };

  const style = variantStyles[colorVariant] || variantStyles.navy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-2xl p-6 sm:p-7 border shadow-md transition-all duration-300 group hover:-translate-y-1 ${style.bg} ${style.border}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${style.accentLine}`} />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
            {title}
          </span>
          <div className={`text-4xl sm:text-5xl font-black tracking-tight ${style.valColor}`}>
            {value}
          </div>
        </div>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110 ${style.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500 flex items-center justify-between">
        <span>{subtitle}</span>
        <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
          Real-time System Metric
        </span>
      </div>
    </motion.div>
  );
}
