'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

export interface LogoProps {
  variant?: 'light' | 'dark' | 'auto' | 'gold' | 'report';
  layout?: 'full' | 'compact' | 'seal-only';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header' | 'hero' | 'login' | 'report';
  className?: string;
  showSubtitle?: boolean;
}

export default function KjitLogo({
  variant = 'auto',
  layout = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}: LogoProps) {
  const { resolvedTheme } = useTheme();

  const isDarkTheme = variant === 'light' || (variant === 'auto' && resolvedTheme === 'dark');

  // Sizing mappings for official image asset
  const heightMap: Record<string, string> = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-18 sm:h-20',
    header: 'h-[65px] sm:h-[76px]',
    hero: 'h-14 sm:h-16',
    login: 'h-12 sm:h-14',
    report: 'h-12 sm:h-14',
  };

  const imgHeight = heightMap[size] || heightMap.md;

  // Subtitle styling per variant/theme
  const subtitleInstStyle = isDarkTheme
    ? 'text-amber-400 font-extrabold'
    : 'text-[#0F2C59] font-black dark:text-amber-400';

  const subtitleDotStyle = isDarkTheme
    ? 'text-slate-400 font-bold'
    : 'text-slate-400 font-bold dark:text-slate-400';

  const subtitlePortalStyle = isDarkTheme
    ? 'text-slate-200 font-mono font-bold text-[9.5px] sm:text-[10.5px]'
    : 'text-[#003366] font-mono font-bold text-[9.5px] sm:text-[10.5px] dark:text-slate-300';

  return (
    <div className={`flex flex-col items-start gap-0.5 select-none ${className}`}>
      {/* Official Kristu Jayanti University Logo Image Asset */}
      <img
        src="/images/kjit-logo.png"
        alt="Kristu Jayanti (Deemed to be University)"
        className={`${imgHeight} w-auto max-w-full object-contain transition-all duration-300 group-hover:scale-[1.01] ${
          isDarkTheme ? 'brightness-0 invert drop-shadow-[0_1px_2px_rgba(255,255,255,0.2)]' : 'brightness-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]'
        }`}
      />

      {/* Supporting Institute & Department Badge Subtitle */}
      {showSubtitle && layout === 'full' && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] tracking-widest uppercase pl-0.5 leading-tight mt-0.5">
          <span className={`${subtitleInstStyle} font-sans`}>
            KRISTU JAYANTI INSTITUTE OF TECHNOLOGY
          </span>
          <span className={subtitleDotStyle}>·</span>
          <span className={subtitlePortalStyle}>
            MEDIA PORTAL
          </span>
        </div>
      )}
    </div>
  );
}

// Export alias for official naming convention
export const KristuJayantiLogo = KjitLogo;

