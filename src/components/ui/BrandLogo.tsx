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
    md: 'w-8 h-8 text-xs rounded-lg',
    lg: 'w-10 h-10 text-sm rounded-xl',
    xl: 'w-14 h-14 text-xl rounded-xl',
  };

  const wordmarkSizes = {
    sm: 'text-xs tracking-[0.22em]',
    md: 'text-sm tracking-[0.24em]',
    lg: 'text-base tracking-[0.26em]',
    xl: 'text-xl tracking-[0.28em]',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* PN Monogram */}
      <div
        className={`${monogramSizes[size]} relative flex items-center justify-center font-editorial font-bold bg-slate-950 dark:bg-slate-900 text-white shadow-2xs border border-slate-800/80 dark:border-slate-700/80 shrink-0 transition-colors`}
      >
        <span className="tracking-wider font-editorial italic text-slate-100">
          PN
        </span>
        {/* Subtle emerald atelier dot */}
        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-emerald-400" />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-editorial font-bold text-slate-900 dark:text-slate-100 uppercase ${wordmarkSizes[size]}`}>
              PN
            </span>
          </div>
          <span className="text-[8.5px] text-emerald-600 dark:text-emerald-400 tracking-[0.22em] uppercase font-semibold mt-1">
            Atelier &amp; Wardrobe
          </span>
        </div>
      )}
    </div>
  );
}
