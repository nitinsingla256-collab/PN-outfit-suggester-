/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BadgeVariant = 'gold' | 'default' | 'outline' | 'subtle' | 'emerald' | 'rose' | 'amber';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  key?: React.Key;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  children?: React.ReactNode;
}

export function Badge({
  className = '',
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    gold: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80',
    outline: 'bg-transparent text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
    subtle: 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-2xs',
    emerald: 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900',
  };

  const sizeStyles = {
    sm: 'text-[9.5px] px-2 py-0.5 rounded-full font-medium tracking-wider uppercase',
    md: 'text-[11px] px-2.5 py-0.5 rounded-full font-medium tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
