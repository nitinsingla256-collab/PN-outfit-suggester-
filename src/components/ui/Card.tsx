/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  key?: React.Key;
  variant?: 'default' | 'elevated' | 'glass' | 'gold-accent' | 'luxury-dark' | 'linen';
  hoverEffect?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function Card({
  className = '',
  variant = 'default',
  hoverEffect = false,
  children,
  onClick,
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-slate-200/80 text-slate-900 shadow-2xs',
    elevated: 'bg-white border border-slate-200/80 text-slate-900 shadow-lg shadow-slate-900/5',
    glass: 'bg-white/85 backdrop-blur-xl border border-white/60 text-slate-900 shadow-sm',
    linen: 'bg-gradient-to-b from-stone-50/80 via-white to-slate-50/60 border border-stone-200/70 text-slate-900',
    'gold-accent': 'bg-white border border-emerald-500/30 text-slate-900 shadow-sm hover:border-emerald-500/50',
    'luxury-dark': 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/60 text-white shadow-xl',
  };

  const hoverStyle = hoverEffect
    ? 'transition-all duration-300 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-3xl p-6 sm:p-7 ${variantStyles[variant]} ${hoverStyle} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between mb-5 pb-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base sm:text-lg font-bold tracking-tight text-slate-900 font-editorial ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}
