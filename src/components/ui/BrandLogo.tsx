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
    md: 'w-8 h-8 text-sm rounded-xl',
    lg: 'w-10 h-10 text-base rounded-xl',
    xl: 'w-14 h-14 text-xl rounded-2xl',
  };

  const wordmarkSizes = {
    sm: 'text-xs tracking-[0.25em]',
    md: 'text-sm tracking-[0.28em]',
    lg: 'text-base tracking-[0.3em]',
    xl: 'text-2xl tracking-[0.32em]',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* PN Monogram */}
      <div
        className={`${monogramSizes[size]} relative flex items-center justify-center font-editorial font-bold bg-gradient-to-br from-[#F5E6CC] via-[#E2C799] to-[#9E8252] text-gray-50 shadow-[0_0_15px_rgba(226,199,153,0.25)] border border-emerald-500/40 shrink-0`}
      >
        <span className="tracking-tighter font-semibold">PN</span>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-editorial font-semibold text-gray-900 uppercase ${wordmarkSizes[size]}`}>
              PN
            </span>
          </div>
          <span className="text-[9px] text-emerald-500 tracking-[0.2em] uppercase font-mono mt-0.5">
            AI Wardrobe
          </span>
        </div>
      )}
    </div>
  );
}
