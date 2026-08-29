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
    gold: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
    default: 'bg-gray-100 text-gray-800 border border-gray-300/60',
    outline: 'bg-transparent text-gray-600 border border-gray-300/70',
    subtle: 'bg-white/90 text-gray-600 border border-gray-200',
    emerald: 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40',
    rose: 'bg-rose-950/40 text-rose-300 border border-rose-800/40',
    amber: 'bg-emerald-50/40 text-emerald-400 border border-emerald-200/40',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium tracking-normal',
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
