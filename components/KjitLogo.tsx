'use client';

import React from 'react';

export interface LogoProps {
  variant?: 'light' | 'dark' | 'gold';
  layout?: 'full' | 'compact' | 'seal-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export default function KjitLogo({
  variant = 'light',
  layout = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}: LogoProps) {
  // Sizing mappings for official image asset
  const heightMap = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-13',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-28',
  };

  const imgHeight = heightMap[size] || heightMap.md;

  // Filter and blend adjustments
  const blendClass = variant === 'dark' ? 'invert contrast-200 brightness-0' : 'mix-blend-screen';

  return (
    <div className={`flex flex-col items-start gap-1 select-none ${className}`}>
      {/* Official Kristu Jayanti University Logo Image Asset */}
      <img
        src="/images/kjit-logo.png"
        alt="Kristu Jayanti (Deemed to be University)"
        className={`${imgHeight} w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] ${blendClass}`}
      />

      {/* Supporting Institute & Department Badge Subtitle */}
      {showSubtitle && layout === 'full' && (
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase pl-1">
          <span className="text-[#D4AF37] font-sans">
            KRISTU JAYANTI INSTITUTE OF TECHNOLOGY
          </span>
          <span className="text-slate-300 opacity-60">•</span>
          <span className="text-slate-200 opacity-90 font-mono text-[8.5px] sm:text-[9.5px]">
            MEDIA PORTAL
          </span>
        </div>
      )}
    </div>
  );
}

// Export alias for official naming convention
export const KristuJayantiLogo = KjitLogo;
