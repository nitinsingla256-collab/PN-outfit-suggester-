/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', showWordmark = true, className = '' }: BrandLogoProps) {
  const monogramSizes = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-11 h-11 text-base rounded-2xl',
    xl: 'w-16 h-16 text-2xl rounded-3xl',
  };

  const wordmarkSizes = {
    sm: 'text-xs tracking-[0.25em]',
    md: 'text-sm tracking-[0.28em]',
    lg: 'text-base tracking-[0.3em]',
    xl: 'text-2xl tracking-[0.32em]',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* PN Monogram */}
      <div
        className={`${monogramSizes[size]} relative flex items-center justify-center font-editorial font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-md border border-slate-700/80 shrink-0 group-hover:border-emerald-400 transition-colors`}
      >
        <span className="tracking-wider font-editorial italic bg-gradient-to-r from-emerald-300 via-white to-slate-200 bg-clip-text text-transparent">
          PN
        </span>
        {/* Subtle dot accent */}
        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-emerald-400 opacity-80" />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={`font-editorial font-bold text-slate-900 uppercase ${wordmarkSizes[size]}`}>
              PN
            </span>
          </div>
          <span className="text-[9px] text-emerald-700 tracking-[0.25em] uppercase font-semibold font-sans mt-0.5">
            Haute Wardrobe
          </span>
        </div>
      )}
    </div>
  );
}
