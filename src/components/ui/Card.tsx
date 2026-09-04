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
    default: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 shadow-2xs',
    elevated: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 shadow-sm',
    glass: 'bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs',
    linen: 'bg-stone-50/60 dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100',
    'gold-accent': 'bg-white dark:bg-slate-900 border border-emerald-500/30 text-slate-900 dark:text-slate-100 shadow-2xs hover:border-emerald-500/50',
    'luxury-dark': 'bg-slate-950 dark:bg-slate-900 border border-slate-800 text-slate-100 shadow-md',
  };

  const hoverStyle = hoverEffect
    ? 'transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 ${variantStyles[variant]} ${hoverStyle} ${className}`}
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
    <div className={`flex items-center justify-between mb-4 pb-1 ${className}`} {...props}>
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
    <h3 className={`text-base sm:text-lg font-serif font-normal tracking-tight text-slate-900 dark:text-slate-100 ${className}`} {...props}>
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
    <p className={`text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}
