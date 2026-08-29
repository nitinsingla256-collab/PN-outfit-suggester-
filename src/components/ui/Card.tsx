/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  key?: React.Key;
  variant?: 'default' | 'elevated' | 'glass' | 'gold-accent';
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
    default: 'bg-white border border-gray-200/70 text-gray-900',
    elevated: 'bg-white border border-gray-200 text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.6)]',
    glass: 'bg-white/80 backdrop-blur-md border border-gray-200/80 text-gray-900',
    'gold-accent': 'bg-white border border-emerald-500/25 text-gray-900 shadow-[0_4px_20px_rgba(226,199,153,0.05)]',
  };

  const hoverStyle = hoverEffect
    ? 'transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 ${variantStyles[variant]} ${hoverStyle} ${className}`}
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
    <h3 className={`text-base md:text-lg font-semibold tracking-tight text-gray-900 ${className}`} {...props}>
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
    <p className={`text-xs md:text-sm text-gray-600 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}
